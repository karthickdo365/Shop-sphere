import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../services/mailer.js";

export const register = async (req, res) => {
  console.log("========== REGISTER ==========");
  console.log("BODY:", req.body);

  const { name, email, password } = req.body;

  console.log("EMAIL:", email);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Reuse an existing, still-valid pending verification instead of
  // deleting it — prevents double-submits / accidental resubmits from
  // invalidating a link the user already received in their inbox.
  const pending = await prisma.emailVerification.findFirst({
    where: {
      email,
      expiresAt: { gt: new Date() },
    },
  });

  let token;

  if (pending) {
    // A valid verification is already pending for this email.
    // Reuse the same token so any link already sent still works.
    token = pending.token;

    console.log("Reusing existing pending verification for:", email);
  } else {
    // No valid pending record — safe to clean up any expired/stale
    // rows and create a fresh one.
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    token = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.emailVerification.create({
      data: {
        name,
        email,
        password: hashedPassword,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const verifyUrl =
      `${process.env.BACKEND_URL}/api/email/verify?token=${token}`;

    // Send email WITHOUT blocking registration.
    // If SMTP/Brevo fails or times out, registration still succeeds.
    sendVerificationEmail(email, verifyUrl, name).catch((err) => {
      console.error("Verification email failed to send (non-blocking):", err.message);
    });
  }

  return res.status(200).json({
    success: true,
    message: "Verification link sent. Please check your email.",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  const token = signToken(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    },
  });
};

export const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

export const listAddresses = async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: addresses });
};

export const addAddress = async (req, res) => {
  const { fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({
    data: { userId: req.user.id, fullName, phone, line1, line2, city, state, pincode, isDefault: !!isDefault },
  });
  res.status(201).json({
    success: true,
    data: address,
  });
};

// =========================
// Admin endpoints
// =========================
export const adminListUsers = async (req, res) => {
  const { page = 1, limit = 20, q, role } = req.query;
  const where = { AND: [] };
  if (role) where.AND.push({ role });
  if (q) {
    where.AND.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (where.AND.length === 0) delete where.AND;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.user.count({ where }),
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

export const adminUpdateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['CUSTOMER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });
  res.json({ success: true, data: updated });
};

// =========================
// Forgot / Reset password
// =========================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // For privacy: do not reveal whether the email exists or not
  // Always return success, but only send email if user exists
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists in our system, a reset link has been sent.',
    });
  }

  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate previous tokens
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  // Store new token
  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  // Build reset URL
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // Send email
  try {
    await sendPasswordResetEmail(user.email, resetUrl, user.name);
  } catch (err) {
    console.error('Forgot password email failed:', err.message);
    // Don't leak error to client
  }

  res.json({
    success: true,
    message: 'If that email exists in our system, a reset link has been sent.',
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashed },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
  res.json({ success: true, message: 'Token is valid' });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });
  res.json({
    success: true,
    message: "Password changed successfully",
  });


 export const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  const trimmedPhone = phone?.trim() || null;

  // Prisma's phone field is @unique — check for a conflict with another user first
  if (trimmedPhone) {
    const phoneOwner = await prisma.user.findUnique({
      where: { phone: trimmedPhone },
    });
    if (phoneOwner && phoneOwner.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already linked to another account",
      });
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
        phone: trimmedPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    // Fallback in case of a race condition past the check above
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This phone number is already linked to another account",
      });
    }
    throw err;
  }
};

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
    },
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updated,
  });
};
