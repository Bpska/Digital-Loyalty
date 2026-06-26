import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role, LoyaltyResetMode } from '@prisma/client';
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
  levelId: z.string().optional(),
  spendAmount: z.coerce.number().positive().optional(),
});

async function unlockCustomerReward(tx, customerId, program) {
  const settings = await tx.loyaltyProgramSettings.findUnique({
    where: { businessId: program.businessId },
  });
  const validityDays = settings ? settings.validityDays : 30;

  const customerReward = await tx.customerReward.create({
    data: {
      customerId,
      rewardId: program.rewardId,
      status: 'UNLOCKED',
      expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
    },
  });

  return {
    id: customerReward.id,
    title: program.reward.title,
    redemptionCode: customerReward.redemptionCode,
  };
}

// ─────────────────────────────────────────────────────────────
// Helper: verify business ownership
// ─────────────────────────────────────────────────────────────

async function assertBusinessOwner(userId, businessId) {
  if (!businessId || businessId === 'null' || businessId === 'undefined') {
    throw new AppError('Invalid business ID', 400);
  }
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

      // Check current loyalty configuration for this business
      const [levelsCount, spendProgram, existingSettings] = await Promise.all([
        prisma.loyaltyLevel.count({ where: { businessId } }),
        prisma.loyaltyProgram.findFirst({ where: { businessId, type: 'SPEND_BASED', isActive: true } }),
        prisma.loyaltyProgramSettings.findUnique({ where: { businessId } }),
      ]);

      const hasAnyLoyaltyConfig = levelsCount > 0 || !!spendProgram || !!existingSettings;

      if (!hasAnyLoyaltyConfig) {
        // Auto-create default hybrid settings so the admin can approve via hybrid mode
        await prisma.loyaltyProgramSettings.create({
          data: {
            businessId,
            programName: 'Loyalty Rewards',
            pointsPerRupee: 0.1,
            pointsPerStamp: 50,
            requiredStamps: 7,
            rewardName: 'Special Reward',
            validityDays: 30,
          },
        }).catch(() => {}); // Ignore unique-constraint error on race condition
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
            loyaltyTransaction: { select: { points: true } },
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

      // Check if business has an active SPEND_BASED program
      const spendProgram = await prisma.loyaltyProgram.findFirst({
        where: { businessId: request.businessId, type: 'SPEND_BASED', isActive: true },
        include: { reward: true },
      });

      let points = 0;
      let level = null;
      const spendAmount = req.body.spendAmount;

      if (spendProgram) {
        if (spendAmount === undefined || spendAmount === null) {
          throw new AppError('Purchase amount is required for spend-based loyalty programs.', 400);
        }
        const amt = parseFloat(spendAmount);
        if (isNaN(amt) || amt <= 0) {
          throw new AppError('Invalid purchase amount.', 400);
        }
        points = Math.floor(amt * spendProgram.pointsPerSpendUnit);
      } else {
        // Fallback to levels
        const { levelId } = req.body;
        if (!levelId) {
          throw new AppError('Loyalty level is required.', 400);
        }
        level = await prisma.loyaltyLevel.findUnique({ where: { id: levelId } });
        if (!level) throw new AppError('Loyalty level not found', 404);
        if (level.businessId !== request.businessId) {
          throw new AppError('Loyalty level does not belong to this business', 403);
        }
        points = level.points;
      }

      // Transaction: approve request + add points + create transaction + notify customer + check unlock
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update request
        const updatedRequest = await tx.loyaltyRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            levelId: level ? level.id : null,
            spendAmount: spendAmount ? parseFloat(spendAmount) : null,
            approvedById: req.user.sub,
            approvedAt: new Date(),
          },
        });

        // 2. Upsert CustomerPoints — increment totalPoints
        const cp = await tx.customerPoints.upsert({
          where: {
            customerId_businessId: {
              customerId: request.customerId,
              businessId: request.businessId,
            },
          },
          update: { totalPoints: { increment: points } },
          create: {
            customerId: request.customerId,
            businessId: request.businessId,
            totalPoints: points,
            totalVisits: 0,
            visitStreak: 0,
          },
        });

        // 3. Create LoyaltyTransaction record
        const transaction = await tx.loyaltyTransaction.create({
          data: {
            customerId: request.customerId,
            businessId: request.businessId,
            levelId: level ? level.id : null,
            points: points,
            requestId,
            spendAmount: spendAmount ? parseFloat(spendAmount) : null,
          },
        });

        // 4. If spend-based, check reward threshold
        // NOTE: cp.totalPoints already reflects the post-increment value after upsert
        let newlyUnlockedReward = null;
        const currentPoints = cp.totalPoints;

        if (spendProgram && currentPoints >= spendProgram.threshold) {
          newlyUnlockedReward = await unlockCustomerReward(tx, request.customerId, spendProgram);

          // Deduct points
          const deductMode =
            spendProgram.resetMode === LoyaltyResetMode.FULL_RESET
              ? 0
              : currentPoints - spendProgram.threshold;

          await tx.customerPoints.update({
            where: { customerId_businessId: { customerId: request.customerId, businessId: request.businessId } },
            data: { totalPoints: deductMode },
          });
        }

        // 5. Notify the customer
        const notifBody = newlyUnlockedReward
          ? `🎉 You've earned: ${newlyUnlockedReward.title}! Show your redemption code at the counter.`
          : spendProgram
            ? `Congratulations! You earned ${points} loyalty points (spent ₹${spendAmount}) at ${request.business.name}.`
            : `Congratulations! You earned ${points} loyalty points (${level.name} level) at ${request.business.name}.`;

        await tx.notification.create({
          data: {
            userId: request.customerId,
            businessId: request.businessId,
            title: newlyUnlockedReward ? 'Reward Unlocked! 🎉' : '🎉 Loyalty Points Earned!',
            body: notifBody,
            type: newlyUnlockedReward ? 'REWARD_UNLOCKED' : 'GENERAL',
            metadata: {
              levelId: level ? level.id : null,
              levelName: level ? level.name : null,
              points,
              requestId,
              businessName: request.business.name,
              spendAmount: spendAmount ? parseFloat(spendAmount) : null,
              rewardId: newlyUnlockedReward ? newlyUnlockedReward.id : null,
            },
          },
        });

        return { updatedRequest, transaction, level, newlyUnlockedReward };
      });

      sendSuccess(res, {
        requestId,
        customerId: request.customerId,
        customerName: request.customer.name,
        levelName: result.level ? result.level.name : 'Spend-based',
        pointsAwarded: points,
        newlyUnlockedReward: result.newlyUnlockedReward,
      }, `Approved! ${points} points awarded to ${request.customer.name}`);
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

      const [pendingCount, approvedTodayCount, pointsTodayResult, levels, activeProgram] = await Promise.all([
        prisma.loyaltyRequest.count({ where: { businessId, status: 'PENDING' } }),
        prisma.loyaltyRequest.count({
          where: { businessId, status: 'APPROVED', approvedAt: { gte: todayStart } },
        }),
        prisma.loyaltyTransaction.aggregate({
          where: { businessId, createdAt: { gte: todayStart } },
          _sum: { points: true },
        }),
        prisma.loyaltyLevel.findMany({ where: { businessId }, orderBy: { sortOrder: 'asc' } }),
        prisma.loyaltyProgram.findFirst({
          where: { businessId, isActive: true },
          include: { reward: true },
        }),
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
        activeProgram,
      }, 'Analytics retrieved');
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// HYBRID LOYALTY PROGRAM SETTINGS
// ─────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  programName: z.string().min(1),
  pointsPerRupee: z.coerce.number().positive(),
  pointsPerStamp: z.coerce.number().int().positive(),
  requiredStamps: z.coerce.number().int().positive(),
  rewardName: z.string().min(1),
  validityDays: z.coerce.number().int().positive(),
});

// GET /loyalty-approval/settings/:businessId — retrieve program settings
router.get(
  '/settings/:businessId',
  authenticate,
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      let settings = await prisma.loyaltyProgramSettings.findUnique({
        where: { businessId },
      });

      if (!settings) {
        settings = {
          programName: 'Coffee Rewards',
          pointsPerRupee: 0.1,
          pointsPerStamp: 50,
          requiredStamps: 7,
          rewardName: 'Free Coffee',
          validityDays: 30,
          businessId,
        };
      }

      sendSuccess(res, settings, 'Loyalty program settings retrieved');
    } catch (err) { next(err); }
  }
);

// POST /loyalty-approval/settings/:businessId — save program settings
router.post(
  '/settings/:businessId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(settingsSchema),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;

      if (req.user.role === Role.BUSINESS_ADMIN) {
        await assertBusinessOwner(req.user.sub, businessId);
      }

      const settings = await prisma.loyaltyProgramSettings.upsert({
        where: { businessId },
        update: req.body,
        create: { ...req.body, businessId },
      });

      sendSuccess(res, settings, 'Loyalty program settings saved');
    } catch (err) { next(err); }
  }
);

// ─────────────────────────────────────────────────────────────
// WALLET-BASED APPROVAL AND REDEMPTION
// ─────────────────────────────────────────────────────────────

const approveWalletSchema = z.object({
  purchaseValue: z.coerce.number().positive(),
});

// POST /loyalty-approval/approve-wallet/:requestId — approve with a purchase value
router.post(
  '/approve-wallet/:requestId',
  authenticate,
  authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN),
  validate(approveWalletSchema),
  async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const { purchaseValue } = req.body;

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

      // Load business settings
      let settings = await prisma.loyaltyProgramSettings.findUnique({
        where: { businessId: request.businessId },
      });

      if (!settings) {
        // Create defaults if not configured
        settings = await prisma.loyaltyProgramSettings.create({
          data: {
            businessId: request.businessId,
            programName: 'Coffee Rewards',
            pointsPerRupee: 0.1,
            pointsPerStamp: 50,
            requiredStamps: 7,
            rewardName: 'Free Coffee',
            validityDays: 30,
          },
        });
      }

      const pointsEarned = Math.floor(purchaseValue * settings.pointsPerRupee);

      const result = await prisma.$transaction(async (tx) => {
        // Ensure CustomerPoints exists and increment points so dashboard shows correct balance
        await tx.customerPoints.upsert({
          where: {
            customerId_businessId: {
              customerId: request.customerId,
              businessId: request.businessId,
            },
          },
          update: { totalPoints: { increment: pointsEarned } },
          create: {
            customerId: request.customerId,
            businessId: request.businessId,
            totalPoints: pointsEarned,
            totalVisits: 0,
            visitStreak: 0,
          },
        });

        // 1. Get or create wallet
        let wallet = await tx.userWallet.findUnique({
          where: { userId_businessId: { userId: request.customerId, businessId: request.businessId } },
        });

        const now = new Date();
        let startedAt = wallet?.startedAt;
        let expiresAt = wallet?.expiresAt;
        let currentPoints = wallet?.currentPoints || 0;
        let currentStamps = wallet?.currentStamps || 0;

        if (wallet && wallet.expiresAt && now > wallet.expiresAt) {
          // Wallet expired: reset points/stamps and start new cycle
          currentPoints = 0;
          currentStamps = 0;
          startedAt = now;
          expiresAt = new Date(now.getTime() + settings.validityDays * 24 * 60 * 60 * 1000);
        } else if (!wallet) {
          // First scan/approval: set starting day and expiration
          startedAt = now;
          expiresAt = new Date(now.getTime() + settings.validityDays * 24 * 60 * 60 * 1000);
        }

        if (!wallet) {
          wallet = await tx.userWallet.create({
            data: {
              userId: request.customerId,
              businessId: request.businessId,
              currentPoints: 0,
              currentStamps: 0,
              startedAt,
              expiresAt,
            },
          });
        } else if (wallet && wallet.expiresAt && now > wallet.expiresAt) {
          wallet = await tx.userWallet.update({
            where: { id: wallet.id },
            data: {
              currentPoints: 0,
              currentStamps: 0,
              startedAt,
              expiresAt,
            },
          });
        }

        // 2. Calculate point accumulation and stamp conversion
        const totalPointsAcc = currentPoints + pointsEarned;
        const stampsEarned = Math.floor(totalPointsAcc / settings.pointsPerStamp);
        const remainingPoints = totalPointsAcc % settings.pointsPerStamp;

        const updatedWallet = await tx.userWallet.update({
          where: { id: wallet.id },
          data: {
            currentPoints: remainingPoints,
            currentStamps: currentStamps + stampsEarned,
            startedAt,
            expiresAt,
          },
        });

        // 3. Create wallet transaction
        const walletTx = await tx.walletTransaction.create({
          data: {
            userId: request.customerId,
            businessId: request.businessId,
            purchaseValue,
            pointsEarned,
            stampEarned: stampsEarned,
          },
        });

        // 3b. Create LoyaltyTransaction so points appear in history and analytics
        await tx.loyaltyTransaction.create({
          data: {
            customerId: request.customerId,
            businessId: request.businessId,
            points: pointsEarned,
            requestId,
            spendAmount: purchaseValue,
          },
        });

        // 4. Update request status to APPROVED
        const updatedRequest = await tx.loyaltyRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            spendAmount: purchaseValue,
            approvedById: req.user.sub,
            approvedAt: new Date(),
          },
        });

        // 5. Send notification to the customer
        let notifTitle = 'Points Earned! 💳';
        let notifBody = `You earned ${pointsEarned} points at ${request.business.name}.`;
        if (stampsEarned > 0) {
          notifTitle = 'Stamp Added! 🎫';
          notifBody = `You earned ${pointsEarned} points and ${stampsEarned} stamp${stampsEarned > 1 ? 's' : ''} at ${request.business.name}!`;
        }

        await tx.notification.create({
          data: {
            userId: request.customerId,
            businessId: request.businessId,
            title: notifTitle,
            body: notifBody,
            type: 'GENERAL',
            metadata: {
              pointsEarned,
              stampsEarned,
              currentPoints: remainingPoints,
              currentStamps: updatedWallet.currentStamps,
              purchaseValue,
            },
          },
        });

        return { updatedWallet, walletTx, updatedRequest };
      });

      sendSuccess(res, {
        requestId,
        customerId: request.customerId,
        customerName: request.customer.name,
        pointsEarned,
        currentPoints: result.updatedWallet.currentPoints,
        currentStamps: result.updatedWallet.currentStamps,
      }, `Approved! ${pointsEarned} points awarded to ${request.customer.name}`);
    } catch (err) { next(err); }
  }
);

// POST /loyalty-approval/redeem-wallet-reward/:businessId — redeem stamps for a reward voucher
router.post(
  '/redeem-wallet-reward/:businessId',
  authenticate,
  authorize(Role.CUSTOMER),
  async (req, res, next) => {
    try {
      const { businessId } = req.params;
      if (!businessId || businessId === 'null' || businessId === 'undefined') {
        throw new AppError('Invalid business ID', 400);
      }
      const customerId = req.user.sub;

      const settings = await prisma.loyaltyProgramSettings.findUnique({
        where: { businessId },
      });

      if (!settings) {
        throw new AppError('Loyalty program settings not found for this business', 404);
      }

      const wallet = await prisma.userWallet.findUnique({
        where: { userId_businessId: { userId: customerId, businessId } },
      });

      if (wallet && wallet.expiresAt && new Date() > wallet.expiresAt) {
        await prisma.userWallet.update({
          where: { id: wallet.id },
          data: {
            currentPoints: 0,
            currentStamps: 0,
            startedAt: null,
            expiresAt: null,
          },
        });
        throw new AppError('Your stamps have expired (validity period has passed). Please scan QR to start collecting again.', 400);
      }

      if (!wallet || wallet.currentStamps < settings.requiredStamps) {
        throw new AppError('Insufficient stamps to redeem reward', 400);
      }

      // Find or create a Reward template for this business based on settings.rewardName
      let reward = await prisma.reward.findFirst({
        where: { businessId, title: settings.rewardName, isActive: true },
      });

      if (!reward) {
        reward = await prisma.reward.create({
          data: {
            businessId,
            title: settings.rewardName,
            description: 'Redeemed from stamps',
            pointsRequired: 0,
            isActive: true,
          },
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1. Deduct stamps
        const updatedWallet = await tx.userWallet.update({
          where: { id: wallet.id },
          data: {
            currentStamps: wallet.currentStamps - settings.requiredStamps,
          },
        });

        // 2. Create customer reward voucher
        const redemptionCode = 'rw-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const expiresAt = new Date(Date.now() + settings.validityDays * 24 * 60 * 60 * 1000);

        const customerReward = await tx.customerReward.create({
          data: {
            customerId,
            rewardId: reward.id,
            status: 'UNLOCKED',
            redemptionCode,
            expiresAt,
          },
        });

        // 3. Create a notification
        await tx.notification.create({
          data: {
            userId: customerId,
            businessId,
            title: 'Reward Voucher Unlocked! 🎁',
            body: `You have successfully redeemed ${settings.requiredStamps} stamps for a "${settings.rewardName}".`,
            type: 'REWARD_UNLOCKED',
            metadata: {
              rewardId: reward.id,
              customerRewardId: customerReward.id,
              redemptionCode,
            },
          },
        });

        return { updatedWallet, customerReward };
      });

      sendSuccess(res, {
        customerReward: result.customerReward,
        currentStamps: result.updatedWallet.currentStamps,
      }, `Successfully redeemed ${settings.requiredStamps} stamps for ${settings.rewardName}!`);
    } catch (err) { next(err); }
  }
);

export default router;
