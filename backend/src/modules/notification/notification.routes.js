import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.js';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { saveSubscription } from './push.service.js';

const router = Router();

// Get user notifications (paginated)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.sub },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId: req.user.sub } }),
    ]);
    sendSuccess(res, notifications, 'Notifications', 200, buildPaginationMeta(page, limit, total));
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
