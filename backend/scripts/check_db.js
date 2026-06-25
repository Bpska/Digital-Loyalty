import prisma from '../src/config/prisma.js';

async function main() {
  console.log('--- DB Owner Check ---');
  const user = await prisma.user.findUnique({
    where: { id: 'cmqmy11v4000326rlvlen8hsd' }
  });
  console.log('User:', JSON.stringify(user, null, 2));

  const business = await prisma.business.findFirst({
    where: { ownerId: 'cmqmy11v4000326rlvlen8hsd' }
  });
  console.log('Business:', JSON.stringify(business, null, 2));
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
