 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { Router, raw } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';


import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

// ── Get subscription for a business ──────────────────────────
router.get('/business/:businessId', authenticate, async (req, res, next) => {
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
