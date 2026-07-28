import prisma from '../config/db.js';

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SS-${ts}-${rand}`;
};

export const createOrder = async (req, res) => {
  const { items, addressId, paymentMethod = 'RAZORPAY', couponCode } = req.body;

  // Validate payment method
  if (!['RAZORPAY', 'COD'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method. Use RAZORPAY or COD.' });
  }

  // COD orders above ₹5000 not allowed (safety)
  if (paymentMethod === 'COD') {
    let prelimTotal = 0;
    for (const item of items) {
      const p = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!p) return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      prelimTotal += (p.discountPrice ?? p.basePrice) * item.quantity;
    }
    if (prelimTotal > 5000) {
      return res.status(400).json({ success: false, message: 'Cash on Delivery is only available for orders up to ₹5000. Please use online payment.' });
    }
  }

  // Validate products & compute subtotal
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
    const price = product.discountPrice ?? product.basePrice;
    subtotal += price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price,
      image: (await prisma.productImage.findFirst({ where: { productId: product.id }, orderBy: { position: 'asc' } }))?.url,
    });
  }

  // Coupon
  let discount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && subtotal >= coupon.minOrder && (!coupon.endsAt || coupon.endsAt > new Date())) {
      if (coupon.type === 'PERCENT') {
        discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity);
      } else {
        discount = coupon.value;
      }
    }
  }

  const shipping = subtotal >= 999 ? 0 : 49;
  const tax = 0; // GST is included in the listed price
  const codCharge = paymentMethod === 'COD' ? 0 : 0; // Free COD (could be ₹49)
  const total = Math.max(0, subtotal - discount) + shipping + tax + codCharge;

  // For COD: order is confirmed but payment is PENDING (collect on delivery)
  // For RAZORPAY: order is PENDING until payment is verified
  const initialStatus = paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING';
  const initialPaymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PENDING';

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      addressId: addressId || null,
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  // Clear the cart after order
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  res.status(201).json({ success: true, data: order });
};

export const listOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  res.json({ success: true, data: orders });
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { id, userId: req.user.id },
    include: { items: true, address: true },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

export const markPaid = async (req, res) => {
  const { id } = req.params;
  const { razorpayPaymentId, razorpaySignature } = req.body;
  const order = await prisma.order.findFirst({ where: { id, userId: req.user.id } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const updated = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      razorpayPaymentId,
      razorpaySignature,
    },
  });
  res.json({ success: true, data: updated });
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({ where: { id, userId: req.user.id } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
  }
  const updated = await prisma.order.update({
    where: { id },
    data: { status: 'CANCELLED', paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED' },
  });
  res.json({ success: true, data: updated });
};

// =========================
// Admin endpoints
// =========================
export const adminListOrders = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    q,
  } = req.query;

  const where = { AND: [] };
  if (status) where.AND.push({ status });
  if (paymentStatus) where.AND.push({ paymentStatus });
  if (q) {
    where.AND.push({
      OR: [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }
  if (where.AND.length === 0) delete where.AND;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  // Summary stats
  const agg = await prisma.order.aggregate({
    _sum: { total: true },
    _count: { id: true },
  });
  const paidAgg = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { total: true },
    _count: { id: true },
  });
  const pendingCount = await prisma.order.count({ where: { status: 'PENDING' } });

  res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    stats: {
      totalRevenue: agg._sum.total || 0,
      totalOrders: agg._count.id || 0,
      paidRevenue: paidAgg._sum.total || 0,
      paidOrders: paidAgg._count.id || 0,
      pendingOrders: pendingCount,
    },
  });
};

export const adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
  const validPayments = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

  const data = {};
  if (status && validStatuses.includes(status)) data.status = status;
  if (paymentStatus && validPayments.includes(paymentStatus)) data.paymentStatus = paymentStatus;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  res.json({ success: true, data: updated });
};

export const adminGetOrder = async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
    },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};
