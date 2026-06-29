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

export default router;
