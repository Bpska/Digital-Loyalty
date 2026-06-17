 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { writeAuditLog } from '../../middlewares/audit.middleware.js';
import {
  haversineDistance,
  isSuspiciousCoordinates,
} from '../../utils/haversine.js';
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
  const { customerId, qrToken, latitude, longitude, ipAddress, deviceId } = input;

  // ── Step 1: Resolve branch from QR token ─────────────────
  const branch = await prisma.branch.findUnique({
    where: { qrToken },
    include: {
      business: {
        select: {
          id: true,
          name: true,
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

  // ── Step 2: GPS validation ────────────────────────────────
  if (isSuspiciousCoordinates(latitude, longitude)) {
    await createSuspiciousCheckIn({
      customerId,
      businessId: branch.businessId,
      branchId: branch.id,
      latitude,
      longitude,
      distanceMeters: 0,
      ipAddress,
      deviceId,
      reason: 'Suspicious GPS coordinates (null island or out-of-bounds)',
    });
    throw new AppError(
      'Location validation failed. Ensure GPS is enabled and accurate.',
      400
    );
  }

  const distanceMeters = haversineDistance(
    latitude, longitude,
    branch.latitude, branch.longitude
  );

  if (distanceMeters > branch.radiusMeters) {
    await createSuspiciousCheckIn({
      customerId,
      businessId: branch.businessId,
      branchId: branch.id,
      latitude,
      longitude,
      distanceMeters,
      ipAddress,
      deviceId,
      reason: `Too far from branch: ${Math.round(distanceMeters)}m (max ${branch.radiusMeters}m)`,
    });
    throw new AppError(
      `You are too far from this location (${Math.round(distanceMeters)}m away, max ${branch.radiusMeters}m).`,
      400
    );
  }

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
      `You have already checked in at this business today. Only one check-in per business is allowed per day.`,
      429
    );
  }

  // ── Step 4: Transactional check-in + loyalty processing ──
  const result = await prisma.$transaction(async tx => {
    // 4a. Create check-in record
    const checkIn = await tx.checkIn.create({
      data: {
        customerId,
        businessId: branch.businessId,
        branchId: branch.id,
        latitude,
        longitude,
        distanceMeters,
        status: CheckInStatus.VALID,
        ipAddress,
        deviceId,
      },
    });

    // 4b. Get or create CustomerPoints record
    const activePrograms = await tx.loyaltyProgram.findMany({
      where: { businessId: branch.businessId, isActive: true },
      include: { reward: true },
    });

    // Determine points to award from active POINTS_BASED program
    const pointsProgram = activePrograms.find(p => p.type === LoyaltyType.POINTS_BASED);
    const visitProgram = activePrograms.find(p => p.type === LoyaltyType.VISIT_BASED);
    const pointsToAdd = _nullishCoalesce(_optionalChain([pointsProgram, 'optionalAccess', _ => _.pointsPerVisit]), () => ( env.DEFAULT_POINTS_PER_VISIT));

    const customerPoints = await tx.customerPoints.upsert({
      where: {
        customerId_businessId: { customerId, businessId: branch.businessId },
      },
      update: {
        totalPoints: { increment: pointsToAdd },
        totalVisits: { increment: 1 },
        visitStreak: { increment: 1 },
      },
      create: {
        customerId,
        businessId: branch.businessId,
        totalPoints: pointsToAdd,
        totalVisits: 1,
        visitStreak: 1,
      },
    });

    // 4c. Run loyalty engine — check if reward threshold met
    let newlyUnlockedReward = null;

    // VISIT_BASED check
    if (visitProgram && customerPoints.visitStreak >= visitProgram.threshold) {
      newlyUnlockedReward = await unlockReward(tx, customerId, visitProgram, customerPoints.visitStreak);

      // Reset streak
      if (visitProgram.resetMode === LoyaltyResetMode.FULL_RESET) {
        await tx.customerPoints.update({
          where: { customerId_businessId: { customerId, businessId: branch.businessId } },
          data: { visitStreak: 0 },
        });
      } else {
        // CARRY_REMAINDER
        const remainder = customerPoints.visitStreak - visitProgram.threshold;
        await tx.customerPoints.update({
          where: { customerId_businessId: { customerId, businessId: branch.businessId } },
          data: { visitStreak: remainder },
        });
      }
    }

    // POINTS_BASED check (only if VISIT_BASED didn't already unlock)
    if (!newlyUnlockedReward && pointsProgram) {
      const freshPoints = await tx.customerPoints.findUnique({
        where: { customerId_businessId: { customerId, businessId: branch.businessId } },
      });
      if (freshPoints && freshPoints.totalPoints >= pointsProgram.threshold) {
        newlyUnlockedReward = await unlockReward(tx, customerId, pointsProgram, freshPoints.totalPoints);

        // Deduct points (unlock time deduction — see design decision in plan)
        const deductMode =
          pointsProgram.resetMode === LoyaltyResetMode.FULL_RESET
            ? 0
            : freshPoints.totalPoints - pointsProgram.threshold;

        await tx.customerPoints.update({
          where: { customerId_businessId: { customerId, businessId: branch.businessId } },
          data: { totalPoints: deductMode },
        });
      }
    }

    // 4d. Send in-app notification
    const notifMessage = newlyUnlockedReward
      ? `🎉 You've earned: ${newlyUnlockedReward.title}! Show your redemption code at the counter.`
      : `✅ Check-in recorded! You earned ${pointsToAdd} points.`;

    await tx.notification.create({
      data: {
        userId: customerId,
        businessId: branch.businessId,
        title: newlyUnlockedReward ? 'Reward Unlocked! 🎉' : 'Check-in Successful',
        body: notifMessage,
        type: newlyUnlockedReward
          ? NotificationType.REWARD_UNLOCKED
          : NotificationType.GENERAL,
        metadata: {
          branchId: branch.id,
          branchName: branch.name,
          pointsEarned: pointsToAdd,
          rewardId: _optionalChain([newlyUnlockedReward, 'optionalAccess', _2 => _2.id]),
        },
      },
    });

    return {
      checkIn,
      pointsEarned: pointsToAdd,
      totalPoints: customerPoints.totalPoints + pointsToAdd,
      totalVisits: customerPoints.totalVisits + 1,
      visitStreak: customerPoints.visitStreak + 1,
      newlyUnlockedReward,
    };
  });

  logger.info('Check-in processed', {
    customerId,
    branchId: branch.id,
    distanceMeters: Math.round(distanceMeters),
    pointsEarned: result.pointsEarned,
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
      distanceMeters,
      pointsEarned: result.pointsEarned,
    },
    ipAddress,
  }).catch(() => {});

  return result;
}

// ─────────────────────────────────────────────────────────────
// LOYALTY ENGINE (called within transaction)
// ─────────────────────────────────────────────────────────────

/**
 * Unlock a reward for a customer within an ongoing Prisma transaction.
 * Creates a CustomerReward with a unique redemption code.
 */
async function unlockReward(
  tx,
  customerId,
  program



,
  _currentCount
) {
  const customerReward = await tx.customerReward.create({
    data: {
      customerId,
      rewardId: program.rewardId,
      status: CustomerRewardStatus.UNLOCKED,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days to redeem
    },
  });

  return {
    id: customerReward.id,
    title: program.reward.title,
    redemptionCode: customerReward.redemptionCode,
  };
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
    throw new AppError(_nullishCoalesce(statusMessages[customerReward.status], () => ( 'Reward cannot be redeemed')), 400);
  }

  if (customerReward.expiresAt && new Date() > customerReward.expiresAt) {
    await prisma.customerReward.update({
      where: { id: customerReward.id },
      data: { status: CustomerRewardStatus.EXPIRED },
    });
    throw new AppError('Reward has expired', 400);
  }

  // Mark redeemed
  await prisma.customerReward.update({
    where: { id: customerReward.id },
    data: {
      status: CustomerRewardStatus.REDEEMED,
      redeemedAt: new Date(),
      redeemedByStaffId: staffId,
    },
  });

  // Audit log
  await writeAuditLog({
    action: 'REWARD_REDEEMED',
    entityType: 'CustomerReward',
    entityId: customerReward.id,
    userId: staffId,
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

async function createSuspiciousCheckIn(data









) {
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
