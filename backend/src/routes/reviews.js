import { Router } from 'express';
import * as c from '../controllers/reviews.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/reviews/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a product
 *     security: []
 */
router.get('/:productId', asyncHandler(c.listReviews));

/**
 * @openapi
 * /api/reviews/{productId}:
 *   post:
 *     tags: [Reviews]
 *     summary: Add or update a review
 */
router.post('/:productId', protect, validate(schemas.review), asyncHandler(c.addReview));

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review
 */
router.delete('/:id', protect, asyncHandler(c.deleteReview));

export default router;
