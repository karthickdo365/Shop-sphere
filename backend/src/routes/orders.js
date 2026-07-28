import { Router } from 'express';
import * as c from '../controllers/orders.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 */
router.post('/', validate(schemas.order), asyncHandler(c.createOrder));

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders of current user
 */
router.get('/', asyncHandler(c.listOrders));

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a single order
 */
router.get('/:id', asyncHandler(c.getOrder));

/**
 * @openapi
 * /api/orders/{id}/pay:
 *   post:
 *     tags: [Orders]
 *     summary: Mark order as paid (mock Razorpay callback)
 */
router.post('/:id/pay', asyncHandler(c.markPaid));

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an order
 */
router.post('/:id/cancel', asyncHandler(c.cancelOrder));

// =========================
// Admin: order management
// =========================
/**
 * @openapi
 * /api/orders/admin/all:
 *   get:
 *     tags: [Orders]
 *     summary: (Admin) List all orders with filters & summary stats
 */
router.get('/admin/all', requireAdmin, asyncHandler(c.adminListOrders));

/**
 * @openapi
 * /api/orders/admin/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: (Admin) Get a single order with user & address details
 */
router.get('/admin/:id', requireAdmin, asyncHandler(c.adminGetOrder));

/**
 * @openapi
 * /api/orders/admin/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: (Admin) Update order status and/or payment status
 */
router.put('/admin/:id/status', requireAdmin, asyncHandler(c.adminUpdateOrderStatus));

export default router;
