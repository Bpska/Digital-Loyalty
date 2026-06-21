import { Router } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.js';

const router = Router();

// ── File upload config (logo) ─────────────────────────────────
const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve(env.UPLOAD_DIR, 'logos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage: logoStorage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// ── Schemas ───────────────────────────────────────────────────
const createBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  planId: z.string().optional(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  whatsappUrl: z.string().optional().nullable(),
  googleReviewUrl: z.string().optional().nullable(),
});

const updateBusinessSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  planId: z.string().optional(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  whatsappUrl: z.string().optional().nullable(),
  googleReviewUrl: z.string().optional().nullable(),
});

// ── Routes ────────────────────────────────────────────────────

// Super Admin: create a business (on behalf of a user)
router.post(
  '/',
  authenticate,
  authorize(Role.SUPER_ADMIN),
  validate(createBusinessSchema.extend({ ownerId: z.string() })),
  auditLog('BUSINESS_CREATED', 'Business'),
  async (req, res, next) => {
    try {
      const { ownerId, ...data } = req.body;
      const business = await prisma.$transaction(async (tx) => {
        const b = await tx.business.create({
          data: { ...data, ownerId },
          include: { owner: { select: { id: true, name: true, phone: true } }, plan: true },
        });

        const branchId = `br-${Date.now()}`;
        const qrToken = require('crypto').randomBytes(32).toString('hex');

        await tx.branch.create({
          data: {
            id: branchId,
            name: `${b.name} Main Branch`,
            address: b.address || 'Main Address',
            latitude: 20.2961, // default Bhubaneswar lat
            longitude: 85.8245, // default Bhubaneswar lng
            radiusMeters: 50,
            qrToken,
            businessId: b.id,
          },
        });

        return b;
      });

      sendCreated(res, business, 'Business created with default branch');
    } catch (err) {
      next(err);
    }
  }
);

// Get a specific business (owner or SUPER_ADMIN)
router.get('/:businessId', authenticate, async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: { id: req.params.businessId, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
        plan: true,
        subscription: true,
        _count: { select: { branches: true, staff: true } },
      },
    });
    if (!business) throw new AppError('Business not found', 404);

    // RBAC: only owner, their staff, or SUPER_ADMIN can view
    if (
      req.user.role !== Role.SUPER_ADMIN &&
      business.ownerId !== req.user.sub
    ) {
      throw new AppError('Forbidden', 403);
    }
    sendSuccess(res, business);
  } catch (err) {
    next(err);
  }
});

// Update business profile (owner or SUPER_ADMIN)
router.patch(
  '/:businessId',
  authenticate,
  requireSameBusiness,
  validate(updateBusinessSchema),
  auditLog('BUSINESS_UPDATED', 'Business'),
  async (req, res, next) => {
    try {
      const business = await prisma.business.update({
        where: { id: req.params.businessId, deletedAt: null },
        data: req.body,
        include: { plan: true },
      });
      sendSuccess(res, business, 'Business updated');
    } catch (err) {
      next(err);
    }
  }
);

// Upload logo
router.post(
  '/:businessId/logo',
  authenticate,
  requireSameBusiness,
  upload.single('logo'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      await prisma.business.update({
        where: { id: req.params.businessId },
        data: { logoUrl },
      });
      sendSuccess(res, { logoUrl }, 'Logo uploaded');
    } catch (err) {
      next(err);
    }
  }
);

// List customers for a business
router.get(
  '/:businessId/customers',
  authenticate,
  authorize(Role.SUPER_ADMIN, Role.BUSINESS_ADMIN),
  requireSameBusiness,
  async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const [points, total] = await Promise.all([
        prisma.customerPoints.findMany({
          where: {
            businessId: req.params.businessId,
            ...(search && {
              customer: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search } },
                ],
              },
            }),
          },
          skip,
          take: limit,
          orderBy: { totalVisits: 'desc' },
          include: {
            customer: {
              select: { id: true, name: true, phone: true, createdAt: true },
            },
          },
        }),
        prisma.customerPoints.count({ where: { businessId: req.params.businessId } }),
      ]);

      sendSuccess(res, points, 'Customers retrieved', 200, buildPaginationMeta(page, limit, total));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
