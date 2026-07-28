import prisma from '../config/db.js';

// Public: list active banners for the home page carousel
export const listActiveBanners = async (_req, res) => {
  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  });
  res.json({ success: true, data: banners });
};

// Admin: list all banners (including inactive)
export const adminListBanners = async (_req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  });
  res.json({ success: true, data: banners });
};

export const getBanner = async (req, res) => {
  const { id } = req.params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, data: banner });
};

export const createBanner = async (req, res) => {
  const { title, subtitle, imageUrl, linkUrl, position, isActive, startsAt, endsAt } = req.body;
  if (!title?.trim() || !imageUrl?.trim()) {
    return res.status(400).json({ success: false, message: 'Title and image URL are required' });
  }
  const banner = await prisma.banner.create({
    data: {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || null,
      position: Number(position) || 0,
      isActive: isActive !== false,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
  });
  res.status(201).json({ success: true, data: banner });
};

export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, imageUrl, linkUrl, position, isActive, startsAt, endsAt } = req.body;
  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (subtitle !== undefined) data.subtitle = subtitle?.trim() || null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl.trim();
  if (linkUrl !== undefined) data.linkUrl = linkUrl?.trim() || null;
  if (position !== undefined) data.position = Number(position);
  if (isActive !== undefined) data.isActive = !!isActive;
  if (startsAt !== undefined) data.startsAt = startsAt ? new Date(startsAt) : null;
  if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;
  const updated = await prisma.banner.update({ where: { id }, data });
  res.json({ success: true, data: updated });
};

export const deleteBanner = async (req, res) => {
  const { id } = req.params;
  await prisma.banner.delete({ where: { id } });
  res.json({ success: true, message: 'Banner deleted' });
};

export const toggleBanner = async (req, res) => {
  const { id } = req.params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
  const updated = await prisma.banner.update({
    where: { id },
    data: { isActive: !banner.isActive },
  });
  res.json({ success: true, data: updated });
};
