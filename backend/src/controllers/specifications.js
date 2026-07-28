import prisma from '../config/db.js';

// POST /api/products/:id/specifications
// Body: { specifications: [{ section, key, value }] }
// (also accepts a single object)
export const setSpecifications = async (req, res) => {
  const { id } = req.params;
  const { specifications } = req.body;

  if (!Array.isArray(specifications)) {
    return res.status(400).json({
      success: false,
      message: 'specifications must be an array of { section, key, value } objects',
    });
  }

  // Validate
  for (const s of specifications) {
    if (!s.section || !s.key || !s.value) {
      return res.status(400).json({
        success: false,
        message: 'Each specification must have section, key, and value',
      });
    }
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Replace all specifications (atomic)
  await prisma.productSpecification.deleteMany({ where: { productId: id } });
  if (specifications.length > 0) {
    await prisma.productSpecification.createMany({
      data: specifications.map((s, i) => ({
        productId: id,
        section: s.section.trim(),
        key: s.key.trim(),
        value: s.value.trim(),
        position: s.position ?? i,
      })),
    });
  }

  const updated = await prisma.productSpecification.findMany({
    where: { productId: id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({ success: true, data: updated });
};

// GET /api/products/:id/specifications
export const getSpecifications = async (req, res) => {
  const { id } = req.params;
  const specs = await prisma.productSpecification.findMany({
    where: { productId: id },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({ success: true, data: specs });
};

// PUT /api/products/specifications/:id
// Body: { section, key, value } (any subset)
export const updateSpecification = async (req, res) => {
  const { id } = req.params;
  const { section, key, value, position } = req.body;
  const data = {};
  if (section !== undefined) data.section = section.trim();
  if (key !== undefined) data.key = key.trim();
  if (value !== undefined) data.value = value.trim();
  if (position !== undefined) data.position = Number(position);

  const updated = await prisma.productSpecification.update({
    where: { id },
    data,
  });
  res.json({ success: true, data: updated });
};

// DELETE /api/products/specifications/:id
export const deleteSpecification = async (req, res) => {
  const { id } = req.params;
  await prisma.productSpecification.delete({ where: { id } });
  res.json({ success: true, message: 'Specification deleted' });
};
