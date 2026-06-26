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

const router = Router();

// All admin routes require SUPER_ADMIN role
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
    const [
      totalBusinesses,
      activeBusinesses,
      totalCustomers,
      totalCheckIns,
      totalRewardsRedeemed,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.business.count({ where: { deletedAt: null } }),
      prisma.business.count({ where: { status: BusinessStatus.ACTIVE } }),
      prisma.user.count({ where: { role: Role.CUSTOMER, deletedAt: null } }),
      prisma.checkIn.count(),
      prisma.customerReward.count({ where: { status: 'REDEEMED' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
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
      recentPayments: payments,
    });
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

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
      ...(status && { status: status }),
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
        where: { id: req.params.id, deletedAt: null },
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
      await prisma.business.update({
        where: { id: req.params.id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED',
        },
      });
      sendSuccess(res, null, 'Business deleted successfully');
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

// Get all users in the platform (with optional role filter)
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
});

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

export default router;
