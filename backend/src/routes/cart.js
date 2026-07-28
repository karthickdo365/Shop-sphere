import { Router } from 'express';
import * as c from '../controllers/cart.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current user's cart
 */
router.get('/', asyncHandler(c.getCart));

/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to cart
 */
router.post('/items', validate(schemas.cartItem), asyncHandler(c.addItem));

/**
 * @openapi
 * /api/cart/items/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 */
router.put('/items/:id', asyncHandler(c.updateItem));

/**
 * @openapi
 * /api/cart/items/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from cart
 */
router.delete('/items/:id', asyncHandler(c.removeItem));

/**
 * @openapi
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear the cart
 */
router.delete('/', asyncHandler(c.clearCart));

export default router;
