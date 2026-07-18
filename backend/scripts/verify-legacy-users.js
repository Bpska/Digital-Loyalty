/**
 * One-time migration: mark all existing pre-OTP users as email-verified
 * so they can log in after the email verification system was introduced.
 *
 * Run on the deployment server:
 *   node scripts/verify-legacy-users.js
 */
import prisma from '../src/config/prisma.js';

async function main() {
  // Find all users who have a passwordHash (registered with email+password)
  // but are NOT yet email-verified
  const result = await prisma.user.updateMany({
    where: {
      passwordHash: { not: null },
      isEmailVerified: false,
      deletedAt: null,
    },
    data: {
      isEmailVerified: true,
    },
  });

  console.log(`✅ Marked ${result.count} legacy user(s) as email-verified.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
