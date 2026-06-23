import prisma from '../config/prisma.js';

async function main() {
  console.log("Updating Launch Year Special maxBranches to 1...");
  const result = await prisma.plan.update({
    where: { name: 'Launch Year Special' },
    data: { maxBranches: 1 }
  });
  console.log("Success! Updated plan:", result);
}

main()
  .catch(e => console.error("Error updating plan:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
