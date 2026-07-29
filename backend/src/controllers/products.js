import prisma from '../config/db.js';

const PAGE_SIZE = 12;

// GET /api/products
export const listProducts = async (req, res) => {
  const {
    page = 1,
    limit = PAGE_SIZE,
    category,
    subcategory,
    size,
    color,
    minPrice,
    maxPrice,
    sort = 'newest',
    q,
    featured,
    newArrival,
    onOffer,
  } = req.query;

  const where = { AND: [] };

  if (category) {
    where.AND.push({ category: { slug: category } });
  }
  if (subcategory) {
    where.AND.push({ subcategory: { slug: subcategory } });
  }
  if (size || color) {
    where.AND.push({
      variants: {
        some: {
          ...(size && { size: { equals: size.toUpperCase() } }),
          ...(color && { color: { equals: color.toUpperCase() } }),
        },
      },
    });
  }
  if (minPrice || maxPrice) {
    where.AND.push({
      discountPrice: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  }
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (featured === 'true') where.AND.push({ isFeatured: true });
  if (newArrival === 'true') where.AND.push({ isNewArrival: true });
  if (onOffer === 'true') where.AND.push({ isOnOffer: true });

  if (where.AND.length === 0) delete where.AND;

  const orderBy = {
    newest: { createdAt: 'desc' },
    price_asc: { discountPrice: 'asc' },
    price_desc: { discountPrice: 'desc' },
    rating: { rating: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Extract distinct sizes/colors available in this result set (for filter UI)
  const sizes = new Set();
  const colors = new Set();
  items.forEach((p) =>
    p.variants.forEach((v) => {
      sizes.add(v.size);
      colors.add(v.color);
    })
  );

  res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNext: skip + take < total,
      hasPrev: Number(page) > 1,
    },
    filters: {
      sizes: Array.from(sizes),
      colors: Array.from(colors),
    },
  });
};

export const getFeatured = async (_req, res) => {
  const items = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' } }, variants: true },
  });
  res.json({ success: true, data: items });
};

export const getNewArrivals = async (_req, res) => {
  const items = await prisma.product.findMany({
    where: { isNewArrival: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' } }, variants: true },
  });
  res.json({ success: true, data: items });
};

export const getOffers = async (_req, res) => {
  const items = await prisma.product.findMany({
    where: { isOnOffer: true },
    take: 12,
    orderBy: { discountPrice: 'asc' },
    include: { images: { orderBy: { position: 'asc' } }, variants: true },
  });
  res.json({ success: true, data: items });
};

export const getProduct = async (req, res) => {
  const { slug } = req.params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      specifications: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
      category: true,
      subcategory: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
};

export const createProduct = async (req, res) => {
  console.log("BODY:");
  console.dir(req.body, { depth: null });

  const data = req.body;

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      images: data.images?.length
        ? {
            create: data.images,
          }
        : undefined,
      variants: data.variants?.length
        ? {
            create: data.variants,
          }
        : undefined,
    },
    include: {
      images: true,
      variants: true,
    },
  });

  console.log("CREATED PRODUCT:");
  console.dir(product, { depth: null });

  res.status(201).json({
    success: true,
    data: product,
  });
};
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };

  // Detach nested writes - we'll handle them separately
  const { images: newImages, variants: newVariants, ...productFields } = data;

  // Update scalar fields
  if (Object.keys(productFields).length > 0) {
    await prisma.product.update({ where: { id }, data: productFields });
  }

  // Replace images if provided
  console.log("Images received:", newImages);
  if (Array.isArray(newImages)) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
 const validImages = newImages
  .filter((img) => img && img.url)
  .map((img, i) => ({
    productId: id,
    url: img.url,
    alt: img.alt || null,
    position: img.position ?? i,
  }));

if (validImages.length > 0) {
  await prisma.productImage.createMany({
    data: validImages,
  });
} 
     }

  // Replace variants if provided
  if (Array.isArray(newVariants)) {
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    if (newVariants.length > 0) {
      await prisma.productVariant.createMany({
        data: newVariants.map((v) => ({
          productId: id,
          size: v.size,
          color: v.color,
          stock: v.stock ?? 0,
          sku: v.sku || `${id}-${v.size}-${v.color}`.toUpperCase(),
        })),
      });
    }
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' } },
      variants: true,
      specifications: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
      category: true,
    },
  });
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Product deleted' });
};

// =========================
// Admin: list products (admin view, includes variants & category)
// =========================
export const adminListProducts = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    q,
    category,
    featured,
    newArrival,
    onOffer,
  } = req.query;

  const where = { AND: [] };
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (category) where.AND.push({ category: { slug: category } });
  if (featured === 'true') where.AND.push({ isFeatured: true });
  if (newArrival === 'true') where.AND.push({ isNewArrival: true });
  if (onOffer === 'true') where.AND.push({ isOnOffer: true });
  if (where.AND.length === 0) delete where.AND;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        specifications: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
        category: true,
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};
