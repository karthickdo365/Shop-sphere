import prisma from '../config/db.js';

export const getCart = async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { position: 'asc' } }, variants: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user.id }, include: { items: true } });
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  res.json({ success: true, data: { ...cart, subtotal, totalItems } });
};

export const addItem = async (req, res) => {
  const { productId, size, color, quantity, variantId } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const priceAtAdd = product.discountPrice ?? product.basePrice;

  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

  // Existing item with same product/size/color?
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, size, color },
  });
  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return res.json({ success: true, data: updated });
  }

  const item = await prisma.cartItem.create({
    data: { cartId: cart.id, productId, variantId, size, color, quantity, priceAtAdd },
  });
  res.status(201).json({ success: true, data: item });
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    return res.json({ success: true, message: 'Item removed (quantity was 0)' });
  }
  const item = await prisma.cartItem.update({ where: { id }, data: { quantity } });
  res.json({ success: true, data: item });
};

export const removeItem = async (req, res) => {
  const { id } = req.params;
  await prisma.cartItem.delete({ where: { id } });
  res.json({ success: true, message: 'Item removed' });
};

export const clearCart = async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.json({ success: true, message: 'Cart cleared' });
};
