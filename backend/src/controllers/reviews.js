import prisma from '../config/db.js';

export const listReviews = async (req, res) => {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: reviews });
};

export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { id: existing.id },
      data: { rating, title, comment },
    });
  } else {
    review = await prisma.review.create({
      data: { userId: req.user.id, productId, rating, title, comment },
    });
  }

  // Recompute aggregate rating
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Number(agg._avg.rating?.toFixed(1)) || 0,
      numReviews: agg._count.rating || 0,
    },
  });

  res.json({ success: true, data: review });
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;
  await prisma.review.delete({ where: { id } });
  res.json({ success: true, message: 'Review deleted' });
};
