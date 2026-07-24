import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import { sendSuccess, sendCreated, } from '../../utils/response.js';

import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';
import { BusinessStatus } from '@prisma/client';
import argon2 from 'argon2';


const router = Router();

// ── Public Ad Banner Read (no super-admin role needed) ────────
// Business dashboard fetches this to display banners in the hero carousel
router.get('/ads', async (req, res, next) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'ad_banners' } });
    let banners = [];
    if (setting) {
      try { banners = JSON.parse(setting.value); } catch (_) {}
    }
    sendSuccess(res, { banners });
  } catch (err) { next(err); }
});

// All other admin routes require SUPER_ADMIN role
router.use(authenticate, authorize(Role.SUPER_ADMIN));

// ── Dashboard Stats ───────────────────────────────────────────
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Super Admin]
 *     summary: Platform-wide dashboard statistics
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    // First, clean up expired reservations (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.reviewTemplate.updateMany({
      where: {
        status: 'RESERVED',
        reservedAt: { lt: tenMinutesAgo },
      },
      data: {
        status: 'AVAILABLE',
        reservedById: null,
        reservedAt: null,
      },
    });

    const [
      totalBusinesses,
      activeBusinesses,
      totalCustomers,
      totalCheckIns,
      totalRewardsRedeemed,
      activeSubscriptions,
      totalReviews,
      availableReviews,
      reservedReviews,
      usedReviews,
    ] = await Promise.all([
      prisma.business.count({ where: { deletedAt: null } }),
      prisma.business.count({ where: { status: BusinessStatus.ACTIVE } }),
      prisma.user.count({ where: { role: Role.CUSTOMER, deletedAt: null } }),
      prisma.checkIn.count(),
      prisma.customerReward.count({ where: { status: 'REDEEMED' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.reviewTemplate.count(),
      prisma.reviewTemplate.count({ where: { status: 'AVAILABLE' } }),
      prisma.reviewTemplate.count({ where: { status: 'RESERVED' } }),
      prisma.reviewTemplate.count({ where: { status: 'USED' } }),
    ]);

    // Monthly revenue from captured payments (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const payments = await prisma.payment.groupBy({
      by: ['paidAt'],
      where: { status: 'CAPTURED', paidAt: { gte: twelveMonthsAgo } },
      _sum: { amount: true },
    });

    sendSuccess(res, {
      totalBusinesses,
      activeBusinesses,
      totalCustomers,
      totalCheckIns,
      totalRewardsRedeemed,
      activeSubscriptions,
      totalReviews,
      availableReviews,
      reservedReviews,
      usedReviews,
      recentPayments: payments,
    });
  } catch (err) {
    next(err);
  }
});

// ── Payments Management ───────────────────────────────────────
router.get('/payments', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: {
              business: { select: { id: true, name: true, phone: true } },
              plan: { select: { name: true } },
            },
          },
        },
      }),
      prisma.payment.count(),
    ]);

    sendSuccess(res, payments, 'Payments retrieved', 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

// ── Business Management ───────────────────────────────────────
router.get('/businesses', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const showDeleted = status === 'DELETED';
    const where = {
      ...(showDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
      ...(status && !showDeleted && { status: status }),
    };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, phone: true, email: true } },
          plan: { select: { name: true, priceMonthly: true } },
          subscription: { select: { status: true, currentPeriodEnd: true } },
          loyaltyProgramSettings: { select: { pointsPerRupee: true } },
          _count: { select: { branches: true, staff: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);

    sendSuccess(res, businesses, 'Businesses retrieved', 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

const updateBusinessStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().optional(),
});

router.patch(
  '/businesses/:id/status',
  validate(updateBusinessStatusSchema),
  auditLog('BUSINESS_STATUS_CHANGED', 'Business'),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      const currentBusiness = await prisma.business.findUniqueOrThrow({
        where: { id: req.params.id },
        select: { planId: true }
      });

      const updateData = { status };
      if (status === 'ACTIVE') {
        const activePlan = await prisma.plan.findFirst({
          where: { isActive: true }
        });

        // Count active businesses to see if they are in the promo range
        const activeCount = await prisma.business.count({
          where: { status: 'ACTIVE', deletedAt: null }
        });

        const promoLimitSetting = await prisma.systemSetting.findUnique({ where: { key: 'promo_limit' } });
        const promoLimit = promoLimitSetting ? parseInt(promoLimitSetting.value, 10) : 20;

        const isPromoYearly = activeCount < promoLimit;
        let planId = currentBusiness.planId;

        if (isPromoYearly) {
          if (activePlan) {
            planId = activePlan.id;
            updateData.planId = activePlan.id;
          }
        } else {
          // Subsequent approved businesses default to active plan if they haven't chosen a plan
          if (!planId && activePlan) {
            planId = activePlan.id;
            updateData.planId = activePlan.id;
          }
        }

        if (planId) {
          const currentPeriodEnd = isPromoYearly
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year promo
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days monthly

          await prisma.subscription.upsert({
            where: { businessId: req.params.id },
            update: {
              planId,
              status: 'ACTIVE',
              currentPeriodEnd,
            },
            create: {
              businessId: req.params.id,
              planId,
              status: 'ACTIVE',
              currentPeriodEnd,
            }
          });
        }
      }

      const business = await prisma.business.update({
        where: { id: req.params.id },
        data: updateData,
        select: { id: true, name: true, status: true },
      });
      sendSuccess(res, business, `Business ${status.toLowerCase()}`);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/businesses/:id',
  auditLog('BUSINESS_DELETED', 'Business'),
  async (req, res, next) => {
    try {
      const businessId = req.params.id;

      // Verify business exists first
      const exists = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, deletedAt: true } });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }

      // Soft delete: move to Recycle Bin if active
      if (exists.deletedAt === null) {
        await prisma.business.update({
          where: { id: businessId },
          data: {
            deletedAt: new Date(),
            status: 'DELETED'
          }
        });
        return sendSuccess(res, null, 'Business moved to Recycle Bin (soft-deleted)');
      }

      // Hard-delete: remove all related data in dependency order, then the business itself
      await prisma.$transaction(async (tx) => {
        // 1. Delete wallet transactions first (depends on UserWallet)
        await tx.walletTransaction.deleteMany({ where: { businessId } });

        // 2. Delete loyalty points ledger
        await tx.loyaltyPointsLedger.deleteMany({ where: { businessId } });

        // 3. Delete loyalty transactions
        await tx.loyaltyTransaction.deleteMany({ where: { businessId } });

        // 4. Delete loyalty requests
        await tx.loyaltyRequest.deleteMany({ where: { businessId } });

        // 5. Delete customer rewards (redeemed/unlocked rewards)
        await tx.customerReward.deleteMany({ where: { businessId } });

        // 6. Delete customer loyalty wallets
        await tx.customerLoyaltyWallet.deleteMany({ where: { businessId } });

        // 7. Delete user wallets for this business
        await tx.userWallet.deleteMany({ where: { businessId } });

        // 8. Delete customer points
        await tx.customerPoints.deleteMany({ where: { businessId } });

        // 9. Delete review generations
        await tx.reviewGeneration.deleteMany({ where: { businessId } });

        // 10. Delete business review settings
        await tx.businessReviewSettings.deleteMany({ where: { businessId } });

        // 11. Delete notifications
        await tx.notification.deleteMany({ where: { businessId } });

        // 12. Delete check-ins (via branches or direct)
        await tx.checkIn.deleteMany({ where: { businessId } });

        // 13. Delete claimed coupons for this business's coupons
        const couponIds = (await tx.coupon.findMany({ where: { businessId }, select: { id: true } })).map(c => c.id);
        if (couponIds.length > 0) {
          await tx.claimedCoupon.deleteMany({ where: { couponId: { in: couponIds } } });
        }

        // 14. Delete coupons
        await tx.coupon.deleteMany({ where: { businessId } });

        // 15. Delete loyalty levels
        await tx.loyaltyLevel.deleteMany({ where: { businessId } });

        // 16. Delete rewards
        await tx.reward.deleteMany({ where: { businessId } });

        // 17. Delete loyalty programs
        await tx.loyaltyProgram.deleteMany({ where: { businessId } });

        // 18. Delete loyalty program settings
        await tx.loyaltyProgramSettings.deleteMany({ where: { businessId } });

        // 19. Delete brand asset
        await tx.businessBrandAsset.deleteMany({ where: { businessId } });

        // 20. Delete staff (depends on branches so delete before branches)
        await tx.staff.deleteMany({ where: { businessId } });

        // 21. Delete branches (cascades check-ins via DB if set, but we already handled above)
        await tx.branch.deleteMany({ where: { businessId } });

        // 22. Delete subscription payments then subscription
        const sub = await tx.subscription.findUnique({ where: { businessId }, select: { id: true } });
        if (sub) {
          await tx.payment.deleteMany({ where: { subscriptionId: sub.id } });
          await tx.subscription.delete({ where: { businessId } });
        }

        // 23. Finally, hard-delete the business itself
        await tx.business.delete({ where: { id: businessId } });
      });

      sendSuccess(res, null, 'Business permanently deleted from the database');
    } catch (err) {
      next(err);
    }
  }
);

// POST /admin/businesses/:id/restore — restore a soft-deleted business
router.post(
  '/businesses/:id/restore',
  auditLog('BUSINESS_RESTORED', 'Business'),
  async (req, res, next) => {
    try {
      const businessId = req.params.id;
      const exists = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }
      const restored = await prisma.business.update({
        where: { id: businessId },
        data: {
          deletedAt: null,
          status: 'ACTIVE'
        }
      });
      sendSuccess(res, restored, 'Business restored successfully');
    } catch (err) {
      next(err);
    }
  }
);


// PATCH /admin/businesses/:id/description — update business description by super admin
router.patch(
  '/businesses/:id/description',
  validate(z.object({
    description: z.string().nullable().optional(),
  })),
  auditLog('BUSINESS_DESCRIPTION_CHANGED', 'Business'),
  async (req, res, next) => {
    try {
      const { description } = req.body;
      const business = await prisma.business.update({
        where: { id: req.params.id },
        data: { description: description || null },
        select: { id: true, name: true, description: true },
      });
      sendSuccess(res, business, 'Business description updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /admin/businesses/:id/loyalty-settings — update points per rupee setting for a specific business
router.patch(
  '/businesses/:id/loyalty-settings',
  validate(z.object({
    pointsPerRupee: z.coerce.number().positive(),
  })),
  auditLog('BUSINESS_LOYALTY_SETTINGS_CHANGED', 'LoyaltyProgramSettings'),
  async (req, res, next) => {
    try {
      const { pointsPerRupee } = req.body;
      const settings = await prisma.loyaltyProgramSettings.upsert({
        where: { businessId: req.params.id },
        update: { pointsPerRupee },
        create: {
          businessId: req.params.id,
          pointsPerRupee,
          programName: 'Coffee Rewards',
          pointsPerStamp: 50,
          requiredStamps: 7,
          rewardName: 'Free Coffee',
          validityDays: 30,
          maxDailyStamps: 1,
        },
      });
      sendSuccess(res, settings, 'Business loyalty points setting updated');
    } catch (err) {
      next(err);
    }
  }
);

// ── Plan Management (CRUD) ────────────────────────────────────
router.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } });
    sendSuccess(res, plans);
  } catch (err) {
    next(err);
  }
});

const planSchema = z.object({
  name: z.string().min(1),
  priceMonthly: z.number().positive(),
  maxBranches: z.number().int().positive(),
  maxCustomers: z.number().int().positive(),
  features: z.object({
    analyticsAccess: z.boolean(),
    customBranding: z.boolean(),
    csvExport: z.boolean(),
    apiAccess: z.boolean(),
  }),
  isActive: z.boolean().optional(),
});

router.post('/plans', validate(planSchema), auditLog('PLAN_CREATED', 'Plan'), async (req, res, next) => {
  try {
    const plan = await prisma.plan.create({ data: req.body });
    sendCreated(res, plan, 'Plan created');
  } catch (err) {
    next(err);
  }
});

router.patch('/plans/:id', validate(planSchema.partial()), auditLog('PLAN_UPDATED', 'Plan'), async (req, res, next) => {
  try {
    const plan = await prisma.plan.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, plan, 'Plan updated');
  } catch (err) {
    next(err);
  }
});

router.delete('/plans/:id', auditLog('PLAN_DELETED', 'Plan'), async (req, res, next) => {
  try {
    await prisma.plan.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Plan deleted');
  } catch (err) {
    next(err);
  }
});

// ── Suspicious Check-ins ──────────────────────────────────────
router.get('/fraud/checkins', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where: { status: 'SUSPICIOUS' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          business: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.checkIn.count({ where: { status: 'SUSPICIOUS' } }),
    ]);
    sendSuccess(res, checkIns, 'Suspicious check-ins', 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/fraud/checkins/:id — permanently remove a suspicious check-in log
router.delete('/fraud/checkins/:id', async (req, res, next) => {
  try {
    await prisma.checkIn.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Suspicious check-in log deleted');
  } catch (err) {
    next(err);
  }
});

// ── Audit Logs ────────────────────────────────────────────────
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    sendSuccess(res, logs, 'Audit logs', 200, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
});

// Send direct notification — Super Admin only
const sendNotificationSchema = z.object({
  targetType: z.enum(['user_phone', 'user_id', 'business_id']),
  targetValue: z.string().min(1, 'Target identifier value is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
});

router.post(
  '/notifications',
  validate(sendNotificationSchema),
  auditLog('ADMIN_NOTIFICATION_SENT', 'Notification'),
  async (req, res, next) => {
    try {
      const { targetType, targetValue, title, body } = req.body;
      const prisma = (await import('../../config/prisma.js')).default;
      const notificationsCreated = [];

      if (targetType === 'user_phone') {
        const user = await prisma.user.findFirstOrThrow({
          where: { phone: targetValue, deletedAt: null },
        });

        const notif = await prisma.notification.create({
          data: {
            userId: user.id,
            title,
            body,
            type: 'GENERAL',
          },
        });
        notificationsCreated.push(notif);
      } else if (targetType === 'user_id') {
        const user = await prisma.user.findFirstOrThrow({
          where: { id: targetValue, deletedAt: null },
        });

        const notif = await prisma.notification.create({
          data: {
            userId: user.id,
            title,
            body,
            type: 'GENERAL',
          },
        });
        notificationsCreated.push(notif);
      } else if (targetType === 'business_id') {
        const business = await prisma.business.findUniqueOrThrow({
          where: { id: targetValue, deletedAt: null },
          select: { id: true, ownerId: true },
        });

        const notif = await prisma.notification.create({
          data: {
            userId: business.ownerId,
            businessId: business.id,
            title,
            body,
            type: 'GENERAL',
          },
        });
        notificationsCreated.push(notif);
      }

      sendCreated(res, notificationsCreated, 'Notification(s) sent successfully');
    } catch (err) {
      next(err);
    }
  }
);

// ── Platform settings (Super Admin Only) ──────────────────────
const settingsSchema = z.object({
  platform_fee: z.coerce.number().positive(),
  gst_percent: z.coerce.number().min(0).max(100),
  promo_limit: z.coerce.number().int().positive(),
  promo_price: z.coerce.number().positive(),
  gateway_percent: z.coerce.number().min(0).max(100).optional(),
  points_per_rupee: z.coerce.number().positive().optional(),
  points_per_stamp: z.coerce.number().int().positive().optional(),
  mock_business_count: z.coerce.number().int().min(0).optional(),
});

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    sendSuccess(res, settingsMap);
  } catch (err) { next(err); }
});

router.put('/settings', validate(settingsSchema), async (req, res, next) => {
  try {
    const data = req.body;
    await prisma.$transaction(
      Object.entries(data).map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    sendSuccess(res, data, 'Settings updated successfully');
  } catch (err) { next(err); }
});

// Zod schemas for User CRUD
const createUserSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'BUSINESS_ADMIN', 'STAFF', 'CUSTOMER']),
  password: z.string().min(6).optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true)
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'BUSINESS_ADMIN', 'STAFF', 'CUSTOMER']).optional(),
  password: z.string().min(6).optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional()
});

// Get all users in the platform (with optional role filter)
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(role && { role }),
      },
      include: {
        ownedBusinesses: {
          select: { id: true, name: true }
        },
        staffProfile: {
          include: {
            business: {
              select: { id: true, name: true }
            }
          }
        },
        customerPoints: {
          include: {
            business: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedUsers = users.map(user => {
      let associatedBusinesses = [];
      if (user.role === 'BUSINESS_ADMIN') {
        associatedBusinesses = user.ownedBusinesses || [];
      } else if (user.role === 'STAFF') {
        if (user.staffProfile && user.staffProfile.business) {
          associatedBusinesses = [user.staffProfile.business];
        }
      } else if (user.role === 'CUSTOMER') {
        const bizMap = new Map();
        if (user.customerPoints) {
          user.customerPoints.forEach(cp => {
            if (cp.business) {
              bizMap.set(cp.business.id, cp.business);
            }
          });
        }
        associatedBusinesses = Array.from(bizMap.values());
      }
      
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        associatedBusinesses
      };
    });

    sendSuccess(res, mappedUsers, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
});

// POST /admin/users - Create User
router.post(
  '/users',
  validate(createUserSchema),
  async (req, res, next) => {
    try {
      const { name, phone, email, role, password, isActive } = req.body;

      const existingPhone = await prisma.user.findFirst({
        where: { phone, deletedAt: null }
      });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already registered' });
      }

      if (email) {
        const existingEmail = await prisma.user.findFirst({
          where: { email, deletedAt: null }
        });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'Email address already registered' });
        }
      }

      let passwordHash = null;
      if (password) {
        passwordHash = await argon2.hash(password);
      }

      const user = await prisma.user.create({
        data: {
          name,
          phone,
          email: email || null,
          role,
          passwordHash,
          isActive: isActive !== undefined ? isActive : true
        }
      });

      sendCreated(res, user, 'User created successfully');
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /admin/users/:id - Update User
router.patch(
  '/users/:id',
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const { name, phone, email, role, password, isActive } = req.body;
      const userId = req.params.id;

      const userExists = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!userExists) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (phone && phone !== userExists.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone, deletedAt: null }
        });
        if (existingPhone) {
          return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }
      }

      if (email && email !== userExists.email) {
        const existingEmail = await prisma.user.findFirst({
          where: { email, deletedAt: null }
        });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'Email address already registered' });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email || null;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      if (password) {
        updateData.passwordHash = await argon2.hash(password);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /admin/users/:id - Delete User
router.delete(
  '/users/:id',
  async (req, res, next) => {
    try {
      const userId = req.params.id;

      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          isActive: false
        }
      });

      sendSuccess(res, null, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  }
);

// ── AI Review Analytics ────────────────────────────────────────
/**
 * GET /admin/reviews/analytics
 * Super Admin: platform-wide AI review generation analytics + per-business breakdown.
 */
router.get('/reviews/analytics', async (req, res, next) => {
  try {
    const [
      totalGenerations,
      totalWithSelection,
      totalWithClick,
      ratingBreakdown,
      perBusiness,
      recentGenerations,
    ] = await Promise.all([
      prisma.reviewGeneration.count(),
      prisma.reviewGeneration.count({ where: { selectedReview: { not: null } } }),
      prisma.reviewGeneration.count({ where: { reviewLinkClicked: true } }),
      prisma.reviewGeneration.groupBy({
        by: ['rating'],
        _count: { id: true },
        orderBy: { rating: 'asc' },
      }),
      prisma.reviewGeneration.groupBy({
        by: ['businessId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      prisma.reviewGeneration.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          rating: true,
          selectedReview: true,
          reviewLinkClicked: true,
          createdAt: true,
          user: { select: { id: true, name: true, phone: true } },
          business: { select: { id: true, name: true, category: true } },
        },
      }),
    ]);

    // Hydrate per-business counts with business name
    const businessIds = perBusiness.map((b) => b.businessId);
    const businesses = await prisma.business.findMany({
      where: { id: { in: businessIds } },
      select: {
        id: true,
        name: true,
        category: true,
        reviewSettings: {
          select: {
            googleReviewUrl: true,
            businessType: true,
            googlePlaceId: true,
          },
        },
      },
    });
    const businessMap = Object.fromEntries(businesses.map((b) => [b.id, b]));

    const businessBreakdown = perBusiness.map((b) => ({
      businessId: b.businessId,
      count: b._count.id,
      business: businessMap[b.businessId] || null,
    }));

    sendSuccess(res, {
      totalGenerations,
      totalWithSelection,
      totalWithClick,
      selectionRate: totalGenerations > 0 ? Math.round((totalWithSelection / totalGenerations) * 100) : 0,
      clickThroughRate: totalGenerations > 0 ? Math.round((totalWithClick / totalGenerations) * 100) : 0,
      ratingBreakdown,
      businessBreakdown,
      recentGenerations,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/reviews/settings/:businessId
 * Super Admin: get AI review settings for any business.
 */
router.get('/reviews/settings/:businessId', async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: { id: req.params.businessId, deletedAt: null },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        googleReviewUrl: true,
        instagramUrl: true,
        facebookUrl: true,
        reviewSettings: true,
      },
    });
    if (!business) {
      return next(new (await import('../../middlewares/error.middleware.js')).AppError('Business not found', 404));
    }
    sendSuccess(res, {
      businessId: business.id,
      name: business.name,
      category: business.category,
      description: business.description,
      googleReviewUrl: business.reviewSettings?.googleReviewUrl || business.googleReviewUrl || null,
      instagramUrl: business.reviewSettings?.instagramUrl || business.instagramUrl || null,
      facebookUrl: business.reviewSettings?.facebookUrl || business.facebookUrl || null,
      businessType: business.reviewSettings?.businessType || null,
      googleBusinessName: business.reviewSettings?.googleBusinessName || null,
      googlePlaceId: business.reviewSettings?.googlePlaceId || null,
    });
  } catch (err) {
    next(err);
  }
});

const adminReviewSettingsSchema = z.object({
  businessType: z.string().max(100).optional().nullable(),
  googleReviewUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
  instagramUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
  facebookUrl: z.string().url().optional().nullable().or(z.literal('')).transform(v => v || null),
  googleBusinessName: z.string().max(200).optional().nullable(),
  googlePlaceId: z.string().max(200).optional().nullable(),
});

/**
 * PATCH /admin/reviews/settings/:businessId
 * Super Admin: update AI review settings for any business.
 */
router.patch(
  '/reviews/settings/:businessId',
  validate(adminReviewSettingsSchema),
  auditLog('BUSINESS_REVIEW_SETTINGS_CHANGED', 'BusinessReviewSettings'),
  async (req, res, next) => {
    try {
      const updateData = { ...req.body };

      // Auto-generate Google Review URL from place ID
      if (updateData.googlePlaceId) {
        updateData.googleReviewUrl = `https://search.google.com/local/writereview?placeid=${updateData.googlePlaceId}`;
      }

      const settings = await prisma.businessReviewSettings.upsert({
        where: { businessId: req.params.businessId },
        update: updateData,
        create: { businessId: req.params.businessId, ...updateData },
      });

      // Sync URLs to main Business record
      const businessUpdateData = {};
      if (updateData.googleReviewUrl !== undefined) businessUpdateData.googleReviewUrl = updateData.googleReviewUrl;
      if (updateData.instagramUrl !== undefined) businessUpdateData.instagramUrl = updateData.instagramUrl;
      if (updateData.facebookUrl !== undefined) businessUpdateData.facebookUrl = updateData.facebookUrl;

      if (Object.keys(businessUpdateData).length > 0) {
        await prisma.business.update({
          where: { id: req.params.businessId },
          data: businessUpdateData,
        });
      }

      sendSuccess(res, settings, 'Review settings updated');
    } catch (err) {
      next(err);
    }
  }
);

// Get support messages
router.get('/support-messages', async (req, res, next) => {
  try {
    const messages = await prisma.notification.findMany({
      where: {
        type: 'GENERAL',
        title: { startsWith: 'Support Message from' },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, messages);
  } catch (err) { next(err); }
});

// ── Coupon Code Management ─────────────────────────────────────
// Coupon codes are stored in SystemSetting: key = "coupon_<CODE>", value = JSON string
// JSON shape: { discountType: "PERCENTAGE"|"FIXED_AMOUNT", discountValue: number, description: string }

const couponSchema = z.object({
  code: z.string().min(2).max(32).regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, digits, _ or -'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive(),
  description: z.string().optional().default(''),
});

// List all coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const rows = await prisma.systemSetting.findMany({
      where: { key: { startsWith: 'coupon_' } },
      orderBy: { key: 'asc' },
    });
    const coupons = rows.map(row => {
      const code = row.key.replace(/^coupon_/, '');
      let data = {};
      try { data = JSON.parse(row.value); } catch (_) {}
      return { code, ...data };
    });
    sendSuccess(res, coupons);
  } catch (err) { next(err); }
});

// Create a coupon
router.post('/coupons', validate(couponSchema), async (req, res, next) => {
  try {
    const { code, discountType, discountValue, description } = req.body;
    const key = `coupon_${code.toUpperCase()}`;
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    }
    await prisma.systemSetting.create({
      data: {
        key,
        value: JSON.stringify({ discountType, discountValue, description }),
      },
    });
    sendCreated(res, { code: code.toUpperCase(), discountType, discountValue, description }, 'Coupon created');
  } catch (err) { next(err); }
});

// Delete a coupon
router.delete('/coupons/:code', async (req, res, next) => {
  try {
    const key = `coupon_${req.params.code.toUpperCase()}`;
    await prisma.systemSetting.delete({ where: { key } });
    sendSuccess(res, null, 'Coupon deleted');
  } catch (err) { next(err); }
});

// ── Ad Banner Management ──────────────────────────────────────
// Stores banners as a JSON array in SystemSetting with key = 'ad_banners'
// POST /admin/ads — add a new banner to the array
router.post('/ads', async (req, res, next) => {
  try {
    const { bannerImage } = req.body;
    if (!bannerImage || typeof bannerImage !== 'string') {
      return res.status(400).json({ success: false, message: 'bannerImage (base64) is required.' });
    }
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'ad_banners' } });
    let banners = [];
    if (setting) {
      try { banners = JSON.parse(setting.value); } catch (_) {}
    }
    banners.push(bannerImage);
    await prisma.systemSetting.upsert({
      where: { key: 'ad_banners' },
      update: { value: JSON.stringify(banners) },
      create: { key: 'ad_banners', value: JSON.stringify(banners) },
    });
    sendSuccess(res, { count: banners.length }, 'Banner added successfully');
  } catch (err) { next(err); }
});

// DELETE /admin/ads/:index — remove a specific banner by index
router.delete('/ads/:index', async (req, res, next) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'ad_banners' } });
    let banners = [];
    if (setting) {
      try { banners = JSON.parse(setting.value); } catch (_) {}
    }
    if (idx < 0 || idx >= banners.length) {
      return res.status(404).json({ success: false, message: 'Banner not found at given index.' });
    }
    banners.splice(idx, 1);
    await prisma.systemSetting.upsert({
      where: { key: 'ad_banners' },
      update: { value: JSON.stringify(banners) },
      create: { key: 'ad_banners', value: JSON.stringify(banners) },
    });
    sendSuccess(res, { count: banners.length }, 'Banner removed successfully');
  } catch (err) { next(err); }
});

// DELETE /admin/ads — remove ALL banners
router.delete('/ads', async (req, res, next) => {
  try {
    await prisma.systemSetting.deleteMany({ where: { key: 'ad_banners' } });
    // Also clean up old single-banner key if it exists
    await prisma.systemSetting.deleteMany({ where: { key: 'ad_banner' } });
    sendSuccess(res, null, 'All banners removed');
  } catch (err) { next(err); }
});

export default router;


