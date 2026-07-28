import { Router } from 'express';
import * as c from '../controllers/products.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products with optional filters
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Category slug
 *       - in: query
 *         name: subcategory
 *         schema: { type: string }
 *       - in: query
 *         name: size
 *         schema: { type: string }
 *       - in: query
 *         name: color
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, price_asc, price_desc, rating] }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: newArrival
 *         schema: { type: boolean }
 *       - in: query
 *         name: onOffer
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
router.get('/', asyncHandler(c.listProducts));

/**
 * @openapi
 * /api/products/featured:
 *   get:
 *     tags: [Products]
 *     summary: Get featured products
 *     security: []
 */
router.get('/featured', asyncHandler(c.getFeatured));

/**
 * @openapi
 * /api/products/new-arrivals:
 *   get:
 *     tags: [Products]
 *     summary: Get new arrivals
 *     security: []
 */
router.get('/new-arrivals', asyncHandler(c.getNewArrivals));

/**
 * @openapi
 * /api/products/offers:
 *   get:
 *     tags: [Products]
 *     summary: Get products on offer
 *     security: []
 */
router.get('/offers', asyncHandler(c.getOffers));

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by slug
 *     security: []
 */
router.get('/:slug', asyncHandler(c.getProduct));

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin)
 */
router.post('/', protect, requireAdmin, validate(schemas.product), asyncHandler(c.createProduct));

/**
 * @openapi
 * /api/products/admin/all:
 *   get:
 *     tags: [Products]
 *     summary: (Admin) List products with category & variants included
 */
router.get('/admin/all', protect, requireAdmin, asyncHandler(c.adminListProducts));

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin)
 */
router.put('/:id', protect, requireAdmin, asyncHandler(c.updateProduct));

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin)
 */
router.delete('/:id', protect, requireAdmin, asyncHandler(c.deleteProduct));

export default router;
