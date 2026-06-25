import { Router } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { auditLog } from '../../middlewares/audit.middleware.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';
import { AppError } from '../../middlewares/error.middleware.js';

const router = Router();

const rewardSchema = z.object({
  businessId: z.string(),
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  pointsRequired: z.coerce.number().int().min(0).default(0),
  expiryDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

router.get('/business/:businessId', authenticate, requireSameBusiness, async (req, res, next) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { businessId: req.params.businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { customerRewards: true } },
        loyaltyPrograms: {
          where: { isActive: true },
          select: { id: true, type: true, isActive: true },
        },
      },
    });
    sendSuccess(res, rewards);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(rewardSchema), auditLog('REWARD_CREATED', 'Reward'), async (req, res, next) => {
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

    const reward = await prisma.reward.create({ data: req.body });
    sendCreated(res, reward, 'Reward created');
  } catch (err) { next(err); }
});

router.patch('/:rewardId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(rewardSchema.partial()), async (req, res, next) => {
  try {
    const reward = await prisma.reward.update({ where: { id: req.params.rewardId }, data: req.body });
    sendSuccess(res, reward, 'Reward updated');
  } catch (err) { next(err); }
});

router.delete('/:rewardId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { rewardId } = req.params;
    await prisma.reward.delete({ where: { id: rewardId } });
    sendSuccess(res, null, 'Reward deleted successfully');
  } catch (err) { next(err); }
});

export default router;
