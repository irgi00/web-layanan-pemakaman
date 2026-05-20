import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'super@memorialcare.local';
  const plain = 'superadmin123'; // development password — change in production

  const passwordHash = await bcrypt.hash(plain, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: null,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Super admin ensured:', user.email);
  console.log('Password (development):', plain);
  console.log('Please rotate/change this password in production.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
