import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import couponRoutes from './routes/coupons.js';
import newsletterRoutes from './routes/newsletter.js';
import uploadRoutes from './routes/uploads.js';
import specificationRoutes from './routes/specifications.js';
import otpRoutes from './routes/otp.js';
import bannerRoutes from './routes/banners.js';
import swaggerSpec from './docs/swagger.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

import contactRoutes from "./routes/contact.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// =========================
// Global middleware
// =========================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limit API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// =========================
// Health
// =========================
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// =========================
// API routes
// =========================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', specificationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/banners', bannerRoutes);
app.use("/api/contact", contactRoutes);

// =========================
// Swagger UI
// =========================
import swaggerUi from 'swagger-ui-express';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EN3 Fashions API Docs',
}));

// =========================
// Error handling
// =========================
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  ShopSphere API Server`);
  console.log(`========================================`);
  console.log(`  Server:   http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log(`  Swagger:  http://localhost:${PORT}/api/docs`);
  console.log(`  Env:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`  SMTP:     ${process.env.SMTP_HOST ? 'configured' : 'not configured (emails will be logged)'}`);
  console.log(`========================================\n`);
});

export default app;
