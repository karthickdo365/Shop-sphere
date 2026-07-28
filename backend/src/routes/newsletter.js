import { Router } from 'express';
import * as c from '../controllers/newsletter.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * @openapi
 * /api/newsletter/subscribe:
 *   post:
 *     tags: [Newsletter]
 *     summary: Subscribe to newsletter
 *     security: []
 */
router.post('/subscribe', validate(schemas.newsletter), asyncHandler(c.subscribe));

export default router;
