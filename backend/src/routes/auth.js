import { Router } from 'express';
import * as c from '../controllers/auth.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Created user with token
 */
router.post('/register', validate(schemas.register), asyncHandler(c.register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     security: []
 */
router.post('/login', validate(schemas.login), asyncHandler(c.login));

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 */
router.get('/me', protect, asyncHandler(c.me));

/**
 * @openapi
 * /api/auth/addresses:
 *   get:
 *     tags: [Auth]
 *     summary: List saved addresses
 */
router.get('/addresses', protect, asyncHandler(c.listAddresses));

/**
 * @openapi
 * /api/auth/addresses:
 *   post:
 *     tags: [Auth]
 *     summary: Add a new address
 */
router.post('/addresses', protect, asyncHandler(c.addAddress));

// =========================
// Password management
// =========================
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 *     security: []
 */
router.post('/forgot-password', asyncHandler(c.forgotPassword));

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a token from email
 *     security: []
 */
router.post('/reset-password', asyncHandler(c.resetPassword));

/**
 * @openapi
 * /api/auth/verify-reset-token:
 *   get:
 *     tags: [Auth]
 *     summary: Verify if a reset token is still valid
 *     security: []
 */
router.get('/verify-reset-token', asyncHandler(c.verifyResetToken));

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (when logged in)
 */
router.post('/change-password', protect, asyncHandler(c.changePassword));

// =========================
// Admin: user management
// =========================
/**
 * @openapi
 * /api/auth/admin/users:
 *   get:
 *     tags: [Auth]
 *     summary: (Admin) List all users
 */
router.get('/admin/users', protect, requireAdmin, asyncHandler(c.adminListUsers));

/**
 * @openapi
 * /api/auth/admin/users/{id}/role:
 *   put:
 *     tags: [Auth]
 *     summary: (Admin) Update a user's role
 */
router.put('/admin/users/:id/role', protect, requireAdmin, asyncHandler(c.adminUpdateUserRole));

export default router;
