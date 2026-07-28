import { Router } from 'express';
import * as c from '../controllers/wishlist.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get user wishlist
 */
router.get('/', asyncHandler(c.getWishlist));

/**
 * @openapi
 * /api/wishlist/{productId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a product to wishlist
 */
router.post('/:productId', asyncHandler(c.toggleWishlist));

/**
 * @openapi
 * /api/wishlist/{productId}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove a product from wishlist
 */
router.delete('/:productId', asyncHandler(c.toggleWishlist));

export default router;
