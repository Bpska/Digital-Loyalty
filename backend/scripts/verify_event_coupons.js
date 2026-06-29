import prisma from '../src/config/prisma.js';
import { redeemReward } from '../src/modules/checkin/checkin.service.js';

async function main() {
  console.log('=== Event-Day Coupons (Task 4) Verification Script ===\n');

  // 1. Setup/Retrieve Test Entities
  const testEmail = 'loyalty.test@example.com';
  const businessName = 'Coffee Lab Test';

  const customer = await prisma.user.findUniqueOrThrow({ where: { phone: '9999999999' } });
  const business = await prisma.business.findFirstOrThrow({ where: { name: businessName } });

  console.log(`Using Customer: ${customer.name} (ID: ${customer.id})`);
  console.log(`Using Business: ${business.name} (ID: ${business.id})`);

  // Clean up any old test coupons or claims
  await prisma.claimedCoupon.deleteMany({
    where: { customerId: customer.id, coupon: { businessId: business.id } }
  });
  await prisma.coupon.deleteMany({
    where: { businessId: business.id, code: { in: ['EVENT20', 'EVENT40'] } }
  });

  const now = new Date();

  // 2. Create Event-Day Coupon (Active Today)
  console.log('\n2. Creating active event-day coupon EVENT20...');
  const eventCoupon = await prisma.coupon.create({
    data: {
      businessId: business.id,
      code: 'EVENT20',
      title: 'Independence Day Special',
      description: 'Get 20% off at the counter',
      discountType: 'PERCENTAGE',
      discountValue: 20.00,
      validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),   // tomorrow
      eventDate: now,
      offerTitle: 'Independence Day Special',
      offerDescription: 'Independence Day Special Event Coupon',
      isActive: true,
    }
  });
  console.log(`Coupon created: EVENT20 (ID: ${eventCoupon.id}, Event Date: ${eventCoupon.eventDate})`);

  // 3. Simulate Customer Claiming Coupon
  console.log('\n3. Simulating customer claiming coupon EVENT20...');
  const claim = await prisma.claimedCoupon.create({
    data: {
      couponId: eventCoupon.id,
      customerId: customer.id,
      status: 'CLAIMED',
    }
  });
  console.log(`ClaimedCoupon created: ID: ${claim.id}, Code: ${claim.redemptionCode}, Status: ${claim.status}`);

  // 4. Simulate Business Scan & Redemption (Success case)
  console.log('\n4. Simulating business scan & redemption...');
  const result = await redeemReward(claim.redemptionCode, null, business.id);
  console.log(`Redemption Result:`, result);

  const updatedClaim = await prisma.claimedCoupon.findUnique({ where: { id: claim.id } });
  if (updatedClaim.status !== 'REDEEMED' || !updatedClaim.redeemedAt) {
    throw new Error(`Redemption failed to update ClaimedCoupon status/redeemedAt! Status: ${updatedClaim.status}`);
  }
  console.log('✅ Successful redemption verified! Coupon marked REDEEMED.');

  // 5. Test Expiry/Validity Window check (Failure case)
  console.log('\n5. Testing event date validity window failure...');
  // Create coupon for a future event date (e.g. 5 days from now)
  const futureEventCoupon = await prisma.coupon.create({
    data: {
      businessId: business.id,
      code: 'EVENT40',
      title: 'Future Fest Special',
      description: 'Get 40% off',
      discountType: 'PERCENTAGE',
      discountValue: 40.00,
      validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
      offerTitle: 'Future Fest Special',
      offerDescription: 'Future Fest Event Offer',
      isActive: true,
    }
  });

  const claimFuture = await prisma.claimedCoupon.create({
    data: {
      couponId: futureEventCoupon.id,
      customerId: customer.id,
      status: 'CLAIMED',
    }
  });

  try {
    await redeemReward(claimFuture.redemptionCode, null, business.id);
    throw new Error('Redemption should have failed due to future event date!');
  } catch (err) {
    console.log(`Expected error received: ${err.message}`);
    if (err.message.includes('This coupon is only valid on the event day')) {
      console.log('✅ Event date validity window enforcement verified!');
    } else {
      throw err;
    }
  }

  // Clean up
  await prisma.claimedCoupon.deleteMany({
    where: { customerId: customer.id, coupon: { businessId: business.id } }
  });
  await prisma.coupon.deleteMany({
    where: { businessId: business.id, code: { in: ['EVENT20', 'EVENT40'] } }
  });

  console.log('\n✅ All Event-Day Coupon (Task 4) tests passed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
