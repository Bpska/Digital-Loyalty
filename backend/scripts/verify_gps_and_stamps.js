import prisma from '../src/config/prisma.js';
import { processCheckIn, redeemReward } from '../src/modules/checkin/checkin.service.js';
import { Role } from '@prisma/client';

async function main() {
  console.log('=== GPS and Stamp Card Verification Script ===\n');

  // 1. Setup test entities
  console.log('1. Setting up test entities...');
  const testPhoneCustomer = '7777777777';
  const testPhoneOwner = '6666666666';
  const testPhoneStaff = '5555555555';
  const businessName = 'GPS Coffee Lab';

  let customer = await prisma.user.findUnique({ where: { phone: testPhoneCustomer } });
  if (!customer) {
    customer = await prisma.user.create({
      data: { name: 'Rahul GPS Test', phone: testPhoneCustomer, role: 'CUSTOMER', isActive: true },
    });
  }

  let owner = await prisma.user.findUnique({ where: { phone: testPhoneOwner } });
  if (!owner) {
    owner = await prisma.user.create({
      data: { name: 'GPS Owner Test', phone: testPhoneOwner, role: 'BUSINESS_ADMIN', isActive: true },
    });
  }

  let business = await prisma.business.findFirst({ where: { name: businessName } });
  if (!business) {
    business = await prisma.business.create({
      data: { name: businessName, ownerId: owner.id, status: 'ACTIVE', timezone: 'Asia/Kolkata' },
    });
  }

  // Set up a branch with a clean QR token and GPS coordinates
  // coordinates: Connaught Place, New Delhi (28.6304, 77.2177)
  const branchLat = 28.6304;
  const branchLon = 77.2177;
  const qrToken = 'test-gps-qr-token-123';

  let branch = await prisma.branch.findUnique({ where: { qrToken } });
  if (branch) {
    await prisma.checkIn.deleteMany({ where: { branchId: branch.id } });
    await prisma.branch.delete({ where: { qrToken } });
  }
  branch = await prisma.branch.create({
    data: {
      name: 'Connaught Place Outlet',
      address: 'CP, New Delhi',
      latitude: branchLat,
      longitude: branchLon,
      radiusMeters: 100, // 100 meters
      qrToken,
      businessId: business.id,
      isActive: true,
    },
  });

  // Setup staff
  let staffUser = await prisma.user.findUnique({ where: { phone: testPhoneStaff } });
  if (!staffUser) {
    staffUser = await prisma.user.create({
      data: { name: 'CP Staff', phone: testPhoneStaff, role: 'STAFF', isActive: true },
    });
  }
  let staff = await prisma.staff.findUnique({ where: { userId: staffUser.id } });
  if (!staff) {
    staff = await prisma.staff.create({
      data: { userId: staffUser.id, businessId: business.id, branchId: branch.id },
    });
  }

  // Clean up any old check-ins or wallets for this customer & business
  await prisma.checkIn.deleteMany({ where: { customerId: customer.id, businessId: business.id } });
  await prisma.customerLoyaltyWallet.deleteMany({ where: { userId: customer.id, businessId: business.id } });
  await prisma.customerReward.deleteMany({ where: { customerId: customer.id, reward: { businessId: business.id } } });
  await prisma.notification.deleteMany({ where: { userId: customer.id, businessId: business.id } });

  // Set up Loyalty Settings
  const settings = await prisma.loyaltyProgramSettings.upsert({
    where: { businessId: business.id },
    update: {
      programName: 'GPS Stamp Program',
      pointsPerRupee: 0.1,
      pointsPerStamp: 50,
      requiredStamps: 3, // Set to 3 for quick verification
      rewardName: 'Free GPS Brew',
      validityDays: 30,
      maxDailyStamps: 1,
    },
    create: {
      businessId: business.id,
      programName: 'GPS Stamp Program',
      pointsPerRupee: 0.1,
      pointsPerStamp: 50,
      requiredStamps: 3,
      rewardName: 'Free GPS Brew',
      validityDays: 30,
      maxDailyStamps: 1,
    },
  });

  console.log('Entities configured and clean.');

  // 2. Test GPS verification
  console.log('\n2. Testing GPS verification...');

  // Test Case A: Null / missing coordinates
  try {
    console.log('Submitting check-in with NO coordinates...');
    await processCheckIn({
      customerId: customer.id,
      qrToken,
      deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
      ipAddress: '127.0.0.1',
      latitude: null,
      longitude: null,
    });
    throw new Error('Allowed check-in with null coordinates!');
  } catch (err) {
    if (err.message === 'Please visit the business location to collect loyalty stamps.') {
      console.log('✅ Correctly rejected null coordinates.');
    } else {
      throw err;
    }
  }

  // Verify suspicious check-in logged
  const suspiciousCount1 = await prisma.checkIn.count({
    where: { customerId: customer.id, branchId: branch.id, status: 'SUSPICIOUS' },
  });
  if (suspiciousCount1 !== 1) {
    throw new Error(`Expected 1 suspicious check-in record, found ${suspiciousCount1}`);
  }
  console.log('✅ Suspicious check-in record verified in DB.');

  // Test Case B: Coordinates out of bounds (e.g. Mumbai coordinates: 19.0760, 72.8777)
  try {
    console.log('Submitting check-in with out-of-bounds coordinates (Mumbai)...');
    await processCheckIn({
      customerId: customer.id,
      qrToken,
      deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
      ipAddress: '127.0.0.1',
      latitude: 19.0760,
      longitude: 72.8777,
    });
    throw new Error('Allowed check-in with out-of-bounds coordinates!');
  } catch (err) {
    if (err.message === 'Please visit the business location to collect loyalty stamps.') {
      console.log('✅ Correctly rejected out-of-bounds coordinates.');
    } else {
      throw err;
    }
  }

  // Test Case C: Valid coordinates (New Delhi: 28.6305, 77.2178 - approx 15m away)
  console.log('Submitting check-in with valid coordinates (15 meters away)...');
  const validCheckInResult = await processCheckIn({
    customerId: customer.id,
    qrToken,
    deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
    ipAddress: '127.0.0.1',
    latitude: 28.6305,
    longitude: 77.2178,
  });

  console.log('✅ Check-in processed successfully!');
  console.log(`- Distance: ${Math.round(validCheckInResult.checkIn.distanceMeters)}m`);
  console.log(`- Notification Title: "${validCheckInResult.notifTitle}"`);
  if (validCheckInResult.notifTitle !== 'Loyalty program started.') {
    throw new Error(`Expected notification title "Loyalty program started.", got "${validCheckInResult.notifTitle}"`);
  }

  // 3. Test daily limit
  console.log('\n3. Testing daily check-in limit...');
  try {
    console.log('Attempting second check-in on the same day...');
    await processCheckIn({
      customerId: customer.id,
      qrToken,
      deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
      ipAddress: '127.0.0.1',
      latitude: 28.6305,
      longitude: 77.2178,
    });
    throw new Error('Allowed duplicate check-in on the same day!');
  } catch (err) {
    if (err.message === "You have already collected today's loyalty stamp.") {
      console.log("✅ Correctly rejected: You have already collected today's loyalty stamp.");
    } else {
      throw err;
    }
  }

  // 4. Test wallet transitions and reward unlocks
  console.log('\n4. Simulating consecutive day check-ins to unlock reward...');
  
  // Clean check-ins to bypass daily limit for testing, keeping the wallet active
  await prisma.checkIn.deleteMany({ where: { customerId: customer.id, businessId: business.id } });

  // Stamp 2
  console.log('Simulating Stamp 2 check-in...');
  const checkIn2 = await processCheckIn({
    customerId: customer.id,
    qrToken,
    deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
    ipAddress: '127.0.0.1',
    latitude: 28.6305,
    longitude: 77.2178,
  });
  console.log(`- Current Stamps: ${checkIn2.wallet.currentStamps}`);
  if (checkIn2.notifTitle !== 'Stamp added successfully.') {
    throw new Error(`Expected notification "Stamp added successfully.", got "${checkIn2.notifTitle}"`);
  }

  // Clear check-ins again to bypass limit
  await prisma.checkIn.deleteMany({ where: { customerId: customer.id, businessId: business.id } });

  // Stamp 3 (Goal Met!)
  console.log('Simulating Stamp 3 check-in (threshold reached)...');
  const checkIn3 = await processCheckIn({
    customerId: customer.id,
    qrToken,
    deviceId: 'a87263b6-71d3-48b4-8ee1-d30d94eb5df3',
    ipAddress: '127.0.0.1',
    latitude: 28.6305,
    longitude: 77.2178,
  });
  console.log(`- Current Stamps: ${checkIn3.wallet.currentStamps}`);
  console.log(`- Wallet Status: ${checkIn3.wallet.status}`);
  console.log(`- Reward Unlocked:`, checkIn3.newlyUnlockedReward);
  console.log(`- Notification Title: "${checkIn3.notifTitle}"`);

  if (checkIn3.wallet.status !== 'REWARD_AVAILABLE') {
    throw new Error(`Expected wallet status REWARD_AVAILABLE, got ${checkIn3.wallet.status}`);
  }
  if (checkIn3.notifTitle !== 'You unlocked a reward.') {
    throw new Error(`Expected notification "You unlocked a reward.", got "${checkIn3.notifTitle}"`);
  }
  if (!checkIn3.newlyUnlockedReward) {
    throw new Error('Reward record was not returned in result!');
  }

  // 5. Test reward redemption
  console.log('\n5. Testing reward redemption...');
  const redemptionCode = checkIn3.newlyUnlockedReward.redemptionCode;
  console.log(`Redeeming reward with code: ${redemptionCode}`);
  
  const redemptionRes = await redeemReward(redemptionCode, staff.id, business.id);
  console.log('Redemption response:', redemptionRes);

  // Verify wallet status is now REDEEMED
  const updatedWallet = await prisma.customerLoyaltyWallet.findFirst({
    where: { userId: customer.id, businessId: business.id },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`- Post-redemption wallet status: ${updatedWallet.status}`);
  if (updatedWallet.status !== 'REDEEMED') {
    throw new Error(`Expected wallet status REDEEMED, got ${updatedWallet.status}`);
  }

  console.log('\n✅ All Geofenced GPS and Stamp Card tests passed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
