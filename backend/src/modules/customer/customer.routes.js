import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { sendSuccess } from '../../utils/response.js';

import prisma from '../../config/prisma.js';

const router = Router();

// Get customer's loyalty dashboard (all businesses they've visited)
router.get('/dashboard', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const now = new Date();

    const loyaltyCards = await prisma.customerPoints.findMany({
      where: { customerId: req.user.sub },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            instagramUrl: true,
            facebookUrl: true,
            whatsappUrl: true,
            googleReviewUrl: true,
            category: true,
            bookingUrl: true,
            loyaltyProgramSettings: {
              select: {
                id: true,
                programName: true,
                pointsPerRupee: true,
                pointsPerStamp: true,
                requiredStamps: true,
                rewardName: true,
                validityDays: true,
              },
            },
            userWallets: {
              where: { userId: req.user.sub },
              select: {
                id: true,
                currentPoints: true,
                currentStamps: true,
                startedAt: true,
                expiresAt: true,
              },
            },
            loyaltyWallets: {
              where: {
                userId: req.user.sub,
                status: { in: ['ACTIVE', 'REWARD_AVAILABLE'] },
              },
              select: {
                id: true,
                currentStamps: true,
                status: true,
                startedAt: true,
                expiresAt: true,
              },
            },
            loyaltyPrograms: {
              where: {
                isActive: true,
                reward: { isActive: true },
              },
              select: {
                id: true,
                type: true,
                threshold: true,
                pointsPerVisit: true,
                reward: { select: { id: true, title: true, description: true, isActive: true } },
              },
            },
            coupons: {
              where: {
                isActive: true,
                validFrom: { lte: now },
                validTo: { gte: now },
              },
              select: {
                id: true,
                code: true,
                title: true,
                description: true,
                discountType: true,
                discountValue: true,
                validFrom: true,
                validTo: true,
                usageLimit: true,
                totalUsed: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Filter out coupons that have hit their usage cap and attach wallet/settings
    // Check and reset expired hybrid wallets on the fly
    const loyaltyCardsWithFilteredCoupons = await Promise.all(loyaltyCards.map(async card => {
      let wallet = card.business.userWallets?.[0] || null;
      if (wallet && wallet.expiresAt && now > wallet.expiresAt) {
        await prisma.userWallet.update({
          where: { id: wallet.id },
          data: {
            currentPoints: 0,
            currentStamps: 0,
            startedAt: null,
            expiresAt: null,
          },
        });
        wallet = {
          id: wallet.id,
          currentPoints: 0,
          currentStamps: 0,
          startedAt: null,
          expiresAt: null,
        };
      }
      const settings = card.business.loyaltyProgramSettings || null;
      const loyaltyWallet = card.business.loyaltyWallets?.[0] || null;
      
      const businessCopy = { ...card.business };
      delete businessCopy.userWallets;
      delete businessCopy.loyaltyProgramSettings;
      delete businessCopy.loyaltyWallets;
      
      return {
        ...card,
        wallet,
        settings,
        loyaltyWallet,
        business: {
          ...businessCopy,
          coupons: card.business.coupons.filter(
            c => c.usageLimit === null || c.totalUsed < c.usageLimit
          ),
        },
      };
    }));

    const unlockedRewards = await prisma.customerReward.findMany({
      where: {
        customerId: req.user.sub,
        status: 'UNLOCKED',
        reward: { isActive: true },
      },
      include: {
        reward: { select: { id: true, title: true, description: true, businessId: true, isActive: true } },
      },
    });

    sendSuccess(res, { loyaltyCards: loyaltyCardsWithFilteredCoupons, unlockedRewards });
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

// Submit support message
router.post('/support-message', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const customer = await prisma.user.findUniqueOrThrow({ where: { id: req.user.sub } });
    const superAdmins = await prisma.user.findMany({
      where: { role: Role.SUPER_ADMIN, deletedAt: null },
    });

    await Promise.all(
      superAdmins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: `Support Message from ${customer.name}`,
            body: message.trim(),
            type: 'GENERAL',
            metadata: {
              senderId: customer.id,
              senderName: customer.name,
              senderPhone: customer.phone,
              senderEmail: customer.email,
              message: message.trim(),
            },
          },
        })
      )
    );

    sendSuccess(res, null, 'Message sent to customer support');
  } catch (err) { next(err); }
});

export default router;
