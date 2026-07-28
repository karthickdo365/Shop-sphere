import prisma from '../config/db.js';

export const listCategories = async (_req, res) => {
  const items = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      subcategories: true,
      _count: { select: { products: true } },
    },
  });
  res.json({ success: true, data: items });
};

export const getCategory = async (req, res) => {
  const { slug } = req.params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { subcategories: true },
  });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
};

export const getCategoryProducts = async (req, res) => {
  const { slug } = req.params;
  const items = await prisma.product.findMany({
    where: { category: { slug } },
    include: { images: { orderBy: { position: 'asc' } }, variants: true },
  });
  res.json({ success: true, data: items });
};

export const createCategory = async (req, res) => {
  const { name, slug, description, image } = req.body;
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = await prisma.category.create({
    data: { name, slug: finalSlug, description, image },
  });
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, image } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (description !== undefined) data.description = description;
  if (image !== undefined) data.image = image;
  const updated = await prisma.category.update({ where: { id }, data });
  res.json({ success: true, data: updated });
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id } });
  res.json({ success: true, message: 'Category deleted' });
};
