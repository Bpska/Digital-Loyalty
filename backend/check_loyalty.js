import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        loyaltyProgramSettings: true
      }
    });
    console.log('BUSINESSES LOYALTY SETTINGS:');
    businesses.forEach(b => {
      console.log(`- ${b.name} (${b.id}): pointRate = ${b.loyaltyProgramSettings?.pointsPerRupee}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
