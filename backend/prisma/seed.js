 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import {
  /** default import */ PrismaClient,
  Role,
  PlanName,
  BusinessStatus,
  SubscriptionStatus,
  LoyaltyType,
  LoyaltyResetMode,
  DiscountType,
} from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function generateQrToken(branchId) {
  const secret = _nullishCoalesce(process.env.QR_HMAC_SECRET, () => ( 'dev-qr-secret'));
  return crypto
    .createHmac('sha256', secret)
    .update(`${branchId}-${Date.now()}`)
    .digest('hex');
}

// ─────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── 1. Plans ─────────────────────────────────────────────
  const [starterPlan, growthPlan, enterprisePlan] = await Promise.all([
    prisma.plan.upsert({
      where: { name: PlanName.STARTER },
      update: {},
      create: {
        name: PlanName.STARTER,
        priceMonthly: 999,
        maxBranches: 1,
        maxCustomers: 500,
        features: {
          analyticsAccess: false,
          customBranding: false,
          csvExport: false,
          apiAccess: false,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: PlanName.GROWTH },
      update: {},
      create: {
        name: PlanName.GROWTH,
        priceMonthly: 2499,
        maxBranches: 5,
        maxCustomers: 5000,
        features: {
          analyticsAccess: true,
          customBranding: false,
          csvExport: true,
          apiAccess: false,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: PlanName.ENTERPRISE },
      update: {},
      create: {
        name: PlanName.ENTERPRISE,
        priceMonthly: 7499,
        maxBranches: 50,
        maxCustomers: 100000,
        features: {
          analyticsAccess: true,
          customBranding: true,
          csvExport: true,
          apiAccess: true,
        },
      },
    }),
  ]);
  console.log('✅ Plans seeded:', [starterPlan.name, growthPlan.name, enterprisePlan.name]);

  // ── 2. Super Admin ───────────────────────────────────────
  const superAdminPassword = await argon2.hash('SuperAdmin@123');
  const superAdmin = await prisma.user.upsert({
    where: { phone: '+919000000000' },
    update: {},
    create: {
      name: 'Platform Admin',
      phone: '+919000000000',
      email: 'admin@dlvsaas.com',
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin seeded:', superAdmin.email);

  // ── 3. Business Admin Users ──────────────────────────────
  const adminPassword = await argon2.hash('Business@123');

  const cafeOwner = await prisma.user.upsert({
    where: { phone: '+919100000001' },
    update: {},
    create: {
      name: 'Ramesh Pattnaik',
      phone: '+919100000001',
      email: 'ramesh@brewsbypattnaik.com',
      passwordHash: adminPassword,
      role: Role.BUSINESS_ADMIN,
    },
  });

  const salonOwner = await prisma.user.upsert({
    where: { phone: '+919100000002' },
    update: {},
    create: {
      name: 'Priya Das',
      phone: '+919100000002',
      email: 'priya@glamourzone.in',
      passwordHash: adminPassword,
      role: Role.BUSINESS_ADMIN,
    },
  });
  console.log('✅ Business admin users seeded:', [cafeOwner.name, salonOwner.name]);

  // ── 4. Businesses ────────────────────────────────────────
  const cafe = await prisma.business.upsert({
    where: { id: 'seed-business-cafe' },
    update: {},
    create: {
      id: 'seed-business-cafe',
      name: "Brews by Pattnaik",
      phone: '+91910000001',
      address: 'MG Road, Bhubaneswar, Odisha 751001',
      timezone: 'Asia/Kolkata',
      status: BusinessStatus.ACTIVE,
      ownerId: cafeOwner.id,
      planId: growthPlan.id,
    },
  });

  const salon = await prisma.business.upsert({
    where: { id: 'seed-business-salon' },
    update: {},
    create: {
      id: 'seed-business-salon',
      name: 'Glamour Zone Salon',
      phone: '+91910000002',
      address: 'Sahid Nagar, Bhubaneswar, Odisha 751007',
      timezone: 'Asia/Kolkata',
      status: BusinessStatus.ACTIVE,
      ownerId: salonOwner.id,
      planId: starterPlan.id,
    },
  });
  console.log('✅ Businesses seeded:', [cafe.name, salon.name]);

  // ── 5. Subscriptions ─────────────────────────────────────
  await prisma.subscription.upsert({
    where: { businessId: cafe.id },
    update: {},
    create: {
      businessId: cafe.id,
      planId: growthPlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.upsert({
    where: { businessId: salon.id },
    update: {},
    create: {
      businessId: salon.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.TRIAL,
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Subscriptions seeded');

  // ── 6. Branches ──────────────────────────────────────────
  const cafeBranch1 = await prisma.branch.upsert({
    where: { qrToken: 'seed-qr-cafe-branch-1' },
    update: {},
    create: {
      name: 'MG Road Outlet',
      address: 'MG Road, Bhubaneswar',
      latitude: 20.2961,
      longitude: 85.8245,
      radiusMeters: 50,
      qrToken: 'seed-qr-cafe-branch-1',
      businessId: cafe.id,
    },
  });

  const cafeBranch2 = await prisma.branch.upsert({
    where: { qrToken: 'seed-qr-cafe-branch-2' },
    update: {},
    create: {
      name: 'Patia Square Outlet',
      address: 'Patia, Bhubaneswar',
      latitude: 20.3537,
      longitude: 85.8169,
      radiusMeters: 75,
      qrToken: 'seed-qr-cafe-branch-2',
      businessId: cafe.id,
    },
  });

  const salonBranch = await prisma.branch.upsert({
    where: { qrToken: 'seed-qr-salon-branch-1' },
    update: {},
    create: {
      name: 'Sahid Nagar Branch',
      address: 'Sahid Nagar, Bhubaneswar',
      latitude: 20.2847,
      longitude: 85.8281,
      radiusMeters: 30,
      qrToken: 'seed-qr-salon-branch-1',
      businessId: salon.id,
    },
  });
  console.log('✅ Branches seeded:', [cafeBranch1.name, cafeBranch2.name, salonBranch.name]);

  // ── 7. Staff Users ───────────────────────────────────────
  const staffPassword = await argon2.hash('Staff@123');

  const cafeStaffUser = await prisma.user.upsert({
    where: { phone: '+919200000001' },
    update: {},
    create: {
      name: 'Suresh Mahapatra',
      phone: '+919200000001',
      email: 'staff@brewsbypattnaik.com',
      role: Role.STAFF,
      passwordHash: staffPassword,
    },
  });

  const cafeStaff = await prisma.staff.upsert({
    where: { userId: cafeStaffUser.id },
    update: {},
    create: {
      userId: cafeStaffUser.id,
      businessId: cafe.id,
      branchId: cafeBranch1.id,
      permissions: { canManualCheckin: false },
    },
  });
  console.log('✅ Staff seeded:', cafeStaffUser.name, '→', cafeBranch1.name);

  // ── 8. Rewards ───────────────────────────────────────────
  const cafeReward = await prisma.reward.upsert({
    where: { id: 'seed-reward-cafe-free-coffee' },
    update: {},
    create: {
      id: 'seed-reward-cafe-free-coffee',
      title: 'Free Filter Coffee',
      description: 'Redeem for one free filter coffee of your choice',
      pointsRequired: 0,
      isActive: true,
      businessId: cafe.id,
    },
  });

  const salonReward = await prisma.reward.upsert({
    where: { id: 'seed-reward-salon-free-wash' },
    update: {},
    create: {
      id: 'seed-reward-salon-free-wash',
      title: 'Free Hair Wash',
      description: 'Complimentary hair wash on your 5th visit',
      pointsRequired: 0,
      isActive: true,
      businessId: salon.id,
    },
  });
  console.log('✅ Rewards seeded');

  // ── 9. Loyalty Programs ──────────────────────────────────
  await prisma.loyaltyProgram.upsert({
    where: { id: 'seed-loyalty-cafe-visit' },
    update: {},
    create: {
      id: 'seed-loyalty-cafe-visit',
      type: LoyaltyType.VISIT_BASED,
      threshold: 5,
      pointsPerVisit: 10,
      resetMode: LoyaltyResetMode.FULL_RESET,
      isActive: true,
      businessId: cafe.id,
      rewardId: cafeReward.id,
    },
  });

  await prisma.loyaltyProgram.upsert({
    where: { id: 'seed-loyalty-salon-visit' },
    update: {},
    create: {
      id: 'seed-loyalty-salon-visit',
      type: LoyaltyType.VISIT_BASED,
      threshold: 5,
      pointsPerVisit: 10,
      resetMode: LoyaltyResetMode.FULL_RESET,
      isActive: true,
      businessId: salon.id,
      rewardId: salonReward.id,
    },
  });
  console.log('✅ Loyalty programs seeded');

  // ── 10. Sample Coupon ─────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      title: '20% Off Your First Visit',
      description: 'Valid for first-time customers at any outlet',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      businessId: cafe.id,
    },
  });
  console.log('✅ Sample coupon seeded: WELCOME20');

  // ── 11. Demo Customers ───────────────────────────────────
  const customerPassword = await argon2.hash('Customer@123');
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { phone: '+919300000001' },
      update: {},
      create: {
        name: 'Ananya Mishra',
        phone: '+919300000001',
        email: 'ananya@gmail.com',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+919300000002' },
      update: {},
      create: {
        name: 'Bikash Nayak',
        phone: '+919300000002',
        email: 'bikash@gmail.com',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+919300000003' },
      update: {},
      create: {
        name: 'Chinmaya Sahoo',
        phone: '+919300000003',
        email: 'chinmaya@gmail.com',
        passwordHash: customerPassword,
        role: Role.CUSTOMER,
      },
    }),
  ]);
  console.log('✅ Demo customers seeded:', customers.map(c => c.name));

  // ── 12. Customer Points (demo data) ──────────────────────
  await Promise.all(
    customers.map((customer, i) =>
      prisma.customerPoints.upsert({
        where: { customerId_businessId: { customerId: customer.id, businessId: cafe.id } },
        update: {},
        create: {
          customerId: customer.id,
          businessId: cafe.id,
          totalPoints: (i + 1) * 30,
          totalVisits: i + 1,
          visitStreak: i + 1,
        },
      })
    )
  );
  console.log('✅ Customer points seeded');

  console.log('\n🎉 Database seed completed successfully!\n');
  console.log('─────────────────────────────────────────────────');
  console.log('Seed credentials:');
  console.log('  Super Admin  → admin@dlvsaas.com / SuperAdmin@123');
  console.log('  Cafe Owner   → ramesh@brewsbypattnaik.com / Business@123');
  console.log('  Salon Owner  → priya@glamourzone.in / Business@123');
  console.log('  Staff        → staff@brewsbypattnaik.com / Staff@123');
  console.log('  Customers    → {ananya,bikash,chinmaya}@gmail.com / Customer@123');
  console.log('─────────────────────────────────────────────────\n');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
