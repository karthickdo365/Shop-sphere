import { Router } from 'express';
import * as c from '../controllers/coupons.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate a coupon against an order subtotal
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, subtotal]
 *             properties:
 *               code: { type: string }
 *               subtotal: { type: number }
 */
router.post('/validate', asyncHandler(c.validateCoupon));

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: List active coupons
 *     security: []
 */
router.get('/', asyncHandler(c.listCoupons));

export default router;
