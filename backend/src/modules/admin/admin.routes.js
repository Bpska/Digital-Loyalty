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
          { name: { contains: search, mode: 'insensitive'  } },
          { phone: { contains: search } },
        ],
      }),
      ...(status && { status: status  }),
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
      const { status } = req.body ;
      
      const currentBusiness = await prisma.business.findUnique({
        where: { id: req.params.id },
        select: { planId: true }
      });

      const updateData = { status };
      if (status === 'ACTIVE' && (!currentBusiness || !currentBusiness.planId)) {
        const starterPlan = await prisma.plan.findFirst({
          where: { name: 'STARTER' }
        });
        if (starterPlan) {
          updateData.planId = starterPlan.id;
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
  name: z.enum(['STARTER', 'GROWTH', 'ENTERPRISE']),
  priceMonthly: z.number().positive(),
  maxBranches: z.number().int().positive(),
  maxCustomers: z.number().int().positive(),
  features: z.object({
    analyticsAccess: z.boolean(),
    customBranding: z.boolean(),
    csvExport: z.boolean(),
    apiAccess: z.boolean(),
  }),
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

export default router;
