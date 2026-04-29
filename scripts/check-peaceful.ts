import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = 'Peaceful Rest Cemetery';
  const found = await prisma.cemetery.findFirst({ where: { name } });
  if (!found) {
    console.log('NOT_FOUND');
    return;
  }
  console.log('FOUND', found.id, found.name, found.country ?? '');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
