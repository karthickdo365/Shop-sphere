import crypto from 'crypto';
import prisma from '../config/db.js';
import { sendOtpEmail } from '../services/mailer.js';
import smsService from '../services/sms.js';

const { sendOtpSms, sendOtpWhatsApp, isConfigured: smsConfigured } = smsService;

const TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 10;
const MAX_ATTEMPTS = 5;

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const normalizePhone = (p) => {
  if (!p) return null;
  let phone = p.replace(/[^\d+]/g, '');
  if (!phone.startsWith('+') && !phone.startsWith('00')) {
    // Default to India country code if 10 digits
    if (phone.length === 10) phone = `+91${phone}`;
    else phone = `+${phone}`;
  }
  if (phone.startsWith('00')) phone = `+${phone.slice(2)}`;
  return phone;
};

/**
 * Send an OTP via the requested channel.
 * Channel priority: explicit > OTP_CHANNEL env > EMAIL
 * If channel is SMS/WHATSAPP but Twilio not configured, falls back to EMAIL
 * (and the OTP is still logged to the backend console).
 */
export const sendOtp = async (req, res) => {
  const { email, phone, purpose = 'REGISTER', channel } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Determine effective channel
  let effectiveChannel = channel || process.env.OTP_CHANNEL || 'EMAIL';
  if ((effectiveChannel === 'SMS' || effectiveChannel === 'WHATSAPP')) {
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: `Phone number is required for ${effectiveChannel} channel`,
      });
    }
    if (!smsConfigured()) {
      console.warn(`[otp] ${effectiveChannel} requested but Twilio not configured — falling back to EMAIL`);
      effectiveChannel = 'EMAIL';
    }
  }

  const code = generateOtp();
  const normalizedPhone = normalizePhone(phone);

  // Invalidate previous unused OTPs for same email+purpose
  await prisma.otp.updateMany({
    where: { email, purpose, verified: false, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Create new OTP record
  const otp = await prisma.otp.create({
    data: {
      email,
      phone: normalizedPhone,
      code,
      purpose,
      channel: effectiveChannel,
      expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
    },
  });

  // Send via chosen channel
  let delivery = {};
  try {
    if (effectiveChannel === 'EMAIL') {
      await sendOtpEmail(email, code, undefined, purpose);
      delivery.email = true;
    } else if (effectiveChannel === 'SMS') {
      await sendOtpSms(normalizedPhone, code, purpose);
      delivery.sms = true;
    } else if (effectiveChannel === 'WHATSAPP') {
      await sendOtpWhatsApp(normalizedPhone, code, purpose);
      delivery.whatsapp = true;
    }
  } catch (err) {
    console.error('[otp] Delivery failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again or use a different channel.',
    });
  }

  // For dev: log the OTP so the user can see it in console
  console.log(`\n[OTP] ${purpose} OTP for ${email} via ${effectiveChannel}: ${code} (expires in ${TTL_MINUTES} min)\n`);

  res.json({
    success: true,
    message: `OTP sent via ${effectiveChannel}${effectiveChannel !== 'EMAIL' ? ` to ${normalizedPhone}` : ` to ${email}`}. Valid for ${TTL_MINUTES} minutes.`,
    data: {
      otpId: otp.id,
      channel: effectiveChannel,
      expiresAt: otp.expiresAt,
      // NOTE: We don't return the code in production. For dev/preview (no SMTP/Twilio),
      // the code is logged to backend console AND shown if NODE_ENV=development.
      ...(process.env.NODE_ENV === 'development' && { code }),
    },
  });
};

/**
 * Verify an OTP code.
 * On success, returns a token + marks OTP as verified.
 */
export const verifyOtp = async (req, res) => {
  const { email, code, purpose = "REGISTER" } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email and code are required",
    });
  }

  console.log("VERIFY BODY:", req.body);

  const otp = await prisma.otp.findFirst({
    where: {
      email,
      purpose,
      usedAt: null,
      verified: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("OTP FOUND:", otp);

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "No active OTP found. Please request a new one.",
    });
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    return res.status(400).json({
      success: false,
      message: "Too many failed attempts. Please request a new OTP.",
    });
  }

  if (otp.expiresAt < new Date()) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }

  if (otp.code !== String(code).trim()) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: {
        attempts: otp.attempts + 1,
      },
    });

    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${MAX_ATTEMPTS - otp.attempts - 1} attempts remaining.`,
    });
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: {
      verified: true,
      usedAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: "OTP verified successfully",
    data: {
      verified: true,
      email,
      purpose,
    },
  });
};
/**
 * Resend an OTP (rate-limited: min 30s between resends)
 */
export const resendOtp = async (req, res) => {
  const { email, phone, purpose = 'REGISTER', channel } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Check if a recent OTP was sent in last 30 seconds
  const recent = await prisma.otp.findFirst({
    where: { email, purpose, createdAt: { gt: new Date(Date.now() - 30 * 1000) } },
    orderBy: { createdAt: 'desc' },
  });
  if (recent) {
    return res.status(429).json({
      success: false,
      message: 'Please wait at least 30 seconds before requesting a new OTP.',
    });
  }

  // Delegate to sendOtp
  req.body = { email, phone, purpose, channel };
  return sendOtp(req, res);
};
