import prisma from '../config/db.js';

export const subscribe = async (req, res) => {
  const { email } = req.body;
  const existing = await prisma.newsletter.findUnique({ where: { email } });
  if (existing) {
    return res.json({ success: true, message: 'You are already subscribed' });
  }
  await prisma.newsletter.create({ data: { email } });
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
};
