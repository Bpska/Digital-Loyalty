 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { Router, raw } from 'express';
import { authenticate, authorize, requireSameBusiness } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { AppError } from '../../middlewares/error.middleware.js';


import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

// ── Get subscription for a business ──────────────────────────
router.get('/business/:businessId', authenticate, requireSameBusiness, async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { businessId: req.params.businessId },
      include: {
        plan: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    sendSuccess(res, subscription);
  } catch (err) { next(err); }
});

async function getSetting(key, defaultValue) {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting ? setting.value : defaultValue;
}

// Helper to calculate pricing details consistently on the server-side
async function calculatePricingDetails(couponCode = null) {
  const activeCount = await prisma.business.count({
    where: { status: 'ACTIVE', deletedAt: null },
  });
  const promoLimit = parseInt(await getSetting('promo_limit', '20'), 10);
  const promoPrice = parseFloat(await getSetting('promo_price', '999'));
  const platformFee = parseFloat(await getSetting('platform_fee', '999'));
  const gstPercent = parseFloat(await getSetting('gst_percent', '18'));
  const gatewayPercent = parseFloat(await getSetting('gateway_percent', '2.3'));

  const isEligibleForPromo = activeCount < promoLimit;
  const basePrice = isEligibleForPromo ? promoPrice : platformFee;

  let discountAmount = 0;
  let appliedBasePrice = basePrice;

  if (couponCode) {
    const key = `coupon_${String(couponCode).trim().toUpperCase()}`;
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (setting) {
      try {
        const couponData = JSON.parse(setting.value);
        if (couponData.discountType === 'PERCENTAGE') {
          discountAmount = parseFloat(((basePrice * parseFloat(couponData.discountValue)) / 100).toFixed(2));
        } else {
          discountAmount = parseFloat(parseFloat(couponData.discountValue).toFixed(2));
        }
        appliedBasePrice = Math.max(0, basePrice - discountAmount);
      } catch (_) {}
    }
  }

  const gatewayAmount = parseFloat(((appliedBasePrice * gatewayPercent) / 100).toFixed(2));
  const gstAmount = parseFloat(((appliedBasePrice * gstPercent) / 100).toFixed(2));
  const totalAmount = parseFloat((appliedBasePrice + gatewayAmount + gstAmount).toFixed(2));

  return {
    activeBusinesses: activeCount,
    promoLimit,
    isEligibleForPromo,
    basePrice,
    discountAmount,
    appliedBasePrice,
    gstPercent,
    gstAmount,
    gatewayPercent,
    gatewayAmount,
    totalAmount,
    currency: 'INR',
  };
}

// ── Get pricing calculation details ──────────────────────────
router.get('/pricing', authenticate, async (req, res, next) => {
  try {
    const couponCode = req.query.coupon;
    const details = await calculatePricingDetails(couponCode);
    sendSuccess(res, details);
  } catch (err) { next(err); }
});

// ── Validate a coupon code ────────────────────────────────────
router.post('/validate-coupon', authenticate, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }
    const key = `coupon_${String(code).trim().toUpperCase()}`;
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }
    let couponData = {};
    try { couponData = JSON.parse(setting.value); } catch (_) {
      return res.status(500).json({ success: false, message: 'Coupon data corrupted.' });
    }
    sendSuccess(res, {
      code: String(code).trim().toUpperCase(),
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      description: couponData.description || '',
    }, 'Coupon is valid');
  } catch (err) { next(err); }
});

// ── Create a Razorpay payment order ──────────────────────────
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { businessId, couponCode } = req.body;
    if (!businessId || businessId === 'null' || businessId === 'undefined') {
      throw new AppError('Business ID is required', 400);
    }
    if (req.user.role !== Role.SUPER_ADMIN && req.user.businessId !== businessId) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, ownerId: req.user.sub, deletedAt: null }
      });
      if (!biz) {
        throw new AppError('Access denied: not your business', 403);
      }
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError('Payment gateway not configured. Please contact support.', 503);
    }

    const details = await calculatePricingDetails(couponCode);
    const { totalAmount } = details;

    if (totalAmount <= 0) {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const plan = await prisma.plan.findFirst({
        where: { isActive: true },
      });
      if (!plan) {
        throw new AppError('No active plan found in database', 500);
      }

      await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.upsert({
          where: { businessId },
          update: {
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodEnd: nextYear,
            razorpaySubscriptionId: `free-promo-${String(couponCode).trim().toUpperCase()}-${Date.now()}`,
          },
          create: {
            businessId,
            planId: plan.id,
            status: 'ACTIVE',
            currentPeriodEnd: nextYear,
            razorpaySubscriptionId: `free-promo-${String(couponCode).trim().toUpperCase()}-${Date.now()}`,
          },
        });

        await tx.business.update({
          where: { id: businessId },
          data: { planId: plan.id, status: 'ACTIVE' },
        });

        await tx.payment.create({
          data: {
            subscriptionId: sub.id,
            amount: 0,
            razorpayPaymentId: `free-pay-${Date.now()}`,
            status: 'CAPTURED',
            paidAt: new Date(),
          },
        });
      });

      return sendSuccess(res, {
        isFreeUpgrade: true,
        message: 'You are the Loyal customer!',
      });
    }

    const amountInPaise = Math.round(totalAmount * 100);

    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID.trim(),
      key_secret: env.RAZORPAY_KEY_SECRET.trim(),
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${businessId.slice(0, 10)}_${Date.now()}`,
    });

    sendSuccess(res, {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID.trim(),
      isMock: false,
    });
  } catch (err) { next(err); }
});

// ── Verify Razorpay payment and upgrade subscription ──────────
const verifyPaymentSchema = z.object({
  businessId: z.string(),
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string().optional(),
  couponCode: z.string().optional(),
});

router.post('/verify-payment', authenticate, validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const { businessId, razorpayPaymentId, razorpayOrderId, razorpaySignature, couponCode } = req.body;
    if (!businessId || businessId === 'null' || businessId === 'undefined') {
      throw new AppError('Business ID is required', 400);
    }
    if (req.user.role !== Role.SUPER_ADMIN && req.user.businessId !== businessId) {
      const biz = await prisma.business.findFirst({
        where: { id: businessId, ownerId: req.user.sub, deletedAt: null }
      });
      if (!biz) {
        throw new AppError('Access denied: not your business', 403);
      }
    }

    const isMock = razorpayOrderId.startsWith('mock-order-');
    const details = await calculatePricingDetails(couponCode);
    let finalPrice = details.totalAmount;

    if (!isMock && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID.trim(),
          key_secret: env.RAZORPAY_KEY_SECRET.trim(),
        });
        const rzpOrder = await razorpay.orders.fetch(razorpayOrderId);
        if (rzpOrder && rzpOrder.amount) {
          finalPrice = rzpOrder.amount / 100;
        }
      } catch (err) {
        logger.error('Failed to fetch Razorpay order details during verification', { err });
      }
    }

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const plan = await prisma.plan.findFirst({
      where: { isActive: true },
    });
    if (!plan) {
      throw new AppError('No active plan found in database', 500);
    }

    const subscription = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.upsert({
        where: { businessId },
        update: {
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodEnd: nextYear,
          razorpaySubscriptionId: razorpayOrderId,
        },
        create: {
          businessId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodEnd: nextYear,
          razorpaySubscriptionId: razorpayOrderId,
        },
      });

      await tx.business.update({
        where: { id: businessId },
        data: { planId: plan.id, status: 'ACTIVE' },
      });

      await tx.payment.create({
        data: {
          subscriptionId: sub.id,
          amount: finalPrice,
          razorpayPaymentId,
          status: 'CAPTURED',
          paidAt: new Date(),
          metadata: { isMock, razorpayOrderId, razorpayPaymentId },
        },
      });

      // Creator/Partner Commission logic
      try {
        const referral = await tx.creatorReferral.findUnique({
          where: { businessId },
          include: { creator: true }
        });
        if (referral && finalPrice > 0) {
          const commissionAmount = parseFloat((finalPrice * 0.10).toFixed(2));
          await tx.creatorCommission.create({
            data: {
              creatorId: referral.creatorId,
              businessId,
              amount: commissionAmount,
              status: 'APPROVED',
              paymentOrderId: razorpayOrderId
            }
          });
          
          // Send notification email to creator async outside transaction or inside try/catch safe block
          const { sendGeneralNotificationEmail } = await import('../../utils/email.js');
          await sendGeneralNotificationEmail(
            referral.creator.email,
            'New Commission Earned! 💰',
            `Congratulations! A business you referred has subscribed. You earned 10% commission: <strong>₹${commissionAmount}</strong>.`
          ).catch(e => logger.error('Failed to notify creator email', e));
        }
      } catch (affiliateErr) {
        logger.error('Failed to process affiliate commission inside verify-payment', { affiliateErr });
      }

      return sub;
    });

    sendSuccess(res, subscription, 'Subscription successfully upgraded to Yearly Plan');
  } catch (err) { next(err); }
});

// ── Create/change subscription (Razorpay) ────────────────────
const createSubscriptionSchema = z.object({
  businessId: z.string(),
  planId: z.string(),
});

router.post('/', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), validate(createSubscriptionSchema), async (req, res, next) => {
  try {
    const { businessId, planId } = req.body;
    const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } });

    // TODO: Integrate Razorpay Subscriptions API here
    // For now, create a TRIAL subscription record
    const subscription = await prisma.subscription.upsert({
      where: { businessId },
      update: { planId, status: 'TRIAL' },
      create: { businessId, planId, status: 'TRIAL' },
      include: { plan: true },
    });

    // Update business plan reference
    await prisma.business.update({ where: { id: businessId }, data: { planId } });

    sendCreated(res, subscription, 'Subscription created');
  } catch (err) { next(err); }
});

// ── Razorpay Webhook ──────────────────────────────────────────
// Note: Must use raw body for signature verification
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'] ;
      const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

      if (webhookSecret) {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(req.body )
          .digest('hex');

        if (!crypto.timingSafeEqual(
          Buffer.from(_nullishCoalesce(signature, () => ( ''))),
          Buffer.from(expectedSignature)
        )) {
          sendError(res, 'Invalid webhook signature', 400);
          return;
        }
      }

      const event = JSON.parse((req.body ).toString());
      logger.info('Razorpay webhook received', { event: event.event });

      switch (event.event) {
        case 'subscription.charged': {
          const { subscription_id, payment_id, amount } = event.payload.payment.entity;
          const subscription = await prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: subscription_id },
          });
          if (subscription) {
            await prisma.payment.create({
              data: {
                subscriptionId: subscription.id,
                amount: amount / 100, // Razorpay amounts are in paise
                razorpayPaymentId: payment_id,
                status: 'CAPTURED',
                paidAt: new Date(),
                metadata: event.payload,
              },
            });
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'ACTIVE',
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                gracePeriodEnd: null,
              },
            });
          }
          break;
        }
        case 'subscription.cancelled': {
          const { id: subscription_id } = event.payload.subscription.entity;
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: subscription_id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });
          break;
        }
        case 'payment.failed': {
          const { subscription_id } = event.payload.payment.entity;
          const subscription = await prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: subscription_id },
          });
          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'PAST_DUE',
                gracePeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
            // Auto-suspend business if grace period expires (handled by a cron job in Phase 12)
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
