import { Router } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { Role, DiscountType } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';

const router = Router();

const couponSchema = z.object({
  businessId: z.string(),
  code: z.string().min(3).max(20).toUpperCase(),
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.coerce.number().positive(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  eventDate: z.preprocess((val) => (val === "" || val === null) ? undefined : val, z.coerce.date().optional().nullable()),
  offerTitle: z.string().optional().nullable(),
  offerDescription: z.string().optional().nullable(),
});

router.get('/business/:businessId', authenticate, requireSameBusiness, async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { businessId: req.params.businessId },
      orderBy: { validTo: 'asc' },
      include: { _count: { select: { usages: true } } },
    });
    sendSuccess(res, coupons);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(couponSchema), auditLog('COUPON_CREATED', 'Coupon'), async (req, res, next) => {
  try {
    const { businessId } = req.body;
    if (!businessId || businessId === 'null' || businessId === 'undefined') {
      throw new AppError('Invalid business ID', 400);
    }
    if (req.user.role !== Role.SUPER_ADMIN && req.user.businessId !== businessId) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, ownerId: req.user.sub, deletedAt: null }
      });
      if (!biz) {
        throw new AppError('Access denied: not your business', 403);
      }
    }

    const coupon = await prisma.coupon.create({ data: req.body });
    sendCreated(res, coupon, 'Coupon created');
  } catch (err) { next(err); }
});

// Validate a coupon code (for customer use)
router.post('/validate', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const { code, businessId } = req.body;
    const nowForStart = new Date(Date.now() + 14 * 60 * 60 * 1000); // 14 hours forward for UTC+14 starts
    const nowForEnd = new Date(Date.now() - 30 * 60 * 60 * 1000);   // 30 hours backward for UTC-12 expiry

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        businessId,
        isActive: true,
        validFrom: { lte: nowForStart },
        validTo: { gte: nowForEnd },
      },
    });
    if (!coupon) throw new AppError('Invalid or expired coupon', 404);

    if (coupon.usageLimit && coupon.totalUsed >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    const alreadyUsed = await prisma.couponUsage.findUnique({
      where: { couponId_customerId: { couponId: coupon.id, customerId: req.user.sub } },
    });
    if (alreadyUsed) throw new AppError('You have already used this coupon', 400);

    sendSuccess(res, { valid: true, coupon }, 'Coupon is valid');
  } catch (err) { next(err); }
});

// Claim an event-day coupon
router.post('/:couponId/claim', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const { couponId } = req.params;
    const coupon = await prisma.coupon.findFirst({
      where: { id: couponId, isActive: true },
    });
    if (!coupon) throw new AppError('Coupon not found or inactive', 404);
    if (!coupon.eventDate) throw new AppError('This coupon cannot be claimed', 400);

    const alreadyClaimed = await prisma.claimedCoupon.findUnique({
      where: { couponId_customerId: { couponId, customerId: req.user.sub } },
    });
    if (alreadyClaimed) throw new AppError('You have already claimed this coupon', 400);

    const claimed = await prisma.claimedCoupon.create({
      data: {
        couponId,
        customerId: req.user.sub,
        status: 'CLAIMED',
      },
    });

    sendSuccess(res, claimed, 'Coupon claimed successfully');
  } catch (err) { next(err); }
});

router.patch('/:couponId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(couponSchema.partial()), async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.couponId }, data: req.body });
    sendSuccess(res, coupon, 'Coupon updated');
  } catch (err) { next(err); }
});

router.delete('/:couponId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { couponId } = req.params;
    await prisma.$transaction([
      prisma.couponUsage.deleteMany({ where: { couponId } }),
      prisma.coupon.delete({ where: { id: couponId } }),
    ]);
    sendSuccess(res, null, 'Coupon deleted successfully');
  } catch (err) { next(err); }
});

// POST /coupons/admin-apply — Business admin enters a coupon code (given verbally by customer)
// Optionally supply customerPhone to look up & link the customer, then returns full customer details
router.post('/admin-apply', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { code, businessId, customerPhone } = req.body;

    if (!code || !businessId) {
      throw new AppError('Coupon code and businessId are required', 400);
    }

    if (!customerPhone) {
      throw new AppError('Customer phone number is required', 400);
    }

    // Verify business ownership
    if (req.user.role === Role.BUSINESS_ADMIN) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, ownerId: req.user.sub, deletedAt: null },
      });
      if (!biz) throw new AppError('Access denied: not your business', 403);
    }

    const now = new Date();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        businessId,
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
    });

    if (!coupon) throw new AppError('Coupon not found, expired, or inactive', 404);

    if (coupon.usageLimit && coupon.totalUsed >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit has been reached', 400);
    }

    // Optionally look up customer by phone number
    let customer = null;
    if (customerPhone) {
      const normalized = customerPhone.replace(/\D/g, '');
      customer = await prisma.user.findFirst({
        where: {
          phone: { endsWith: normalized },
          role: Role.CUSTOMER,
        },
        select: { id: true, name: true, phone: true, email: true, createdAt: true },
      });
    }

    // Record usage in a transaction
    await prisma.$transaction(async (tx) => {
      if (customer) {
        // Prevent double-use per customer
        const alreadyUsed = await tx.couponUsage.findUnique({
          where: { couponId_customerId: { couponId: coupon.id, customerId: customer.id } },
        });
        if (alreadyUsed) throw new AppError('This customer has already used this coupon', 400);

        await tx.couponUsage.create({
          data: { couponId: coupon.id, customerId: customer.id },
        });
      }

      // Increment totalUsed counter on the coupon
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { totalUsed: { increment: 1 } },
      });
    });

    // Fetch customer loyalty stats if customer found
    let loyaltyStats = null;
    if (customer) {
      const [wallet, cp] = await Promise.all([
        prisma.userWallet.findUnique({
          where: { userId_businessId: { userId: customer.id, businessId } },
          select: { currentPoints: true, currentStamps: true, pointsBalance: true },
        }),
        prisma.customerPoints.findUnique({
          where: { customerId_businessId: { customerId: customer.id, businessId } },
          select: { totalPoints: true, totalVisits: true },
        }),
      ]);
      loyaltyStats = {
        stamps: wallet?.currentStamps ?? 0,
        points: wallet?.currentPoints ?? 0,
        pointsBalance: wallet?.pointsBalance ?? 0,
        totalVisits: cp?.totalVisits ?? 0,
        totalPoints: cp?.totalPoints ?? 0,
      };
    }

    sendSuccess(res, {
      applied: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      customer: customer ? { ...customer, loyaltyStats } : null,
    }, `Coupon "${coupon.code}" applied — ${coupon.discountType === 'PERCENTAGE' ? coupon.discountValue + '% off' : '₹' + coupon.discountValue + ' off'}`);
  } catch (err) { next(err); }
});

// GET /coupons/usage-history/:businessId — all coupon usages for a business (for admin review)
router.get('/usage-history/:businessId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    if (req.user.role === Role.BUSINESS_ADMIN) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, ownerId: req.user.sub, deletedAt: null },
      });
      if (!biz) throw new AppError('Access denied: not your business', 403);
    }

    const usages = await prisma.couponUsage.findMany({
      where: { coupon: { businessId } },
      orderBy: { usedAt: 'desc' },
      take: limit,
      include: {
        coupon: {
          select: { id: true, code: true, title: true, discountType: true, discountValue: true },
        },
      },
    });

    // Fetch customer details for each usage
    const enriched = await Promise.all(
      usages.map(async (u) => {
        const cust = await prisma.user.findUnique({
          where: { id: u.customerId },
          select: { id: true, name: true, phone: true, email: true },
        });
        return { ...u, customer: cust };
      })
    );

    sendSuccess(res, enriched, 'Coupon usage history retrieved');
  } catch (err) { next(err); }
});

export default router;
