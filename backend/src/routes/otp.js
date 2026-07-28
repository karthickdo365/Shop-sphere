import { Router } from 'express';
import * as c from '../controllers/otp.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/otp/send:
 *   post:
 *     tags: [OTP]
 *     summary: Send an OTP via Email / SMS / WhatsApp
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               phone: { type: string, description: "Required if channel is SMS or WHATSAPP" }
 *               purpose: { type: string, enum: [REGISTER, LOGIN, RESET], default: REGISTER }
 *               channel: { type: string, enum: [EMAIL, SMS, WHATSAPP], description: "Defaults to OTP_CHANNEL env var or EMAIL" }
 */
router.post('/send', asyncHandler(c.sendOtp));

/**
 * @openapi
 * /api/otp/verify:
 *   post:
 *     tags: [OTP]
 *     summary: Verify an OTP code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, description: "6-digit OTP" }
 *               purpose: { type: string, enum: [REGISTER, LOGIN, RESET], default: REGISTER }
 */
router.post('/verify', asyncHandler(c.verifyOtp));

/**
 * @openapi
 * /api/otp/resend:
 *   post:
 *     tags: [OTP]
 *     summary: Resend an OTP (rate-limited: 30s between resends)
 *     security: []
 */
router.post('/resend', asyncHandler(c.resendOtp));

export default router;
