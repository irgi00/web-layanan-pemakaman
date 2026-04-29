import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create or ensure sample cemetery
  const cemetery = await prisma.cemetery.upsert({
    where: { id: 'aaaaaaaa-bbbb-cccc-dddd-000000000001' },
    update: {},
    create: {
      id: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
      name: 'Sample Indonesia Cemetery',
      location: 'Sample Address, Indonesia',
      address: 'Jl. Sample No.1, Indonesia',
      country: 'Indonesia',
      latitude: -6.2000,
      longitude: 106.8166,
      description: 'Contoh pemakaman untuk development lokal di Indonesia',
      totalPlots: 500,
      availablePlots: 480,
      contactEmail: 'info@samplecemetery.id',
      contactPhone: '+62-21-000-0000',
      pricePerPlot: 500000,
      status: 'active',
    },
  });

  console.log('Cemetery created:', cemetery.name);

  // Create sample plots
  const existingPlots = await prisma.plot.count({ where: { cemeteryId: cemetery.id } });
  if (existingPlots === 0) {
    for (let i = 1; i <= 10; i++) {
      await prisma.plot.create({
        data: {
          cemeteryId: cemetery.id,
          plotNumber: `PLOT-${String(i).padStart(3, '0')}`,
          section: `Section ${Math.ceil(i / 5)}`,
          row: `Row ${(i % 5) + 1}`,
          status: 'available',
          latitude: cemetery.latitude + (i * 0.001),
          longitude: cemetery.longitude + (i * 0.001),
        },
      });
    }
  }

  console.log('Sample plots created');

  // Create sample cemetery admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@peacefulrest.com' },
    update: {
      firstName: 'John',
      lastName: 'Admin',
      phoneNumber: '+1-217-555-0101',
      passwordHash: hashedPassword,
      role: 'CEMETERY_ADMIN',
      cemeteryId: cemetery.id,
    },
    create: {
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
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      firstName: 'Jane',
      lastName: 'Customer',
      phoneNumber: '+1-217-555-0102',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
    create: {
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
  const existingDeceased = await prisma.deceasedProfile.count({ where: { userId: customerUser.id } });
  let deceasedProfile;
  if (existingDeceased === 0) {
    deceasedProfile = await prisma.deceasedProfile.create({
      data: {
        userId: customerUser.id,
        firstName: 'Robert',
        lastName: 'Smith',
        dateOfBirth: new Date('1940-01-15'),
        dateOfDeath: new Date('2024-03-20'),
        biography: 'A loving father and grandfather who enjoyed gardening and reading.',
      },
    });
  } else {
    deceasedProfile = await prisma.deceasedProfile.findFirst({ where: { userId: customerUser.id } });
  }

  console.log('Deceased profile created:', deceasedProfile.firstName, deceasedProfile.lastName);

  // Create sample services
  const existingServices = await prisma.service.count({ where: { cemeteryId: cemetery.id } });
  if (existingServices === 0) {
    await prisma.service.createMany({
      data: [
        {
          cemeteryId: cemetery.id,
          name: 'Reguler',
          description: 'Paket dasar untuk pemakaman dengan layanan standar yang tetap layak dan tertata.',
          price: 150,
          category: 'bundle',
        },
        {
          cemeteryId: cemetery.id,
          name: 'VIP',
          description: 'Paket menengah dengan fasilitas tambahan dan pendampingan prosesi yang lebih nyaman.',
          price: 300,
          category: 'bundle',
        },
        {
          cemeteryId: cemetery.id,
          name: 'VVIP',
          description: 'Paket premium dengan layanan prioritas, kenyamanan ekstra, dan penanganan prosesi yang lebih lengkap.',
          price: 800,
          category: 'bundle',
        },
      ],
    });
  }

  console.log('Services created: Reguler, VIP, VVIP');

  // Create sample cemeteries in Pulau Jawa (Indonesia)
  const jakarta = await prisma.cemetery.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Kebon Jeruk Cemetery',
      location: 'Kebon Jeruk, West Jakarta',
      address: 'Jl. Kebon Jeruk No.1, Jakarta Barat',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'DKI Jakarta',
      city: 'Jakarta Barat',
      latitude: -6.1862,
      longitude: 106.7820,
      description: 'Cemetery located in West Jakarta',
      totalPlots: 1200,
      availablePlots: 800,
      contactEmail: 'info@jakarta-cemetery.id',
      contactPhone: '+62-21-555-0101',
      pricePerPlot: 2000000,
      status: 'active',
    },
  });

  const bandung = await prisma.cemetery.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Cimahi Cemetery',
      location: 'Cimahi, Bandung Raya',
      address: 'Jl. Raya Cimahi No.10, Bandung',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Barat',
      city: 'Bandung',
      latitude: -6.9147,
      longitude: 107.6098,
      description: 'Cemetery near Bandung area',
      totalPlots: 800,
      availablePlots: 500,
      contactEmail: 'info@bandung-cemetery.id',
      contactPhone: '+62-22-555-0102',
      pricePerPlot: 1500000,
      status: 'active',
    },
  });

  const semarang = await prisma.cemetery.upsert({
    where: { id: '33333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Kedungmundu Cemetery',
      location: 'Kedungmundu, Semarang',
      address: 'Jl. Kedungmundu No.5, Semarang',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Tengah',
      city: 'Semarang',
      latitude: -6.9667,
      longitude: 110.4167,
      description: 'Cemetery in Semarang region',
      totalPlots: 600,
      availablePlots: 400,
      contactEmail: 'info@semarang-cemetery.id',
      contactPhone: '+62-24-555-0103',
      pricePerPlot: 1200000,
      status: 'active',
    },
  });

  const yogyakarta = await prisma.cemetery.upsert({
    where: { id: '44444444-4444-4444-4444-444444444444' },
    update: {},
    create: {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Krematorium Yogyakarta',
      location: 'Kasihan, Bantul',
      address: 'Jl. Parangtritis No.2, Yogyakarta',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'DI Yogyakarta',
      city: 'Bantul',
      latitude: -7.8000,
      longitude: 110.3667,
      description: 'Crematorium and cemetery services in Yogyakarta',
      totalPlots: 400,
      availablePlots: 300,
      contactEmail: 'info@yogyakarta-cemetery.id',
      contactPhone: '+62-274-555-0104',
      pricePerPlot: 1000000,
      status: 'active',
    },
  });

  const surabaya = await prisma.cemetery.upsert({
    where: { id: '55555555-5555-5555-5555-555555555555' },
    update: {},
    create: {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Darmo Cemetery',
      location: 'Darmo, Surabaya',
      address: 'Jl. Darmo No.20, Surabaya',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Timur',
      city: 'Surabaya',
      latitude: -7.2575,
      longitude: 112.7521,
      description: 'Cemetery in Surabaya metropolitan area',
      totalPlots: 1000,
      availablePlots: 700,
      contactEmail: 'info@surabaya-cemetery.id',
      contactPhone: '+62-31-555-0105',
      pricePerPlot: 1800000,
      status: 'active',
    },
  });

  console.log('Sample cemeteries in Pulau Jawa created:', jakarta.name, bandung.name, semarang.name, yogyakarta.name, surabaya.name);

  // Add TPU entries for Jabodetabek (idempotent via upsert)
  const tpuPondokRanggon = await prisma.cemetery.upsert({
    where: { id: '66666666-6666-6666-6666-666666666666' },
    update: {},
    create: {
      id: '66666666-6666-6666-6666-666666666666',
      name: 'TPU Pondok Ranggon',
      location: 'Pondok Ranggon, Jakarta Timur',
      address: 'Jl. Pondok Ranggon No.1, Jakarta Timur',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'DKI Jakarta',
      city: 'Jakarta Timur',
      latitude: -6.2796,
      longitude: 106.9128,
      description: 'Tempat Pemakaman Umum Pondok Ranggon, Jakarta Timur',
      totalPlots: 2000,
      availablePlots: 1500,
      contactEmail: 'info@tpupondokranggon.id',
      contactPhone: '+62-21-555-0201',
      pricePerPlot: 500000,
      status: 'active',
    },
  });

  const tpuBekasi = await prisma.cemetery.upsert({
    where: { id: '77777777-7777-7777-7777-777777777777' },
    update: {},
    create: {
      id: '77777777-7777-7777-7777-777777777777',
      name: 'TPU Bekasi',
      location: 'Bekasi, Jawa Barat',
      address: 'Jl. TPU Bekasi No.2, Bekasi',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Barat',
      city: 'Bekasi',
      latitude: -6.2345,
      longitude: 106.9920,
      description: 'Tempat Pemakaman Umum di Bekasi',
      totalPlots: 1200,
      availablePlots: 900,
      contactEmail: 'info@tpubekasi.id',
      contactPhone: '+62-21-555-0202',
      pricePerPlot: 400000,
      status: 'active',
    },
  });

  const tpuTangerang = await prisma.cemetery.upsert({
    where: { id: '88888888-8888-8888-8888-888888888888' },
    update: {},
    create: {
      id: '88888888-8888-8888-8888-888888888888',
      name: 'TPU Tangerang',
      location: 'Tangerang, Banten',
      address: 'Jl. TPU Tangerang No.3, Tangerang',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Banten',
      city: 'Tangerang',
      latitude: -6.1783,
      longitude: 106.6316,
      description: 'Tempat Pemakaman Umum di Tangerang',
      totalPlots: 900,
      availablePlots: 600,
      contactEmail: 'info@tputangerang.id',
      contactPhone: '+62-21-555-0203',
      pricePerPlot: 350000,
      status: 'active',
    },
  });

  const tpuDepok = await prisma.cemetery.upsert({
    where: { id: '99999999-9999-9999-9999-999999999999' },
    update: {},
    create: {
      id: '99999999-9999-9999-9999-999999999999',
      name: 'TPU Depok',
      location: 'Depok, Jawa Barat',
      address: 'Jl. TPU Depok No.4, Depok',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Barat',
      city: 'Depok',
      latitude: -6.4025,
      longitude: 106.7944,
      description: 'Tempat Pemakaman Umum di Depok',
      totalPlots: 700,
      availablePlots: 500,
      contactEmail: 'info@tpudepok.id',
      contactPhone: '+62-21-555-0204',
      pricePerPlot: 300000,
      status: 'active',
    },
  });

  const tpuBogor = await prisma.cemetery.upsert({
    where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    update: {},
    create: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'TPU Bogor',
      location: 'Bogor, Jawa Barat',
      address: 'Jl. TPU Bogor No.5, Bogor',
      country: 'Indonesia',
      island: 'Jawa',
      province: 'Jawa Barat',
      city: 'Bogor',
      latitude: -6.5950,
      longitude: 106.8069,
      description: 'Tempat Pemakaman Umum di Bogor',
      totalPlots: 800,
      availablePlots: 600,
      contactEmail: 'info@tpubogor.id',
      contactPhone: '+62-251-555-0205',
      pricePerPlot: 320000,
      status: 'active',
    },
  });

  console.log('Sample TPU entries in Jabodetabek ensured:', tpuPondokRanggon.name, tpuBekasi.name, tpuTangerang.name, tpuDepok.name, tpuBogor.name);

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
