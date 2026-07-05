import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    const businessId = 'cmql0410k000l77e8ejm8x8jj'; // rdk
    const pointsPerRupee = 0.5;
    
    console.log('Performing upsert...');
    const settings = await prisma.loyaltyProgramSettings.upsert({
      where: { businessId },
      update: { pointsPerRupee },
      create: {
        businessId,
        pointsPerRupee,
        programName: 'Coffee Rewards',
        pointsPerStamp: 50,
        requiredStamps: 7,
        rewardName: 'Free Coffee',
        validityDays: 30,
        maxDailyStamps: 1,
      },
    });
    console.log('Upsert succeeded:', settings);
  } catch (err) {
    console.error('Upsert failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
