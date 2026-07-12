import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { saveSubscription, sendPushToUser } from './push.service.js';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware.js';
import { AppError } from '../../middlewares/error.middleware.js';

const router = Router();

// Get user notifications (paginated)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.sub },
        include: {
          business: {
            select: { name: true }
          }
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId: req.user.sub } }),
    ]);
    sendSuccess(res, notifications, 'Notifications', 200, buildPaginationMeta(page, limit, total));
  } catch (err) { next(err); }
});

// Send Notification to all customers of a business
const sendNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  type: z.enum(['Offer', 'Coupon', 'Reward', 'Announcement', 'General']),
});

router.post('/send', authenticate, authorize(Role.BUSINESS_ADMIN), validate(sendNotificationSchema), async (req, res, next) => {
  try {
    const { title, message, bannerUrl, type } = req.body;
    const businessId = req.user.businessId;

    if (!businessId) {
      throw new AppError('Business ID not found in profile', 400);
    }

    // Collect all unique customers who joined, scanned, registered, or earned loyalty points
    const customerIds = new Set();

    const cp = await prisma.customerPoints.findMany({
      where: { businessId },
      select: { customerId: true },
    });
    cp.forEach(r => customerIds.add(r.customerId));

    const ci = await prisma.checkIn.findMany({
      where: { businessId },
      select: { customerId: true },
    });
    ci.forEach(r => customerIds.add(r.customerId));

    const cc = await prisma.claimedCoupon.findMany({
      where: { coupon: { businessId } },
      select: { customerId: true },
    });
    cc.forEach(r => customerIds.add(r.customerId));

    const cr = await prisma.customerReward.findMany({
      where: { reward: { businessId } },
      select: { customerId: true },
    });
    cr.forEach(r => customerIds.add(r.customerId));

    const recipientList = Array.from(customerIds);
    const campaignId = `camp_${Date.now()}`;

    if (recipientList.length > 0) {
      // Create notifications in transaction
      await prisma.$transaction(
        recipientList.map(cid =>
          prisma.notification.create({
            data: {
              title,
              body: message,
              type: 'GENERAL',
              userId: cid,
              businessId,
              metadata: {
                campaignId,
                bannerUrl: bannerUrl || null,
                businessNotificationType: type,
              },
            },
          })
        )
      );

      // Async send push notifications
      recipientList.forEach(cid => {
        sendPushToUser(cid, title, message, '/dashboard').catch(() => {});
      });
    }

    sendSuccess(res, { campaignId, recipientsCount: recipientList.length }, 'Notification campaign sent successfully', 201);
  } catch (err) { next(err); }
});

// Get sent campaigns history
router.get('/sent-campaigns', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role === Role.SUPER_ADMIN;
    const businessId = req.user.businessId;

    const whereFilter = isSuperAdmin ? { businessId: { not: null } } : { businessId: businessId };

    const notifications = await prisma.notification.findMany({
      where: whereFilter,
      orderBy: { createdAt: 'desc' },
    });

    const campaignsMap = new Map();
    for (const notif of notifications) {
      const metadata = notif.metadata ? (typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : notif.metadata) : {};
      const campaignId = metadata.campaignId || `legacy_${notif.title}_${notif.createdAt.getTime()}`;

      if (!campaignsMap.has(campaignId)) {
        campaignsMap.set(campaignId, {
          campaignId,
          title: notif.title,
          type: metadata.businessNotificationType || 'General',
          sentDate: notif.createdAt,
          totalRecipients: 0,
          deliveredCount: 0,
          businessName: '',
          businessId: notif.businessId,
        });
      }
      const camp = campaignsMap.get(campaignId);
      camp.totalRecipients += 1;
      camp.deliveredCount += 1;
    }

    if (isSuperAdmin) {
      const businessIds = Array.from(new Set(notifications.map(n => n.businessId).filter(Boolean)));
      const businesses = await prisma.business.findMany({
        where: { id: { in: businessIds } },
        select: { id: true, name: true },
      });
      const bizMap = new Map(businesses.map(b => [b.id, b.name]));
      for (const camp of campaignsMap.values()) {
        camp.businessName = bizMap.get(camp.businessId) || 'Unknown Business';
      }
    }

    sendSuccess(res, Array.from(campaignsMap.values()), 'Sent campaigns retrieved successfully');
  } catch (err) { next(err); }
});

// Mark all as read
router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

// Mark single as read
router.patch('/:notificationId/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.notificationId, userId: req.user.sub },
      data: { isRead: true },
    });
    sendSuccess(res, null, 'Notification marked as read');
  } catch (err) { next(err); }
});

// Unread count
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.sub, isRead: false },
    });
    sendSuccess(res, { count });
  } catch (err) { next(err); }
});

// Get VAPID public key dynamically
router.get('/vapid-key', authenticate, (req, res) => {
  sendSuccess(res, { publicKey: env.VAPID_PUBLIC_KEY || null });
});

// Save push subscription for user
router.post('/subscribe', authenticate, async (req, res, next) => {
  try {
    const { subscription } = req.body;
    await saveSubscription(req.user.sub, subscription);
    sendSuccess(res, null, 'Push subscription saved successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
