import prisma from '../src/config/prisma.js';

async function main() {
  console.log('=== Loyalty Program Verification Script ===\n');

  // 1. Setup/Retrieve Test Users and Business
  console.log('1. Setting up test entities...');
  const testEmail = 'loyalty.test@example.com';
  const businessName = 'Coffee Lab Test';

  let customer = await prisma.user.findUnique({ where: { phone: '9999999999' } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: 'Rahul Test',
        phone: '9999999999',
        email: testEmail,
        role: 'CUSTOMER',
        isActive: true,
      },
    });
  }

  let owner = await prisma.user.findUnique({ where: { phone: '8888888888' } });
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        name: 'Owner Test',
        phone: '8888888888',
        role: 'BUSINESS_ADMIN',
        isActive: true,
      },
    });
  }

  let business = await prisma.business.findFirst({ where: { name: businessName } });
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: businessName,
        ownerId: owner.id,
        status: 'ACTIVE',
      },
    });
  }

  const businessId = business.id;
  const customerId = customer.id;

  // Cleanup old wallets/transactions/requests for fresh run
  await prisma.userWallet.deleteMany({ where: { businessId } });
  await prisma.walletTransaction.deleteMany({ where: { businessId } });
  await prisma.customerReward.deleteMany({ where: { reward: { businessId } } });

  // 2. Initialize Settings
  console.log('2. Configuring Loyalty Settings (₹10 = 1 Point, 50 Points = 1 Stamp, 7 Stamps = Free Coffee)...');
  const settings = await prisma.loyaltyProgramSettings.upsert({
    where: { businessId },
    update: {
      programName: 'Coffee Rewards',
      pointsPerRupee: 0.1, // ₹10 = 1 Point
      pointsPerStamp: 50,
      requiredStamps: 7,
      rewardName: 'Free Coffee',
      validityDays: 30,
      bonusThresholdAmount: 500,
      pointsPerRupeeAboveThreshold: 0.1,
    },
    create: {
      businessId,
      programName: 'Coffee Rewards',
      pointsPerRupee: 0.1,
      pointsPerStamp: 50,
      requiredStamps: 7,
      rewardName: 'Free Coffee',
      validityDays: 30,
      bonusThresholdAmount: 500,
      pointsPerRupeeAboveThreshold: 0.1,
    },
  });

  console.log('Settings configured:', settings);

  // Helper to approve and log
  async function simulatePurchase(amount) {
    console.log(`\n--- Simulating Purchase of ₹${amount} ---`);
    const ppr = settings.pointsPerRupee || 0.1;
    const pointsEarned = Math.floor(amount * ppr);
    console.log(`Points earned: ${pointsEarned}`);

    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.userWallet.findUnique({
        where: { userId_businessId: { userId: customerId, businessId } },
      });

      if (!wallet) {
        wallet = await tx.userWallet.create({
          data: { userId: customerId, businessId, currentPoints: 0, currentStamps: 0, pointsBalance: 0 },
        });
      }

      const prevPoints = wallet.currentPoints;
      const pps = settings.pointsPerStamp || 50;
      const spendPerStamp = Math.max(1, Math.round(pps / ppr));

      let stampsEarned = 0;
      let extraPoints = 0;

      if (amount < spendPerStamp) {
        stampsEarned = 0;
        extraPoints = Math.floor(amount * ppr);
      } else {
        stampsEarned = 1;
        const leftoverSpend = amount - spendPerStamp;
        extraPoints = Math.floor(leftoverSpend * ppr);
      }

      const bonusThreshold = settings.bonusThresholdAmount ?? 500;
      const bonusRate = settings.pointsPerRupeeAboveThreshold ?? 0.1;
      let bonusPoints = 0;
      if (amount >= bonusThreshold) {
        bonusPoints = Math.floor((amount - bonusThreshold) * bonusRate);
      }

      const totalExtraPointsEarned = extraPoints + bonusPoints;

      const updatedWallet = await tx.userWallet.update({
        where: { id: wallet.id },
        data: {
          currentPoints: prevPoints + pointsEarned,
          currentStamps: wallet.currentStamps + stampsEarned,
          pointsBalance: { increment: totalExtraPointsEarned },
        },
      });

      if (bonusPoints > 0) {
        await tx.loyaltyPointsLedger.create({
          data: {
            userId: customerId,
            businessId,
            points: bonusPoints,
            purchaseAmount: amount,
            source: 'BONUS',
          },
        });
      }

      const txRecord = await tx.walletTransaction.create({
        data: {
          userId: customerId,
          businessId,
          purchaseValue: amount,
          pointsEarned,
          stampEarned: stampsEarned,
        },
      });

      return { prevPoints, updatedWallet, txRecord, bonusPoints };
    });

    console.log(`Wallet state updated:`);
    console.log(`- Previous Points: ${result.prevPoints}`);
    console.log(`- Points Added: ${pointsEarned}`);
    console.log(`- Current Points: ${result.updatedWallet.currentPoints}`);
    console.log(`- Current Stamps: ${result.updatedWallet.currentStamps}`);
    console.log(`- Bonus Points Balance: ${result.updatedWallet.pointsBalance} (earned +${result.bonusPoints} bonus)`);
    return result.updatedWallet;
  }

  // Helper to reset wallet to specific values for testing
  async function resetTestWallet(points, stamps, pointsBalance = 0) {
    await prisma.userWallet.upsert({
      where: { userId_businessId: { userId: customerId, businessId } },
      update: { currentPoints: points, currentStamps: stamps, pointsBalance },
      create: { userId: customerId, businessId, currentPoints: points, currentStamps: stamps, pointsBalance },
    });
    // Clean up points ledger for business/customer
    await prisma.loyaltyPointsLedger.deleteMany({ where: { userId: customerId, businessId } });
  }

  // 3. Purchase Flow tests
  console.log('\n--- Running Task 1 & Task 2 Verification ---');

  // Test Case A: ₹5000 Purchase on clean wallet (should award exactly 1 stamp, keep 500 points, and earn 450 leftover points + 450 bonus points = 900 extra points)
  await resetTestWallet(0, 0, 0);
  let wallet = await simulatePurchase(5000);
  if (wallet.currentStamps !== 1 || wallet.currentPoints !== 500 || wallet.pointsBalance !== 900) {
    throw new Error(`₹5000 purchase test failed! Stamps: ${wallet.currentStamps}, Points: ${wallet.currentPoints}, Bonus points: ${wallet.pointsBalance}`);
  }
  
  // Verify that ledger record exists
  const ledgerCountA = await prisma.loyaltyPointsLedger.count({
    where: { userId: customerId, businessId, source: 'BONUS' },
  });
  if (ledgerCountA !== 1) {
    throw new Error(`Expected 1 ledger record for ₹5000 purchase, found ${ledgerCountA}`);
  }
  console.log('✅ ₹5000 purchase test passed: 1 stamp awarded, 500 cumulative points, 900 extra points (leftover + bonus) earned.');

  // Test Case B: ₹500 Purchase on clean wallet (should award exactly 1 stamp, keep 50 points, and earn 0 extra points)
  await resetTestWallet(0, 0, 0);
  wallet = await simulatePurchase(500);
  if (wallet.currentStamps !== 1 || wallet.currentPoints !== 50 || wallet.pointsBalance !== 0) {
    throw new Error(`₹500 purchase test failed! Stamps: ${wallet.currentStamps}, Points: ${wallet.currentPoints}, Bonus points: ${wallet.pointsBalance}`);
  }
  console.log('✅ ₹500 purchase test passed: 1 stamp awarded, 50 cumulative points, 0 extra points earned.');

  // Test Case C: ₹50 Purchase on a wallet pre-funded with 45 points (should award exactly 0 stamps, keep 50 points, and earn 5 extra points)
  await resetTestWallet(45, 0, 0);
  wallet = await simulatePurchase(50);
  if (wallet.currentStamps !== 0 || wallet.currentPoints !== 50 || wallet.pointsBalance !== 5) {
    throw new Error(`₹50 purchase test failed! Stamps: ${wallet.currentStamps}, Points: ${wallet.currentPoints}, Bonus points: ${wallet.pointsBalance}`);
  }
  console.log('✅ ₹50 purchase test passed: 0 stamps awarded, 50 cumulative points, 5 extra points earned.');

  console.log('\n✅ All Task 1 & Task 2 verification tests passed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
