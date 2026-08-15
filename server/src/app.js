import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import menuRoutes from './modules/menu/menu.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import feedbackRoutes from './modules/feedback/feedback.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import systemRoutes from './modules/system/system.routes.js';
import { maintenanceMiddleware } from './middleware/maintenance.js';
import { optionalAuth } from './middleware/auth.js';
import summarizeRoutes from './routes/summarize.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files (like uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Security Middleware ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [env.CLIENT_URL, 'https://rasoijunction.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}));

// ─── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Maintenance Mode ──────────────────────────────────────────────────
app.use(optionalAuth);
app.use(maintenanceMiddleware);

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api', summarizeRoutes);

// ─── Health Check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rasoi Junction API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────────────────────
app.use(errorHandler);

export default app;
