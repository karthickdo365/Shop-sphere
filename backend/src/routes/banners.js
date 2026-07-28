import { Router } from 'express';
import * as c from '../controllers/banners.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Public: list active banners (for home page)
/**
 * @openapi
 * /api/banners:
 *   get:
 *     tags: [Banners]
 *     summary: List active banners (public)
 *     security: []
 */
router.get('/', asyncHandler(c.listActiveBanners));

// Admin: full CRUD
/**
 * @openapi
 * /api/banners/admin/all:
 *   get:
 *     tags: [Banners]
 *     summary: (Admin) List all banners including inactive
 */
router.get('/admin/all', protect, requireAdmin, asyncHandler(c.adminListBanners));

/**
 * @openapi
 * /api/banners/{id}:
 *   get:
 *     tags: [Banners]
 *     summary: Get a single banner
 *     security: []
 */
router.get('/:id', asyncHandler(c.getBanner));

/**
 * @openapi
 * /api/banners:
 *   post:
 *     tags: [Banners]
 *     summary: (Admin) Create a banner
 */
router.post('/', protect, requireAdmin, asyncHandler(c.createBanner));

/**
 * @openapi
 * /api/banners/{id}:
 *   put:
 *     tags: [Banners]
 *     summary: (Admin) Update a banner
 */
router.put('/:id', protect, requireAdmin, asyncHandler(c.updateBanner));

/**
 * @openapi
 * /api/banners/{id}/toggle:
 *   patch:
 *     tags: [Banners]
 *     summary: (Admin) Toggle banner active/inactive
 */
router.patch('/:id/toggle', protect, requireAdmin, asyncHandler(c.toggleBanner));

/**
 * @openapi
 * /api/banners/{id}:
 *   delete:
 *     tags: [Banners]
 *     summary: (Admin) Delete a banner
 */
router.delete('/:id', protect, requireAdmin, asyncHandler(c.deleteBanner));

export default router;
