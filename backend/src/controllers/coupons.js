import prisma from '../config/db.js';

export const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await prisma.coupon.findUnique({ where: { code: code?.toUpperCase() } });
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }
  const now = new Date();
  if (coupon.startsAt > now || (coupon.endsAt && coupon.endsAt < now)) {
    return res.status(400).json({ success: false, message: 'Coupon is not active' });
  }
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      message: `Minimum order of ₹${coupon.minOrder} required for this coupon`,
    });
  }
  let discount = 0;
  if (coupon.type === 'PERCENT') {
    discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount ?? Infinity);
  } else {
    discount = coupon.value;
  }
  res.json({
    success: true,
    data: {
      code: coupon.code,
      description: coupon.description,
      discount: Math.round(discount),
      type: coupon.type,
      value: coupon.value,
    },
  });
};

export const listCoupons = async (_req, res) => {
  const items = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items });
};
