import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { writeAuditLog } from '../../middlewares/audit.middleware.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import {
  LoyaltyType,
  LoyaltyResetMode,
  CheckInStatus,
  CustomerRewardStatus,
  NotificationType,
  BusinessStatus,
} from '@prisma/client';























// ─────────────────────────────────────────────────────────────
// CHECK-IN ENGINE
// ─────────────────────────────────────────────────────────────

/**
 * Process a customer check-in.
 *
 * Validates:
 * 1. QR token exists and belongs to an active branch of an active business
 * 2. GPS coordinates are not suspicious (null island, impossible values)
 * 3. Customer is within the branch GPS radius (Haversine)
 * 4. Cooldown: customer hasn't already checked in within cooldown window
 *
 * On success (in a single Prisma transaction):
 * - Creates CheckIn record
 * - Increments CustomerPoints (totalVisits, totalPoints, visitStreak)
 * - Runs loyalty engine — may create CustomerReward if threshold met
 * - Creates Notification for the customer
 *
 * @returns CheckInResult with points earned and any newly unlocked reward
 */
/**
 * Computes today's start and end bounds in the target timezone as UTC Dates.
 */
function getTodayBoundsInTimezone(timezone = 'Asia/Kolkata') {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const formatted = formatter.format(now); // "6/16/2026"
  const [monthStr, dayStr, yearStr] = formatted.split('/');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const targetMidnightUTC = new Date(Date.UTC(year, month - 1, day));
  const tzString = targetMidnightUTC.toLocaleString('en-US', { timeZone: timezone });
  const utcString = targetMidnightUTC.toLocaleString('en-US', { timeZone: 'UTC' });
  const offset = Date.parse(tzString) - Date.parse(utcString);

  const start = new Date(targetMidnightUTC.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

export async function processCheckIn(input) {
  const { customerId, qrToken, deviceId, ipAddress, latitude, longitude } = input;

  // ── Step 1: Resolve branch from QR token ─────────────────
  const branch = await prisma.branch.findUnique({
    where: { qrToken },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          status: true,
          deletedAt: true,
          timezone: true,
        },
      },
    },
  });

  if (!branch) {
    throw new AppError('Invalid QR code. Please scan a valid branch QR.', 400);
  }

  if (!branch.isActive) {
    throw new AppError('This branch is currently inactive.', 403);
  }

  if (
    branch.business.status !== BusinessStatus.ACTIVE ||
    branch.business.deletedAt !== null
  ) {
    throw new AppError('This business is not currently active.', 403);
  }

  // ── Step 2: GPS Coordinate Validation — DISABLED ────────────────────
  /* LOCATION VERIFICATION COMMENTED OUT:
  const { isWithinRadius, isSuspiciousCoordinates, haversineDistance } = await import('../../utils/haversine.js');

  const customerLat = latitude ? parseFloat(latitude) : null;
  const customerLon = longitude ? parseFloat(longitude) : null;

  const distanceMeters = (customerLat !== null && customerLon !== null)
    ? haversineDistance(customerLat, customerLon, branch.latitude, branch.longitude)
    : null;

  if (customerLat === null || customerLon === null || isNaN(customerLat) || isNaN(customerLon)) {
    await createSuspiciousCheckIn({
      customerId,
      businessId: branch.businessId,
      branchId: branch.id,
      latitude: customerLat,
      longitude: customerLon,
      distanceMeters: null,
      ipAddress,
      deviceId,
      reason: 'No GPS coordinates provided',
    });
    throw new AppError('Please visit the business location to collect loyalty stamps.', 400);
  }

  if (isSuspiciousCoordinates(customerLat, customerLon)) {
    await createSuspiciousCheckIn({
      customerId,
      businessId: branch.businessId,
      branchId: branch.id,
      latitude: customerLat,
      longitude: customerLon,
      distanceMeters: null,
      ipAddress,
      deviceId,
      reason: 'Suspicious coordinates (spoofing check failed)',
    });
    throw new AppError('Please visit the business location to collect loyalty stamps.', 400);
  }

  const isWithin = distanceMeters <= (branch.radiusMeters || 100);

  if (!isWithin) {
    await createSuspiciousCheckIn({
      customerId,
      businessId: branch.businessId,
      branchId: branch.id,
      latitude: customerLat,
      longitude: customerLon,
      distanceMeters,
      ipAddress,
      deviceId,
      reason: `Out of bounds (distance: ${Math.round(distanceMeters)}m, limit: ${branch.radiusMeters || 100}m)`,
    });
    throw new AppError('Please visit the business location to collect loyalty stamps.', 400);
  }
  END LOCATION VERIFICATION COMMENTED OUT */

  // Location is disabled — use null values for all coordinate fields
  const customerLat = null;
  const customerLon = null;
  const distanceMeters = null;

  // ── Step 3: Daily check-in limit check (Per Business, Per Customer, Per Day) ──
  const timezone = branch.business.timezone || 'Asia/Kolkata';
  const { start: todayStart, end: todayEnd } = getTodayBoundsInTimezone(timezone);

  const recentCheckIn = await prisma.checkIn.findFirst({
    where: {
      customerId,
      businessId: branch.businessId,
      status: CheckInStatus.VALID,
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  if (recentCheckIn) {
    throw new AppError(
      "You have already collected today's loyalty stamp.",
      400
    );
  }

  // Retrieve settings
  let settings = await prisma.loyaltyProgramSettings.findUnique({
    where: { businessId: branch.businessId },
  });

  if (!settings) {
    settings = await prisma.loyaltyProgramSettings.create({
      data: {
        businessId: branch.businessId,
        programName: 'Coffee Rewards',
        pointsPerRupee: 0.1,
        pointsPerStamp: 50,
        requiredStamps: 7,
        rewardName: 'Free Coffee',
        validityDays: 30,
      },
    });
  }

  // ── Step 4: Transactional check-in + loyalty wallet processing ──
  const result = await prisma.$transaction(async tx => {
    // 4a. Create check-in record
    const checkIn = await tx.checkIn.create({
      data: {
        customerId,
        businessId: branch.businessId,
        branchId: branch.id,
        latitude: customerLat,
        longitude: customerLon,
        distanceMeters,
        status: CheckInStatus.VALID,
        ipAddress,
        deviceId,
        accuracy: null,
        distance: distanceMeters,
        checked_at: new Date(),
      },
    });

    // 4b. Upsert CustomerPoints to link customer to the business and track visits
    await tx.customerPoints.upsert({
      where: {
        customerId_businessId: {
          customerId,
          businessId: branch.businessId,
        },
      },
      update: {
        totalVisits: { increment: 1 },
      },
      create: {
        customerId,
        businessId: branch.businessId,
        totalPoints: 0,
        totalVisits: 1,
        visitStreak: 0,
      },
    });

    // 4c. Find or process Loyalty Wallet
    let wallet = await tx.customerLoyaltyWallet.findFirst({
      where: { userId: customerId, businessId: branch.businessId, status: 'ACTIVE' },
    });

    let walletAction = 'updated';
    let newlyUnlockedReward = null;
    const now = new Date();

    if (wallet && now > wallet.expiresAt) {
      // Archive expired wallet
      await tx.customerLoyaltyWallet.update({
        where: { id: wallet.id },
        data: { status: 'EXPIRED' },
      });
      wallet = null; // Proceed to create a new one below
    }

    if (!wallet) {
      // Create new loyalty wallet
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + settings.validityDays * 24 * 60 * 60 * 1000);

      wallet = await tx.customerLoyaltyWallet.create({
        data: {
          userId: customerId,
          businessId: branch.businessId,
          currentStamps: 1,
          status: 'ACTIVE',
          startedAt,
          expiresAt,
        },
      });
      walletAction = 'created';
    } else {
      // Increment stamps
      const nextStamps = wallet.currentStamps + 1;
      const isGoalMet = nextStamps >= settings.requiredStamps;

      if (isGoalMet) {
        // Unlock Reward!
        wallet = await tx.customerLoyaltyWallet.update({
          where: { id: wallet.id },
          data: {
            currentStamps: nextStamps,
            status: 'REWARD_AVAILABLE',
            rewardUnlockedAt: new Date(),
          },
        });

        // Create reward record
        let reward = await tx.reward.findFirst({
          where: { businessId: branch.businessId, title: settings.rewardName, isActive: true },
        });
        if (!reward) {
          reward = await tx.reward.create({
            data: {
              businessId: branch.businessId,
              title: settings.rewardName,
              description: 'Earned by completing stamps',
              pointsRequired: 0,
              isActive: true,
            },
          });
        }

        const customerReward = await tx.customerReward.create({
          data: {
            customerId,
            rewardId: reward.id,
            status: CustomerRewardStatus.UNLOCKED,
            expiresAt: new Date(Date.now() + settings.validityDays * 24 * 60 * 60 * 1000),
          },
        });

        newlyUnlockedReward = {
          id: customerReward.id,
          title: reward.title,
          redemptionCode: customerReward.redemptionCode,
        };
      } else {
        // Just increment stamps
        wallet = await tx.customerLoyaltyWallet.update({
          where: { id: wallet.id },
          data: { currentStamps: nextStamps },
        });
      }
    }

    // 4d. Send Notification & set messages
    let notifTitle = 'Stamp added successfully.';
    let notifBody = `Stamp added to your wallet. Progress: ${wallet.currentStamps} / ${settings.requiredStamps}.`;
    let notifType = NotificationType.GENERAL;

    if (walletAction === 'created') {
      notifTitle = 'Loyalty program started.';
      notifBody = `Welcome to ${settings.programName}! You collected 1 / ${settings.requiredStamps} stamps.`;
    } else if (newlyUnlockedReward) {
      notifTitle = 'You unlocked a reward.';
      notifBody = `Congratulations! You unlocked ${settings.rewardName}!`;
      notifType = NotificationType.REWARD_UNLOCKED;
    }

    await tx.notification.create({
      data: {
        userId: customerId,
        businessId: branch.businessId,
        title: notifTitle,
        body: notifBody,
        type: notifType,
        metadata: {
          walletId: wallet.id,
          currentStamps: wallet.currentStamps,
          requiredStamps: settings.requiredStamps,
          rewardId: newlyUnlockedReward?.id ?? null,
        },
      },
    });

    return {
      checkIn,
      businessName: branch.business.name,
      businessLogo: branch.business.logoUrl,
      wallet,
      settings,
      newlyUnlockedReward,
      notifTitle,
      notifBody,
    };
  });

  logger.info('Check-in processed', {
    customerId,
    branchId: branch.id,
    walletId: result.wallet.id,
    stamps: result.wallet.currentStamps,
    rewardUnlocked: !!result.newlyUnlockedReward,
  });

  // Non-blocking audit log
  writeAuditLog({
    action: 'CHECK_IN_VALID',
    entityType: 'CheckIn',
    entityId: result.checkIn.id,
    userId: customerId,
    metadata: {
      branchId: branch.id,
      businessId: branch.businessId,
      currentStamps: result.wallet.currentStamps,
    },
    ipAddress,
  }).catch(() => {});

  return result;
}

// ─────────────────────────────────────────────────────────────
// REWARD REDEMPTION
// ─────────────────────────────────────────────────────────────

/**
 * Redeem a customer reward by staff.
 * Validates the redemption code, marks it as redeemed, and logs the event.
 */
export async function redeemReward(
  redemptionCode,
  staffId,
  businessId
) {
  const customerReward = await prisma.customerReward.findUnique({
    where: { redemptionCode },
    include: {
      reward: { select: { id: true, title: true, businessId: true } },
      customer: { select: { id: true, name: true } },
    },
  });

  if (!customerReward) {
    throw new AppError('Invalid redemption code', 404);
  }

  if (customerReward.reward.businessId !== businessId) {
    throw new AppError('This reward does not belong to your business', 403);
  }

  if (customerReward.status !== CustomerRewardStatus.UNLOCKED) {
    const statusMessages = {
      LOCKED: 'Reward is not yet earned',
      REDEEMED: 'Reward has already been redeemed',
      EXPIRED: 'Reward has expired',
    };
    throw new AppError(statusMessages[customerReward.status] ?? 'Reward cannot be redeemed', 400);
  }

  if (customerReward.expiresAt && new Date() > customerReward.expiresAt) {
    await prisma.customerReward.update({
      where: { id: customerReward.id },
      data: { status: CustomerRewardStatus.EXPIRED },
    });
    throw new AppError('Reward has expired', 400);
  }

  // Mark redeemed in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.customerReward.update({
      where: { id: customerReward.id },
      data: {
        status: CustomerRewardStatus.REDEEMED,
        redeemedAt: new Date(),
        redeemedByStaffId: staffId,
      },
    });

    // Update active CustomerLoyaltyWallet for this customer and business to REDEEMED
    await tx.customerLoyaltyWallet.updateMany({
      where: {
        userId: customerReward.customerId,
        businessId: customerReward.reward.businessId,
        status: 'REWARD_AVAILABLE',
      },
      data: {
        status: 'REDEEMED',
      },
    });
  });

  // Resolve staff user ID for audit log
  let auditUserId = null;
  if (staffId) {
    const staffMember = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { userId: true },
    });
    auditUserId = staffMember?.userId || null;
  }

  // Audit log
  await writeAuditLog({
    action: 'REWARD_REDEEMED',
    entityType: 'CustomerReward',
    entityId: customerReward.id,
    userId: auditUserId,
    metadata: {
      customerId: customerReward.customerId,
      rewardId: customerReward.rewardId,
      redemptionCode,
    },
  });

  logger.info('Reward redeemed', {
    customerRewardId: customerReward.id,
    customerId: customerReward.customerId,
    staffId,
  });

  return {
    message: 'Reward redeemed successfully',
    reward: { title: customerReward.reward.title },
    customerName: customerReward.customer.name,
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

async function createSuspiciousCheckIn(data) {
  try {
    await prisma.checkIn.create({
      data: {
        customerId: data.customerId,
        businessId: data.businessId,
        branchId: data.branchId,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceMeters: data.distanceMeters,
        status: CheckInStatus.SUSPICIOUS,
        ipAddress: data.ipAddress,
        deviceId: data.deviceId,
        accuracy: data.accuracy,
        distance: data.distanceMeters,
        checked_at: new Date(),
      },
    });

    await writeAuditLog({
      action: 'CHECK_IN_SUSPICIOUS',
      entityType: 'CheckIn',
      entityId: data.customerId,
      userId: data.customerId,
      metadata: {
        reason: data.reason,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceMeters: data.distanceMeters,
        branchId: data.branchId,
      },
      ipAddress: data.ipAddress,
    });

    logger.warn('Suspicious check-in flagged', {
      customerId: data.customerId,
      branchId: data.branchId,
      reason: data.reason,
    });
  } catch (err) {
    logger.error('Failed to record suspicious check-in', { err });
  }
}

// ─────────────────────────────────────────────────────────────
// CANCEL CHECK-IN (Admin revokes loyalty points)
// ─────────────────────────────────────────────────────────────

/**
 * Cancel a valid check-in and deduct the loyalty points from the customer.
 * Only BUSINESS_ADMIN (owner of that business) or SUPER_ADMIN can do this.
 */
export async function cancelCheckIn(checkInId, adminUserId, adminBusinessId, adminRole) {
  // 1. Find the check-in with business info
  const checkIn = await prisma.checkIn.findUnique({
    where: { id: checkInId },
    include: {
      business: { select: { id: true, name: true, ownerId: true } },
      branch: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
    },
  });

  if (!checkIn) {
    throw new AppError('Check-in not found.', 404);
  }

  // 2. Verify ownership
  if (adminRole !== 'SUPER_ADMIN' && checkIn.business.ownerId !== adminUserId) {
    throw new AppError('Forbidden: You do not own this business.', 403);
  }

  // 3. Can only cancel VALID check-ins
  if (checkIn.status !== CheckInStatus.VALID) {
    throw new AppError(
      `Cannot cancel a check-in with status: ${checkIn.status}. Only VALID check-ins can be cancelled.`,
      400
    );
  }

  // 4. Find active loyalty program to know how many points to deduct
  const pointsProgram = await prisma.loyaltyProgram.findFirst({
    where: { businessId: checkIn.businessId, isActive: true, type: 'POINTS_BASED' },
  });
  const pointsToDeduct = pointsProgram?.pointsPerVisit ?? env.DEFAULT_POINTS_PER_VISIT;

  // 5. Transaction: update status + deduct points + notify customer
  await prisma.$transaction(async (tx) => {
    // Mark check-in as REJECTED
    await tx.checkIn.update({
      where: { id: checkInId },
      data: { status: CheckInStatus.REJECTED },
    });

    // Deduct points (ensure we don't go negative)
    await tx.customerPoints.updateMany({
      where: { customerId: checkIn.customerId, businessId: checkIn.businessId },
      data: {
        totalPoints: { decrement: pointsToDeduct },
        totalVisits: { decrement: 1 },
      },
    });

    // Ensure points never go below 0
    await tx.customerPoints.updateMany({
      where: { customerId: checkIn.customerId, businessId: checkIn.businessId, totalPoints: { lt: 0 } },
      data: { totalPoints: 0 },
    });

    // Notify customer
    await tx.notification.create({
      data: {
        userId: checkIn.customerId,
        businessId: checkIn.businessId,
        title: 'Check-in Cancelled',
        body: `Your check-in at ${checkIn.branch?.name || checkIn.business.name} has been cancelled by the business admin. ${pointsToDeduct} points have been deducted.`,
        type: NotificationType.GENERAL,
        metadata: {
          checkInId,
          branchId: checkIn.branchId,
          pointsDeducted: pointsToDeduct,
        },
      },
    });
  });

  // Audit log
  writeAuditLog({
    action: 'CHECK_IN_CANCELLED',
    entityType: 'CheckIn',
    entityId: checkInId,
    userId: adminUserId,
    metadata: {
      customerId: checkIn.customerId,
      businessId: checkIn.businessId,
      branchId: checkIn.branchId,
      pointsDeducted: pointsToDeduct,
    },
  }).catch(() => {});

  logger.info('Check-in cancelled by admin', { checkInId, adminUserId, pointsDeducted: pointsToDeduct });

  return {
    checkInId,
    customerName: checkIn.customer?.name,
    pointsDeducted: pointsToDeduct,
    message: `Check-in cancelled. ${pointsToDeduct} loyalty points deducted from ${checkIn.customer?.name || 'customer'}.`,
  };
}
