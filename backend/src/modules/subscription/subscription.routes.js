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

// ── Get pricing calculation details ──────────────────────────
router.get('/pricing', authenticate, async (req, res, next) => {
  try {
    const activeCount = await prisma.business.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });
    const promoLimit = parseInt(await getSetting('promo_limit', '20'), 10);
    const promoPrice = parseFloat(await getSetting('promo_price', '999'));
    const platformFee = parseFloat(await getSetting('platform_fee', '999'));
    const gstPercent = parseFloat(await getSetting('gst_percent', '5'));
    const gatewayPercent = parseFloat(await getSetting('gateway_percent', '2.3'));

    const isEligibleForPromo = activeCount < promoLimit;
    const basePrice = isEligibleForPromo ? promoPrice : platformFee;
    const gatewayAmount = parseFloat(((basePrice * gatewayPercent) / 100).toFixed(2));
    const gstAmount = parseFloat(((basePrice * gstPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((basePrice + gatewayAmount + gstAmount).toFixed(2));

    sendSuccess(res, {
      activeBusinesses: activeCount,
      promoLimit,
      isEligibleForPromo,
      basePrice,
      gstPercent,
      gstAmount,
      gatewayPercent,
      gatewayAmount,
      totalAmount,
      currency: 'INR',
    });
  } catch (err) { next(err); }
});

// ── Create a Razorpay payment order ──────────────────────────
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { businessId } = req.body;
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

    const activeCount = await prisma.business.count({
      where: { status: 'ACTIVE', deletedAt: null },
    });
    const promoLimit = parseInt(await getSetting('promo_limit', '20'), 10);
    const promoPrice = parseFloat(await getSetting('promo_price', '999'));
    const platformFee = parseFloat(await getSetting('platform_fee', '999'));
    const gstPercent = parseFloat(await getSetting('gst_percent', '5'));
    const gatewayPercent = parseFloat(await getSetting('gateway_percent', '2.3'));

    const isEligibleForPromo = activeCount < promoLimit;
    const basePrice = isEligibleForPromo ? promoPrice : platformFee;
    const gatewayAmount = parseFloat(((basePrice * gatewayPercent) / 100).toFixed(2));
    const gstAmount = parseFloat(((basePrice * gstPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((basePrice + gatewayAmount + gstAmount).toFixed(2));

    const amountInPaise = Math.round(totalAmount * 100);

    let orderId = `mock-order-${Date.now()}`;
    let isMock = true;

    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
          key_id: env.RAZORPAY_KEY_ID,
          key_secret: env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${businessId.slice(0, 10)}_${Date.now()}`,
        });
        orderId = order.id;
        isMock = false;
      } catch (err) {
        logger.error('Failed to create Razorpay order, falling back to mock mode', { err });
      }
    }

    sendSuccess(res, {
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      isMock,
    });
  } catch (err) { next(err); }
});

// ── Verify Razorpay payment and upgrade subscription ──────────
const verifyPaymentSchema = z.object({
  businessId: z.string(),
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string().optional(),
});

router.post('/verify-payment', authenticate, validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const { businessId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
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

    if (!isMock && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && razorpaySignature) {
      const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpaySignature) {
        throw new AppError('Payment signature verification failed', 400);
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

      const activeCount = await tx.business.count({
        where: { status: 'ACTIVE', deletedAt: null },
      });
      const promoLimit = parseInt(await getSetting('promo_limit', '20'), 10);
      const promoPrice = parseFloat(await getSetting('promo_price', '999'));
      const platformFee = parseFloat(await getSetting('platform_fee', '999'));
      const gstPercent = parseFloat(await getSetting('gst_percent', '5'));
      const gatewayPercent = parseFloat(await getSetting('gateway_percent', '2.3'));
      const basePrice = activeCount < promoLimit ? promoPrice : platformFee;
      const gatewayAmount = (basePrice * gatewayPercent) / 100;
      const gstAmount = (basePrice * gstPercent) / 100;
      const finalPrice = basePrice + gatewayAmount + gstAmount;

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
