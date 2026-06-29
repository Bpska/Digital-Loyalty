import { PrismaClient } from '@prisma/client';
import { searchGooglePlaces, saveReviewSettings, getReviewSettings } from '../src/modules/reviews/review.service.js';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Verifying Google Business Review Integration ---');

  // 1. Find a test business in the database
  const business = await prisma.business.findFirst({
    where: { deletedAt: null },
  });

  if (!business) {
    console.error('❌ Error: No businesses found in the database. Run seed first.');
    process.exit(1);
  }

  console.log(`Found business: "${business.name}" (ID: ${business.id})`);

  // 2. Test searchGooglePlaces
  console.log('\n2. Testing searchGooglePlaces (Stub fallback)...');
  const searchResults = await searchGooglePlaces('Test Cafe', business.id);
  console.log('Search Results:');
  console.log(JSON.stringify(searchResults, null, 2));

  if (searchResults.length !== 3) {
    console.error('❌ Error: Expected 3 mock search results.');
    process.exit(1);
  }
  console.log('✅ searchGooglePlaces mock results verified successfully.');

  // 3. Test saveReviewSettings with Place ID
  console.log('\n3. Testing saveReviewSettings with Place ID...');
  const testPlaceId = 'ChIJN1t_tDeuEmsRUsoyG83A2ks';
  const testPlaceName = 'Test Cafe Connaught Place';

  const settings = await saveReviewSettings(business.id, {
    businessType: 'Cafe',
    googleBusinessName: testPlaceName,
    googlePlaceId: testPlaceId,
  });

  console.log('Saved Settings:');
  console.log(JSON.stringify(settings, null, 2));

  // Check generated URL
  const expectedUrl = `https://search.google.com/local/writereview?placeid=${testPlaceId}`;
  if (settings.googleReviewUrl !== expectedUrl) {
    console.error(`❌ Error: Expected generated URL to be "${expectedUrl}", got "${settings.googleReviewUrl}"`);
    process.exit(1);
  }
  console.log('✅ Google Review URL generated successfully.');

  // Check sync to Business model
  const updatedBusiness = await prisma.business.findUnique({
    where: { id: business.id },
  });
  if (updatedBusiness.googleReviewUrl !== expectedUrl) {
    console.error(`❌ Error: Expected synced business Google Review URL to be "${expectedUrl}", got "${updatedBusiness.googleReviewUrl}"`);
    process.exit(1);
  }
  console.log('✅ Google Review URL successfully synced to Business model.');

  // 4. Test getReviewSettings
  console.log('\n4. Testing getReviewSettings...');
  const fetchedSettings = await getReviewSettings(business.id);
  console.log('Fetched Settings:');
  console.log(JSON.stringify(fetchedSettings, null, 2));

  if (fetchedSettings.googlePlaceId !== testPlaceId || fetchedSettings.googleBusinessName !== testPlaceName) {
    console.error('❌ Error: Fetched settings mismatch Place details.');
    process.exit(1);
  }
  console.log('✅ getReviewSettings returned correct Place fields.');

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Unexpected error during verification:', err);
  process.exit(1);
});
