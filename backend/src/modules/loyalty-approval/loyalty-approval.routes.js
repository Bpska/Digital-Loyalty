import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';

const router = Router();

// ─────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────

const levelSchema = z.object({
  businessId: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  points: z.coerce.number().int().min(1).max(10000),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

const requestSchema = z.object({
  businessId: z.string().min(1),
  checkInId: z.string().optional(),
});

const approveSchema = z.object({
  levelId: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────
// Helper: verify business ownership
// ─────────────────────────────────────────────────────────────

async function assertBusinessOwner(userId, businessId) {
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: userId, deletedAt: null },
  });
  if (!business) throw new AppError('Forbidden: You do not own this business.', 403);
  return business;
}

// ─────────────────────────────────────────────────────────────
// Helper: compute today's bounds in the target timezone
// ─────────────────────────────────────────────────────────────

function getTodayBoundsInTimezone(timezone = 'Asia/Kolkata') {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const formatted = formatter.format(now);
  const [monthStr, dayStr, yearStr] = formatted.split('/');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const targetMidnightUTC = new Date(Date.UTC(year, month - 1, day));
  const tzString = targetMidnightUTC.toLocaleString('en-US', { timeZone: timezone });
  const utcString = targetMidnightUTC.toLocaleString('en-US', { timeZone: 'UTC' });
  const offset = Date.parse(tzString) - Date.parse(utcString);

  const start = new Date(targetMidnightUTC.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

// ─────────────────────────────────────────────────────────────
// LOYALTY LEVEL CRUD — Business Admin only
// ─────────────────────────────────────────────────────────────

// GET /loyalty-approval/levels/:businessId — list levels for a business
router.get(
  '/levels/:businessId',
  authenticate,
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      // Business admin can only see their own; customers and super admin can see any (for check-in display)
      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      const levels = await prisma.loyaltyLevel.findMany({
        where: { businessId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      sendSuccess(res, levels, 'Loyalty levels retrieved');
    } catch (err) { next(err); }
  }
);

// POST /loyalty-approval/levels — create a level
router.post(
  '/levels',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(levelSchema),
  async (req, res, next) => {
    try {
      const { businessId, name, description, points, sortOrder } = req.body;

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      const level = await prisma.loyaltyLevel.create({
        data: { businessId, name, description, points, sortOrder: sortOrder ?? 0 },
      });

      sendCreated(res, level, 'Loyalty level created');
    } catch (err) { next(err); }
  }
);

// PATCH /loyalty-approval/levels/:levelId — update a level
router.patch(
  '/levels/:levelId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(levelSchema.partial().omit({ businessId: true })),
  async (req, res, next) => {
    try {
      const { levelId } = req.params;

      const existing = await prisma.loyaltyLevel.findUniqueOrThrow({ where: { id: levelId } });

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, existing.businessId);
      }

      const level = await prisma.loyaltyLevel.update({
        where: { id: levelId },
        data: req.body,
      });

      sendSuccess(res, level, 'Loyalty level updated');
    } catch (err) { next(err); }
  }
);

// DELETE /loyalty-approval/levels/:levelId — delete a level
router.delete(
  '/levels/:levelId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { levelId } = req.params;

      const existing = await prisma.loyaltyLevel.findUniqueOrThrow({ where: { id: levelId } });

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, existing.businessId);
      }

      await prisma.loyaltyLevel.delete({ where: { id: levelId } });

      sendSuccess(res, null, 'Loyalty level deleted');
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// LOYALTY REQUESTS — Customer submits after check-in
// ─────────────────────────────────────────────────────────────

// POST /loyalty-approval/request — customer submits a request
router.post(
  '/request',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(requestSchema),
  async (req, res, next) => {
    try {
      const { businessId, checkInId } = req.body;
      const customerId = req.user.sub;

      // Check if business has any loyalty levels configured
      const levelsCount = await prisma.loyaltyLevel.count({ where: { businessId } });
      if (levelsCount === 0) {
        // No levels configured — silently succeed (business hasn't set up manual approval yet)
        sendSuccess(res, { sent: false, reason: 'no_levels' }, 'No loyalty levels configured for this business');
        return;
      }

      // Fetch business timezone for timezone-safe daily checks
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { timezone: true },
      });
      const timezone = business?.timezone || 'Asia/Kolkata';
      const { start: todayStart } = getTodayBoundsInTimezone(timezone);

      // Duplicate prevention: one pending request per customer per business per day
      const existingRequest = await prisma.loyaltyRequest.findFirst({
        where: {
          customerId,
          businessId,
          status: 'PENDING',
          createdAt: { gte: todayStart },
        },
      });

      if (existingRequest) {
        sendSuccess(res, { sent: true, requestId: existingRequest.id, alreadyExists: true }, 'Loyalty request already sent for today');
        return;
      }

      const request = await prisma.loyaltyRequest.create({
        data: { customerId, businessId, checkInId: checkInId || null },
      });

      sendCreated(res, { sent: true, requestId: request.id }, 'Loyalty request sent to business');
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// LOYALTY REQUESTS — Business Admin manages
// ─────────────────────────────────────────────────────────────

// GET /loyalty-approval/requests/:businessId — list pending requests for a business
router.get(
  '/requests/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      const { status = 'PENDING', limit = '50', page = '1' } = req.query;

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      const take = Math.min(parseInt(limit, 10) || 50, 100);
      const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

      const [requests, total] = await Promise.all([
        prisma.loyaltyRequest.findMany({
          where: { businessId, status: status },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            level: { select: { id: true, name: true, points: true } },
          },
        }),
        prisma.loyaltyRequest.count({ where: { businessId, status: status } }),
      ]);

      // Include customer's current points balance for context
      const requestsWithPoints = await Promise.all(
        requests.map(async (r) => {
          const cp = await prisma.customerPoints.findUnique({
            where: { customerId_businessId: { customerId: r.customerId, businessId } },
            select: { totalPoints: true, totalVisits: true },
          });
          return { ...r, customerCurrentPoints: cp?.totalPoints ?? 0, customerTotalVisits: cp?.totalVisits ?? 0 };
        })
      );

      sendSuccess(res, requestsWithPoints, 'Loyalty requests retrieved', 200, { total, page: parseInt(page), limit: take });
    } catch (err) { next(err); }
  }
);

// POST /loyalty-approval/approve/:requestId — approve a request with a selected level
router.post(
  '/approve/:requestId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(approveSchema),
  async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const { levelId } = req.body;

      // Find request
      const request = await prisma.loyaltyRequest.findUnique({
        where: { id: requestId },
        include: {
          customer: { select: { id: true, name: true } },
          business: { select: { id: true, name: true, ownerId: true } },
        },
      });

      if (!request) throw new AppError('Loyalty request not found', 404);
      if (request.status !== 'PENDING') throw new AppError(`Request is already ${request.status}`, 400);

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, request.businessId);
      }

      // Find level — must belong to same business
      const level = await prisma.loyaltyLevel.findUnique({ where: { id: levelId } });
      if (!level) throw new AppError('Loyalty level not found', 404);
      if (level.businessId !== request.businessId) {
        throw new AppError('Loyalty level does not belong to this business', 403);
      }

      // Transaction: approve request + add points + create transaction + notify customer
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update request
        const updatedRequest = await tx.loyaltyRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            levelId,
            approvedById: req.user.sub,
            approvedAt: new Date(),
          },
        });

        // 2. Upsert CustomerPoints — increment totalPoints
        await tx.customerPoints.upsert({
          where: {
            customerId_businessId: {
              customerId: request.customerId,
              businessId: request.businessId,
            },
          },
          update: { totalPoints: { increment: level.points } },
          create: {
            customerId: request.customerId,
            businessId: request.businessId,
            totalPoints: level.points,
            totalVisits: 0,
            visitStreak: 0,
          },
        });

        // 3. Create LoyaltyTransaction record
        const transaction = await tx.loyaltyTransaction.create({
          data: {
            customerId: request.customerId,
            businessId: request.businessId,
            levelId,
            points: level.points,
            requestId,
          },
        });

        // 4. Notify the customer
        await tx.notification.create({
          data: {
            userId: request.customerId,
            businessId: request.businessId,
            title: '🎉 Loyalty Points Earned!',
            body: `Congratulations! You earned ${level.points} loyalty point${level.points !== 1 ? 's' : ''} (${level.name} level) at ${request.business.name}.`,
            type: 'GENERAL',
            metadata: {
              levelId,
              levelName: level.name,
              points: level.points,
              requestId,
              businessName: request.business.name,
            },
          },
        });

        return { updatedRequest, transaction, level };
      });

      sendSuccess(res, {
        requestId,
        customerId: request.customerId,
        customerName: request.customer.name,
        levelName: result.level.name,
        pointsAwarded: result.level.points,
      }, `Approved! ${result.level.points} points awarded to ${request.customer.name}`);
    } catch (err) { next(err); }
  }
);

// POST /loyalty-approval/reject/:requestId — reject a request
router.post(
  '/reject/:requestId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { requestId } = req.params;

      const request = await prisma.loyaltyRequest.findUnique({
        where: { id: requestId },
        include: { business: { select: { ownerId: true } } },
      });

      if (!request) throw new AppError('Loyalty request not found', 404);
      if (request.status !== 'PENDING') throw new AppError(`Request is already ${request.status}`, 400);

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, request.businessId);
      }

      await prisma.loyaltyRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', approvedById: req.user.sub, approvedAt: new Date() },
      });

      sendSuccess(res, null, 'Request rejected');
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// CUSTOMER LOYALTY HISTORY
// ─────────────────────────────────────────────────────────────

// GET /loyalty-approval/history — customer's transaction history
router.get(
  '/history',
  authenticate,
  authorize(Role.CUSTOMER),
  async (req, res, next) => {
    try {
      const customerId = req.user.sub;
      const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.loyaltyTransaction.findMany({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          include: {
            business: { select: { id: true, name: true, logoUrl: true } },
            level: { select: { id: true, name: true, points: true } },
          },
        }),
        prisma.loyaltyTransaction.count({ where: { customerId } }),
      ]);

      sendSuccess(res, transactions, 'Loyalty history retrieved', 200, { total, page, limit });
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// ANALYTICS — Business Admin dashboard stats
// ─────────────────────────────────────────────────────────────

// GET /loyalty-approval/analytics/:businessId
router.get(
  '/analytics/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      // Fetch business timezone for timezone-safe daily analytics bounds
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { timezone: true },
      });
      const timezone = business?.timezone || 'Asia/Kolkata';
      const { start: todayStart } = getTodayBoundsInTimezone(timezone);

      const [pendingCount, approvedTodayCount, pointsTodayResult, levels] = await Promise.all([
        prisma.loyaltyRequest.count({ where: { businessId, status: 'PENDING' } }),
        prisma.loyaltyRequest.count({
          where: { businessId, status: 'APPROVED', approvedAt: { gte: todayStart } },
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: todayStart } },
          _sum: { points: true },
        }),
        prisma.loyaltyLevel.findMany({ where: { businessId }, orderBy: { sortOrder: 'asc' } }),
      ]);

      // Most used level today
      const levelUsagesToday = await prisma.loyaltyTransaction.groupBy({
        by: ['levelId'],
        where: { businessId, createdAt: { gte: todayStart }, levelId: { not: null } },
        _count: { levelId: true },
        orderBy: { _count: { levelId: 'desc' } },
        take: 1,
      });

      let mostUsedLevel = null;
      if (levelUsagesToday.length > 0 && levelUsagesToday[0].levelId) {
        mostUsedLevel = levels.find((l) => l.id === levelUsagesToday[0].levelId) || null;
      }

      sendSuccess(res, {
        pendingCount,
        approvedToday: approvedTodayCount,
        pointsIssuedToday: pointsTodayResult._sum.points ?? 0,
        mostUsedLevel,
        levels,
      }, 'Analytics retrieved');
    } catch (err) { next(err); }
  }
);

export default router;
