import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import prisma from '../../config/prisma.js';
import { z } from 'zod';

const router = Router();

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// Get customer dashboard statistics and programs list
router.get('/dashboard', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const now = new Date();
    const nowForStart = new Date(Date.now() + 14 * 60 * 60 * 1000); // 14 hours forward for UTC+14 starts
    const nowForEnd = new Date(Date.now() - 30 * 60 * 60 * 1000);   // 30 hours backward for UTC-12 expiry

    // Fetch customer's visited business loyalty cards
    const loyaltyCards = await prisma.customerPoints.findMany({
      where: { customerId: req.user.sub },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            coverUrl: true,
            description: true,
            instagramUrl: true,
            facebookUrl: true,
            whatsappUrl: true,
            googleReviewUrl: true,
            category: true,
            bookingUrl: true,
            branches: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
                radiusMeters: true,
              }
            },
            loyaltyProgramSettings: {
              select: {
                id: true,
                programName: true,
                pointsPerRupee: true,
                pointsPerStamp: true,
                requiredStamps: true,
                rewardName: true,
                validityDays: true,
                bonusThresholdAmount: true,
                pointsPerRupeeAboveThreshold: true,
              },
            },
            userWallets: {
              where: { userId: req.user.sub },
              select: {
                id: true,
                currentPoints: true,
                currentStamps: true,
                pointsBalance: true,
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
                validFrom: { lte: nowForStart },
                validTo: { gte: nowForEnd },
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

    // Fetch global points settings
    const [globalRupeeSetting, globalStampSetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'points_per_rupee' } }),
      prisma.systemSetting.findUnique({ where: { key: 'points_per_stamp' } }),
    ]);
    const globalPointsPerRupee = globalRupeeSetting ? parseFloat(globalRupeeSetting.value) : 0.1;
    const globalPointsPerStamp = globalStampSetting ? parseInt(globalStampSetting.value, 10) : 50;

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
          pointsBalance: wallet.pointsBalance || 0,
          startedAt: null,
          expiresAt: null,
        };
      }
      const settings = card.business.loyaltyProgramSettings 
        ? {
            ...card.business.loyaltyProgramSettings,
            pointsPerRupee: globalPointsPerRupee,
            pointsPerStamp: card.business.loyaltyProgramSettings.pointsPerStamp ?? globalPointsPerStamp,
          }
        : {
            programName: 'Coffee Rewards',
            pointsPerRupee: globalPointsPerRupee,
            pointsPerStamp: globalPointsPerStamp,
            requiredStamps: 7,
            rewardName: 'Free Coffee',
            validityDays: 30,
            bonusThresholdAmount: 500,
            pointsPerRupeeAboveThreshold: 0.1,
          };

      const validCoupons = (card.business.coupons || []).filter(
        c => c.usageLimit === null || c.totalUsed < c.usageLimit
      );

      const visitWallet = card.business.loyaltyWallets?.[0] || null;
      const visitProgram = card.business.loyaltyPrograms?.find(p => p.type === 'VISIT_BASED') || null;
      let visitCard = null;
      if (visitProgram || visitWallet) {
        visitCard = {
          settings: {
            programName: visitProgram ? 'Stamp Program' : 'Visit Rewards',
            rewardName: visitProgram?.reward?.title || 'Free Reward',
            requiredStamps: visitProgram?.threshold || 7,
            validityDays: 30,
          },
          wallet: visitWallet || {
            currentStamps: 0,
            status: 'ACTIVE',
          }
        };
      }

      return {
        ...card,
        wallet,
        settings,
        visitCard,
        business: {
          ...card.business,
          coupons: validCoupons,
        },
      };
    }));

    const [unlockedRewards, activeCampaigns, activeEventCoupons, claimedCoupons, redeemedRewards, redeemedCoupons] = await Promise.all([
      prisma.customerReward.findMany({
        where: {
          customerId: req.user.sub,
          status: 'UNLOCKED',
          reward: { isActive: true },
        },
        include: {
          reward: {
            select: {
              id: true,
              title: true,
              description: true,
              businessId: true,
              isActive: true,
              business: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  googleReviewUrl: true,
                }
              }
            }
          },
        },
      }),
      prisma.coupon.findMany({
        where: {
          isActive: true,
          eventDate: null,
          validFrom: { lte: nowForStart },
          validTo: { gte: nowForEnd },
          business: { status: 'ACTIVE', deletedAt: null },
        },
        include: {
          business: {
            select: { id: true, name: true, logoUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.findMany({
        where: {
          isActive: true,
          eventDate: { not: null },
          validFrom: { lte: nowForStart },
          validTo: { gte: nowForEnd },
          business: { status: 'ACTIVE', deletedAt: null },
          claims: {
            none: { customerId: req.user.sub }
          }
        },
        include: {
          business: {
            select: { id: true, name: true, logoUrl: true }
          }
        },
        orderBy: { eventDate: 'asc' }
      }),
      prisma.claimedCoupon.findMany({
        where: {
          customerId: req.user.sub,
          status: 'CLAIMED',
          coupon: { isActive: true }
        },
        include: {
          coupon: {
            include: {
              business: {
                select: { id: true, name: true, logoUrl: true, googleReviewUrl: true }
              }
            }
          }
        },
        orderBy: { claimedAt: 'desc' }
      }),
      prisma.customerReward.findMany({
        where: {
          customerId: req.user.sub,
          status: 'REDEEMED',
          reward: { isActive: true },
        },
        include: {
          reward: {
            select: {
              id: true,
              title: true,
              description: true,
              businessId: true,
              isActive: true,
              business: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                }
              }
            }
          },
        },
        orderBy: { redeemedAt: 'desc' }
      }),
      prisma.claimedCoupon.findMany({
        where: {
          customerId: req.user.sub,
          status: 'REDEEMED',
          coupon: { isActive: true }
        },
        include: {
          coupon: {
            include: {
              business: {
                select: { id: true, name: true, logoUrl: true }
              }
            }
          }
        },
        orderBy: { redeemedAt: 'desc' }
      })
    ]);

    const filteredCampaigns = activeCampaigns.filter(c => c.usageLimit === null || c.totalUsed < c.usageLimit);

    sendSuccess(res, {
      loyaltyCards: loyaltyCardsWithFilteredCoupons,
      unlockedRewards,
      activeCampaigns: filteredCampaigns,
      activeEventCoupons,
      claimedCoupons,
      redeemedRewards,
      redeemedCoupons
    });
  } catch (err) { next(err); }
});

// GET /customer/profile — retrieve customer details
router.get('/profile', authenticate, authorize(Role.CUSTOMER), async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.sub },
      select: { id: true, name: true, phone: true, email: true, createdAt: true },
    });
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

// PATCH /customer/profile — update customer details
router.patch('/profile', authenticate, authorize(Role.CUSTOMER), validate(profileSchema), async (req, res, next) => {
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

    const customerPointsList = await prisma.customerPoints.findMany({
      where: { customerId: req.user.sub },
    });

    const userWalletsList = await prisma.userWallet.findMany({
      where: { userId: req.user.sub },
    });

    const totalPointsEarned = customerPointsList.reduce((sum, cp) => sum + cp.totalPoints, 0);
    const totalExtraPoints = userWalletsList.reduce((sum, w) => sum + w.pointsBalance, 0);

    sendSuccess(res, {
      rewards,
      totalPointsEarned,
      totalExtraPoints,
    });
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
