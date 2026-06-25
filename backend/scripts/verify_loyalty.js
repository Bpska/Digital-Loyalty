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
    },
    create: {
      businessId,
      programName: 'Coffee Rewards',
      pointsPerRupee: 0.1,
      pointsPerStamp: 50,
      requiredStamps: 7,
      rewardName: 'Free Coffee',
      validityDays: 30,
    },
  });

  console.log('Settings configured:', settings);

  // Helper to approve and log
  async function simulatePurchase(amount) {
    console.log(`\n--- Simulating Purchase of ₹${amount} ---`);
    const pointsEarned = Math.floor(amount * settings.pointsPerRupee);
    console.log(`Points earned: ${pointsEarned}`);

    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.userWallet.findUnique({
        where: { userId_businessId: { userId: customerId, businessId } },
      });

      if (!wallet) {
        wallet = await tx.userWallet.create({
          data: { userId: customerId, businessId, currentPoints: 0, currentStamps: 0 },
        });
      }

      const prevPoints = wallet.currentPoints;
      const totalPointsAcc = prevPoints + pointsEarned;
      const stampsEarned = Math.floor(totalPointsAcc / settings.pointsPerStamp);
      const remainingPoints = totalPointsAcc % settings.pointsPerStamp;

      const updatedWallet = await tx.userWallet.update({
        where: { id: wallet.id },
        data: {
          currentPoints: remainingPoints,
          currentStamps: wallet.currentStamps + stampsEarned,
        },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          userId: customerId,
          businessId,
          purchaseValue: amount,
          pointsEarned,
          stampEarned: stampsEarned,
        },
      });

      return { prevPoints, updatedWallet, txRecord };
    });

    console.log(`Wallet state updated:`);
    console.log(`- Previous Points: ${result.prevPoints}`);
    console.log(`- Points Added: ${pointsEarned}`);
    console.log(`- Current Points: ${result.updatedWallet.currentPoints}`);
    console.log(`- Current Stamps: ${result.updatedWallet.currentStamps}`);
    return result.updatedWallet;
  }

  // 3. Purchase Flow tests
  // Small Purchase (₹50)
  let wallet = await simulatePurchase(50);
  if (wallet.currentPoints !== 5 || wallet.currentStamps !== 0) {
    throw new Error('Small purchase calculation failed!');
  }

  // Medium Purchase (₹250)
  wallet = await simulatePurchase(250);
  if (wallet.currentPoints !== 30 || wallet.currentStamps !== 0) {
    throw new Error('Medium purchase calculation failed!');
  }

  // Large Purchase (₹300)
  wallet = await simulatePurchase(300);
  if (wallet.currentPoints !== 10 || wallet.currentStamps !== 1) {
    throw new Error('Large purchase calculation/stamp-conversion failed!');
  }

  // 4. Redemption Tests
  console.log('\n4. Simulating more purchases to reach 7 stamps...');
  // Add ₹1500 (150 points -> 3 stamps, remaining: 10 + 150 = 160 -> 10 points, 3 stamps added -> 4 stamps total)
  wallet = await simulatePurchase(1500);
  // Add another ₹1500 (150 points -> 3 stamps, remaining: 10 + 150 = 160 -> 10 points, 3 stamps added -> 7 stamps total)
  wallet = await simulatePurchase(1500);

  if (wallet.currentStamps !== 7) {
    throw new Error(`Stamps count is ${wallet.currentStamps}, expected 7!`);
  }

  console.log('\nStamps reached 7! Attempting stamp redemption...');
  // Find or create reward template
  let reward = await prisma.reward.findFirst({
    where: { businessId, title: settings.rewardName, isActive: true },
  });
  if (!reward) {
    reward = await prisma.reward.create({
      data: {
        businessId,
        title: settings.rewardName,
        description: 'Redeemed from stamps',
        pointsRequired: 0,
        isActive: true,
      },
    });
  }

  const redemptionResult = await prisma.$transaction(async (tx) => {
    // Deduct stamps
    const updatedWallet = await tx.userWallet.update({
      where: { userId_businessId: { userId: customerId, businessId } },
      data: {
        currentStamps: wallet.currentStamps - settings.requiredStamps,
      },
    });

    const redemptionCode = 'rw-test-code';
    const expiresAt = new Date(Date.now() + settings.validityDays * 24 * 60 * 60 * 1000);

    const customerReward = await tx.customerReward.create({
      data: {
        customerId,
        rewardId: reward.id,
        status: 'UNLOCKED',
        redemptionCode,
        expiresAt,
      },
    });

    return { updatedWallet, customerReward };
  });

  console.log('\nRedemption completed:');
  console.log(`- Wallet stamps remaining: ${redemptionResult.updatedWallet.currentStamps}`);
  console.log(`- Created CustomerReward: ${redemptionResult.customerReward.id} with title "${settings.rewardName}"`);

  if (redemptionResult.updatedWallet.currentStamps !== 0) {
    throw new Error('Stamp deduction failed!');
  }

  console.log('\n✅ All tests passed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
