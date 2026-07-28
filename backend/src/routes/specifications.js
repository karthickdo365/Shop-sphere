import { Router } from 'express';
import * as c from '../controllers/specifications.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/products/{id}/specifications:
 *   get:
 *     tags: [Specifications]
 *     summary: List specifications for a product
 *     security: []
 */
router.get('/products/:id/specifications', asyncHandler(c.getSpecifications));

/**
 * @openapi
 * /api/products/{id}/specifications:
 *   post:
 *     tags: [Specifications]
 *     summary: Replace all specifications for a product (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section: { type: string, example: "Display" }
 *                     key: { type: string, example: "Size" }
 *                     value: { type: string, example: "6.7 inch" }
 */
router.post('/products/:id/specifications', protect, requireAdmin, asyncHandler(c.setSpecifications));

/**
 * @openapi
 * /api/products/specifications/{id}:
 *   put:
 *     tags: [Specifications]
 *     summary: Update a single specification (admin)
 */
router.put('/products/specifications/:id', protect, requireAdmin, asyncHandler(c.updateSpecification));

/**
 * @openapi
 * /api/products/specifications/{id}:
 *   delete:
 *     tags: [Specifications]
 *     summary: Delete a single specification (admin)
 */
router.delete('/products/specifications/:id', protect, requireAdmin, asyncHandler(c.deleteSpecification));

export default router;
