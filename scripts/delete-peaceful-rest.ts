import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = 'Peaceful Rest Cemetery';
  const cemetery = await prisma.cemetery.findFirst({ where: { name } });
  if (!cemetery) {
    console.log(`Cemetery not found: ${name}`);
    return;
  }

  console.log('Found cemetery:', cemetery.id, cemetery.name);

  // Unlink any users who are admins of this cemetery
  const adminUsers = await prisma.user.updateMany({
    where: { cemeteryId: cemetery.id },
    data: { cemeteryId: null },
  });
  console.log('Unlinked admin users count:', adminUsers.count);

  // Delete bookings for this cemetery (will cascade to payments and related service bookings)
  const deletedBookings = await prisma.booking.deleteMany({ where: { cemeteryId: cemetery.id } });
  console.log('Deleted bookings count:', deletedBookings.count);

  // Finally delete the cemetery (plots and services are set to cascade in schema)
  await prisma.cemetery.delete({ where: { id: cemetery.id } });
  console.log('Cemetery deleted:', name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
