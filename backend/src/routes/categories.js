import { Router } from 'express';
import * as c from '../controllers/categories.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     security: []
 */
router.get('/', asyncHandler(c.listCategories));

/**
 * @openapi
 * /api/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by slug with its subcategories
 *     security: []
 */
router.get('/:slug', asyncHandler(c.getCategory));

/**
 * @openapi
 * /api/categories/{slug}/products:
 *   get:
 *     tags: [Categories]
 *     summary: Get products of a category
 *     security: []
 */
router.get('/:slug/products', asyncHandler(c.getCategoryProducts));

/**
 * @openapi
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin)
 */
router.post('/', protect, requireAdmin, asyncHandler(c.createCategory));

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (admin)
 */
router.put('/:id', protect, requireAdmin, asyncHandler(c.updateCategory));

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin)
 */
router.delete('/:id', protect, requireAdmin, asyncHandler(c.deleteCategory));

export default router;
