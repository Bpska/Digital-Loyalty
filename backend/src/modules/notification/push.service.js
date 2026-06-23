import webpush from 'web-push';
import { env } from '../../config/env.js';
import prisma from '../../config/prisma.js';
import { logger } from '../../utils/logger.js';

let isConfigured = false;

function initWebPush() {
  if (isConfigured) return true;

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    logger.warn('⚠️ Web Push VAPID keys not configured in environment. Push notifications are disabled.');
    return false;
  }

  try {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );
    isConfigured = true;
    logger.info('✅ Web Push VAPID details set successfully');
    return true;
  } catch (err) {
    logger.error('Failed to configure Web Push VAPID keys', { err });
    return false;
  }
}

/**
 * Save or update a push subscription for a user.
 */
export async function saveSubscription(userId, subscription) {
  if (!subscription || !subscription.endpoint) {
    throw new Error('Invalid push subscription payload');
  }

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: subscription.endpoint },
  });

  if (existing) {
    if (existing.userId !== userId) {
      // Re-assign to new user if endpoint exists
      return prisma.pushSubscription.update({
        where: { id: existing.id },
        data: { userId, keys: subscription.keys || {} },
      });
    }
    return existing;
  }

  return prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys || {},
    },
  });
}

/**
 * Deliver a push notification payload to all subscriptions associated with a user.
 */
export async function sendPushToUser(userId, title, body, url = '/') {
  const ready = initWebPush();
  if (!ready) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return;
  }

  logger.info(`Sending push notification to user ${userId} across ${subscriptions.length} devices.`);

  const payload = JSON.stringify({
    title,
    message: body,
    url,
  });

  const promises = subscriptions.map(sub => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: sub.keys,
    };

    return webpush.sendNotification(pushSubscription, payload)
      .catch(async (err) => {
        // If the subscription is no longer active (410 Gone or 404 Not Found), remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          logger.info(`Removing expired push subscription endpoint: ${sub.endpoint}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          logger.error(`Error sending push notification to endpoint ${sub.endpoint}`, { err });
        }
      });
  });

  await Promise.all(promises);
}
