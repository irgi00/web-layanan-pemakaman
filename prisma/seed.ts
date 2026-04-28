import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample cemetery
  const cemetery = await prisma.cemetery.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Peaceful Rest Cemetery',
      location: '123 Cemetery Lane, Springfield, IL 62701',
      latitude: 39.7817,
      longitude: -89.6501,
      description: 'A peaceful and serene final resting place',
      totalPlots: 500,
      availablePlots: 480,
      contactEmail: 'info@peacefulrest.com',
      contactPhone: '+1-217-555-0100',
      pricePerPlot: 500,
      status: 'active',
    },
  });

  console.log('Cemetery created:', cemetery.name);

  // Create sample plots
  for (let i = 1; i <= 10; i++) {
    await prisma.plot.create({
      data: {
        cemeteryId: cemetery.id,
        plotNumber: `PLOT-${String(i).padStart(3, '0')}`,
        section: `Section ${Math.ceil(i / 5)}`,
        row: `Row ${(i % 5) + 1}`,
        status: i > 5 ? 'available' : 'available',
        latitude: cemetery.latitude + (i * 0.001),
        longitude: cemetery.longitude + (i * 0.001),
      },
    });
  }

  console.log('Sample plots created');

  // Create sample cemetery admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@peacefulrest.com',
      firstName: 'John',
      lastName: 'Admin',
      phoneNumber: '+1-217-555-0101',
      passwordHash: hashedPassword,
      role: 'CEMETERY_ADMIN',
      cemeteryId: cemetery.id,
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create sample customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      firstName: 'Jane',
      lastName: 'Customer',
      phoneNumber: '+1-217-555-0102',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });

  console.log('Customer user created:', customerUser.email);

  // Create sample deceased profile
  const deceasedProfile = await prisma.deceasedProfile.create({
    data: {
      userId: customerUser.id,
      firstName: 'Robert',
      lastName: 'Smith',
      dateOfBirth: new Date('1940-01-15'),
      dateOfDeath: new Date('2024-03-20'),
      biography: 'A loving father and grandfather who enjoyed gardening and reading.',
    },
  });

  console.log('Deceased profile created:', deceasedProfile.firstName, deceasedProfile.lastName);

  // Create sample services
  const regularService = await prisma.service.create({
    data: {
      cemeteryId: cemetery.id,
      name: 'Reguler',
      description: 'Paket dasar untuk pemakaman dengan layanan standar yang tetap layak dan tertata.',
      price: 150,
      category: 'bundle',
    },
  });

  const vipService = await prisma.service.create({
    data: {
      cemeteryId: cemetery.id,
      name: 'VIP',
      description: 'Paket menengah dengan fasilitas tambahan dan pendampingan prosesi yang lebih nyaman.',
      price: 300,
      category: 'bundle',
    },
  });

  const vvipService = await prisma.service.create({
    data: {
      cemeteryId: cemetery.id,
      name: 'VVIP',
      description: 'Paket premium dengan layanan prioritas, kenyamanan ekstra, dan penanganan prosesi yang lebih lengkap.',
      price: 800,
      category: 'bundle',
    },
  });

  console.log('Services created: Reguler, VIP, VVIP');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
