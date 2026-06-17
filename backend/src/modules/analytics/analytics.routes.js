import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
import { sendSuccess } from '../../utils/response.js';
import prisma from '../../config/prisma.js';


const router = Router();

// Get analytics for a business
router.get('/business/:businessId', authenticate, authorize(Role.BUSINESS_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      totalCheckIns,
      checkInsToday,
      checkInsThisWeek,
      checkInsThisMonth,
      totalRewardsIssued,
      totalRewardsRedeemed,
      activeCoupons,
    ] = await Promise.all([
      prisma.customerPoints.count({ where: { businessId } }),
      prisma.checkIn.count({ where: { businessId, status: 'VALID' } }),
      prisma.checkIn.count({ where: { businessId, status: 'VALID', createdAt: { gte: new Date(now.toDateString()) } } }),
      prisma.checkIn.count({ where: { businessId, status: 'VALID', createdAt: { gte: sevenDaysAgo } } }),
      prisma.checkIn.count({ where: { businessId, status: 'VALID', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.customerReward.count({
        where: { reward: { businessId }, status: { in: ['UNLOCKED', 'REDEEMED'] } },
      }),
      prisma.customerReward.count({ where: { reward: { businessId }, status: 'REDEEMED' } }),
      prisma.coupon.count({ where: { businessId, isActive: true, validTo: { gte: now } } }),
    ]);

    // Repeat customer rate: customers with >1 visit / total customers
    const repeatCustomers = await prisma.customerPoints.count({
      where: { businessId, totalVisits: { gt: 1 } },
    });

    const repeatRate = totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 100)
      : 0;

    const redemptionRate = totalRewardsIssued > 0
      ? Math.round((totalRewardsRedeemed / totalRewardsIssued) * 100)
      : 0;

    // Monthly check-in trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const checkInsByMonth = await prisma.checkIn.groupBy({
      by: ['createdAt'],
      where: { businessId, status: 'VALID', createdAt: { gte: sixMonthsAgo } },
      _count: true,
    });

    sendSuccess(res, {
      totalCustomers,
      totalCheckIns,
      checkInsToday,
      checkInsThisWeek,
      checkInsThisMonth,
      totalRewardsIssued,
      totalRewardsRedeemed,
      activeCoupons,
      repeatRate,
      redemptionRate,
      monthlyTrend: checkInsByMonth,
    });
  } catch (err) { next(err); }
});

export default router;
