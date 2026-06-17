import express, { } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { morganStream } from './utils/logger.js';
import { globalRateLimiter } from './middlewares/rateLimit.middleware.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';

// ── Module Routes ─────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import businessRoutes from './modules/business/business.routes.js';
import branchRoutes from './modules/branch/branch.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import checkinRoutes from './modules/checkin/checkin.routes.js';
import loyaltyRoutes from './modules/loyalty/loyalty.routes.js';
import rewardRoutes from './modules/reward/reward.routes.js';
import couponRoutes from './modules/coupon/coupon.routes.js';
import subscriptionRoutes from './modules/subscription/subscription.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';

export function createApp() {
  const app = express();

  // ── Security headers ────────────────────────────────────────
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Needed for Swagger UI
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Swagger UI requirement
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // ── CORS ─────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [env.FRONTEND_URL];
        if (env.NODE_ENV !== 'production') {
          allowed.push(
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3004',
            'http://127.0.0.1:3004'
          );
        }
        // Dynamic check: allow matches on localhost, 127.0.0.1, or VPS IP
        const isAllowedPattern = origin && (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.includes('72.61.169.195')
        );

        if (!origin || allowed.includes(origin) || isAllowedPattern) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true, // Required for httpOnly cookie auth
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── General middleware ────────────────────────────────────────
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── HTTP request logging ──────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: morganStream }));
  }

  // ── Global rate limiter ───────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Static file serving (uploaded logos, QR images) ──────────
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  // ── API Documentation ─────────────────────────────────────────
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'DLV SaaS API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
  app.get('/api/docs.json', (_, res) => res.json(swaggerSpec));

  // ── Health check ──────────────────────────────────────────────
  app.get('/health', (_, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // ── API Routes ────────────────────────────────────────────────
  const api = express.Router();

  api.use('/auth', authRoutes);
  api.use('/admin', adminRoutes);
  api.use('/businesses', businessRoutes);
  api.use('/branches', branchRoutes);
  api.use('/customer', customerRoutes);
  api.use('/checkins', checkinRoutes);
  api.use('/loyalty', loyaltyRoutes);
  api.use('/rewards', rewardRoutes);
  api.use('/coupons', couponRoutes);
  api.use('/subscriptions', subscriptionRoutes);
  api.use('/analytics', analyticsRoutes);
  api.use('/notifications', notificationRoutes);

  app.use('/api/v1', api);

  // ── 404 and Error handlers ────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
