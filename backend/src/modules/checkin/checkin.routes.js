import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { checkinRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { processCheckIn, redeemReward } from './checkin.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { z } from 'zod';

const router = Router();

const checkInSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deviceId: z.string().uuid().optional(),
});

const redeemSchema = z.object({
  redemptionCode: z.string().min(1),
});

/**
 * @swagger
 * /checkins:
 *   post:
 *     tags: [CheckIn]
 *     summary: Process a customer QR check-in with GPS validation
 *     description: |
 *       Validates QR token, GPS location, and cooldown.
 *       On success, awards points and evaluates loyalty program thresholds.
 */
router.post(
  '/',
  authenticate,
  authorize(Role.CUSTOMER),
  checkinRateLimiter,
  validate(checkInSchema),
  async (req, res, next) => {
    try {
      const result = await processCheckIn({
        customerId: req.user.sub,
        ...req.body,
        ipAddress: req.socket.remoteAddress,
      });
      sendSuccess(res, result, 'Check-in successful! Points have been added.');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /checkins/redeem:
 *   post:
 *     tags: [CheckIn]
 *     summary: Redeem a customer reward (Staff only)
 */
router.post(
  '/redeem',
  authenticate,
  authorize(Role.STAFF),
  validate(redeemSchema),
  async (req, res, next) => {
    try {
      const staff = await import('../../config/prisma.js').then(m =>
        m.default.staff.findUniqueOrThrow({ where: { userId: req.user.sub } })
      );
      const result = await redeemReward(
        req.body.redemptionCode,
        staff.id,
        staff.businessId
      );
      sendSuccess(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /checkins/history:
 *   get:
 *     tags: [CheckIn]
 *     summary: Get customer's check-in history
 */
router.get(
  '/history',
  authenticate,
  authorize(Role.CUSTOMER),
  async (req, res, next) => {
    try {
      const prisma = (await import('../../config/prisma.js')).default;
      const { parsePagination, buildPaginationMeta } = await import('../../utils/pagination.js');
      const { page, limit, skip } = parsePagination(req.query);

      const [checkIns, total] = await Promise.all([
        prisma.checkIn.findMany({
          where: { customerId: req.user.sub, status: 'VALID' },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            business: { select: { id: true, name: true, logoUrl: true } },
            branch: { select: { id: true, name: true, address: true } },
          },
        }),
        prisma.checkIn.count({ where: { customerId: req.user.sub, status: 'VALID' } }),
      ]);

      sendSuccess(res, checkIns, 'Check-in history', 200, buildPaginationMeta(page, limit, total));
    } catch (err) {
      next(err);
    }
  }
);

// Get recent check-ins for a business (owner or staff)
router.get(
  '/business/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.STAFF, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      const prisma = (await import('../../config/prisma.js')).default;
      const { parsePagination, buildPaginationMeta } = await import('../../utils/pagination.js');
      const { page, limit, skip } = parsePagination(req.query);

      // Verify business ownership/access if not super admin
      if (req.user.role !== Role.SUPER_ADMIN && req.user.businessId !== businessId) {
        if (req.user.role === Role.BUSINESS_ADMIN) {
          const owned = await prisma.business.findFirst({
            where: { id: businessId, ownerId: req.user.sub },
          });
          if (!owned) throw new AppError('Forbidden', 403);
        } else {
          throw new AppError('Forbidden', 403);
        }
      }

      const [checkIns, total] = await Promise.all([
        prisma.checkIn.findMany({
          where: { businessId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            branch: { select: { id: true, name: true } },
          },
        }),
        prisma.checkIn.count({ where: { businessId } }),
      ]);

      sendSuccess(res, checkIns, 'Business check-ins retrieved', 200, buildPaginationMeta(page, limit, total));
    } catch (err) { next(err); }
  }
);

// Update check-in status (e.g. VALID, SUSPICIOUS, REJECTED) — Business Owner or Super Admin only
router.patch(
  '/:checkInId/status',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(z.object({ status: z.enum(['VALID', 'SUSPICIOUS', 'REJECTED']) })),
  async (req, res, next) => {
    try {
      const { checkInId } = req.params;
      const { status } = req.body;
      const prisma = (await import('../../config/prisma.js')).default;

      // Find the check-in and verify ownership
      const checkIn = await prisma.checkIn.findUniqueOrThrow({
        where: { id: checkInId },
        include: { business: true }
      });

      if (req.user.role !== Role.SUPER_ADMIN && checkIn.business.ownerId !== req.user.sub) {
        throw new AppError('Forbidden: You do not own this business.', 403);
      }

      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: checkInId },
        data: { status },
      });

      sendSuccess(res, updatedCheckIn, `Check-in status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
