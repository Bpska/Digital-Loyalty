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
  usageLimit: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
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
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        businessId,
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
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
