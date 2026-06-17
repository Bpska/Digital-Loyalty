import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { sendSuccess } from '../../utils/response.js';

import prisma from '../../config/prisma.js';

const router = Router();

// Get customer's loyalty dashboard (all businesses they've visited)
router.get('/dashboard', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const loyaltyCards = await prisma.customerPoints.findMany({
      where: { customerId: req.user.sub },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            loyaltyPrograms: {
              where: { isActive: true },
              select: { id: true, type: true, threshold: true, pointsPerVisit: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const unlockedRewards = await prisma.customerReward.findMany({
      where: { customerId: req.user.sub, status: 'UNLOCKED' },
      include: {
        reward: { select: { id: true, title: true, description: true, businessId: true } },
      },
    });

    sendSuccess(res, { loyaltyCards, unlockedRewards });
  } catch (err) { next(err); }
});

// Get customer profile
router.get('/profile', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.sub },
      select: { id: true, name: true, phone: true, email: true, createdAt: true },
    });
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

// Update customer profile
router.patch('/profile', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.sub },
      data: { name: req.body.name, email: req.body.email },
      select: { id: true, name: true, phone: true, email: true },
    });
    sendSuccess(res, user, 'Profile updated');
  } catch (err) { next(err); }
});

// Delete account (GDPR)
router.delete('/account', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { deletedAt: new Date(), isActive: false },
    });
    sendSuccess(res, null, 'Account deleted');
  } catch (err) { next(err); }
});

// Get customer's rewards
router.get('/rewards', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const rewards = await prisma.customerReward.findMany({
      where: { customerId: req.user.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        reward: { select: { id: true, title: true, description: true } },
      },
    });
    sendSuccess(res, rewards);
  } catch (err) { next(err); }
});

export default router;
