import prisma from '../config/db.js';

export const getWishlist = async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: { include: { images: { orderBy: { position: 'asc' } }, variants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items.map((i) => i.product) });
};

// Toggle: add if not present, remove if already in wishlist
export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return res.json({ success: true, data: { inWishlist: false } });
  }
  await prisma.wishlistItem.create({ data: { userId: req.user.id, productId } });
  res.status(201).json({ success: true, data: { inWishlist: true } });
};
