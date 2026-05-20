import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TPU_DEPOK_ID = '99999999-9999-9999-9999-999999999999';

const TPU_DEPOK_PLOTS = [
  {
    id: 'de0a1000-0000-4000-8000-000000000001',
    plotNumber: 'Aster-01',
    section: 'Blok A',
    row: 'Baris 1 Kavling 01',
    status: 'available',
    price: 3500000,
    size: '2x3 m',
    description: 'Plot dekat jalur utama area Ratujaya dengan akses peziarah yang mudah.',
    latitude: -6.4018,
    longitude: 106.7939,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000002',
    plotNumber: 'Aster-02',
    section: 'Blok A',
    row: 'Baris 1 Kavling 02',
    status: 'booked',
    price: 3550000,
    size: '2x3 m',
    description: 'Plot keluarga kecil dengan posisi teduh di sisi timur area Ratujaya.',
    latitude: -6.4019,
    longitude: 106.7940,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000003',
    plotNumber: 'Aster-05',
    section: 'Blok A',
    row: 'Baris 2 Kavling 05',
    status: 'available',
    price: 3600000,
    size: '2x3 m',
    description: 'Plot strategis untuk prosesi sederhana dengan jarak dekat ke gerbang selatan.',
    latitude: -6.4020,
    longitude: 106.7941,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000004',
    plotNumber: 'Bougenville-03',
    section: 'Blok B',
    row: 'Baris 1 Kavling 03',
    status: 'available',
    price: 3850000,
    size: '2.5x3 m',
    description: 'Lahan sedikit lebih lebar untuk makam keluarga di area Abadijaya.',
    latitude: -6.4021,
    longitude: 106.7942,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000005',
    plotNumber: 'Bougenville-07',
    section: 'Blok B',
    row: 'Baris 2 Kavling 07',
    status: 'booked',
    price: 3900000,
    size: '2.5x3 m',
    description: 'Plot sudah dipesan, berada dekat mushola dan area parkir internal.',
    latitude: -6.4022,
    longitude: 106.7943,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000006',
    plotNumber: 'Cempaka-01',
    section: 'Blok C',
    row: 'Baris 1 Kavling 01',
    status: 'available',
    price: 4100000,
    size: '3x3 m',
    description: 'Plot premium untuk keluarga dengan ruang ziarah lebih lega di area Kalimulya.',
    latitude: -6.4023,
    longitude: 106.7944,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000007',
    plotNumber: 'Cempaka-04',
    section: 'Blok C',
    row: 'Baris 1 Kavling 04',
    status: 'available',
    price: 4050000,
    size: '3x3 m',
    description: 'Lahan rata dan mudah dijangkau kendaraan operasional pemakaman.',
    latitude: -6.4024,
    longitude: 106.7945,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000008',
    plotNumber: 'Cempaka-09',
    section: 'Blok C',
    row: 'Baris 2 Kavling 09',
    status: 'booked',
    price: 4150000,
    size: '3x3 m',
    description: 'Plot keluarga yang sudah terikat booking dengan posisi dekat pohon peneduh.',
    latitude: -6.4025,
    longitude: 106.7946,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000009',
    plotNumber: 'Dahlia-02',
    section: 'Blok D',
    row: 'Baris 1 Kavling 02',
    status: 'available',
    price: 3200000,
    size: '2x2.5 m',
    description: 'Plot ekonomis di sisi barat TPU Depok untuk kebutuhan pemakaman cepat.',
    latitude: -6.4026,
    longitude: 106.7947,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000010',
    plotNumber: 'Dahlia-06',
    section: 'Blok D',
    row: 'Baris 2 Kavling 06',
    status: 'available',
    price: 3250000,
    size: '2x2.5 m',
    description: 'Area tenang dengan kontur stabil dan sirkulasi pejalan kaki yang baik.',
    latitude: -6.4027,
    longitude: 106.7948,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000011',
    plotNumber: 'Flamboyan-01',
    section: 'Blok E',
    row: 'Baris 1 Kavling 01',
    status: 'booked',
    price: 4500000,
    size: '3x3 m',
    description: 'Plot prioritas dekat jalan cor dan cocok untuk prosesi keluarga besar.',
    latitude: -6.4028,
    longitude: 106.7949,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000012',
    plotNumber: 'Flamboyan-05',
    section: 'Blok E',
    row: 'Baris 1 Kavling 05',
    status: 'available',
    price: 4450000,
    size: '3x3 m',
    description: 'Lahan premium dengan akses relatif dekat ke titik kumpul pelayat.',
    latitude: -6.4029,
    longitude: 106.7950,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000013',
    plotNumber: 'Kenanga-03',
    section: 'Blok F',
    row: 'Baris 1 Kavling 03',
    status: 'available',
    price: 3700000,
    size: '2x3 m',
    description: 'Plot di area Sukmajaya dengan drainase yang sudah ditata.',
    latitude: -6.4030,
    longitude: 106.7951,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000014',
    plotNumber: 'Kenanga-08',
    section: 'Blok F',
    row: 'Baris 2 Kavling 08',
    status: 'booked',
    price: 3725000,
    size: '2x3 m',
    description: 'Sudah terisi booking, lokasi dekat jalur servis dan titik penerangan.',
    latitude: -6.4031,
    longitude: 106.7952,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000015',
    plotNumber: 'Melati-02',
    section: 'Blok G',
    row: 'Baris 1 Kavling 02',
    status: 'available',
    price: 3400000,
    size: '2x3 m',
    description: 'Plot serbaguna untuk paket reguler dengan lingkungan area yang rapi.',
    latitude: -6.4032,
    longitude: 106.7953,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000016',
    plotNumber: 'Melati-06',
    section: 'Blok G',
    row: 'Baris 2 Kavling 06',
    status: 'available',
    price: 3425000,
    size: '2x3 m',
    description: 'Posisi dekat area Kalibaru, cocok untuk pemakaman keluarga inti.',
    latitude: -6.4033,
    longitude: 106.7954,
  },
  {
    id: 'de0a1000-0000-4000-8000-000000000017',
    plotNumber: 'Teratai-04',
    section: 'Blok H',
    row: 'Baris 1 Kavling 04',
    status: 'booked',
    price: 3950000,
    size: '2.5x3 m',
    description: 'Plot dengan akses cepat dari gerbang timur dan sudah masuk antrean pemakaian.',
    latitude: -6.4034,
    longitude: 106.7955,
  },
] as const;

const TPU_DEPOK_SERVICES = [
  {
    id: 'de0b2000-0000-4000-8000-000000000001',
    name: 'Paket Pemakaman Reguler Depok',
    category: 'bundle',
    price: 2500000,
    description: 'Paket dasar meliputi administrasi pemakaman, penggalian standar, dan penataan awal makam.',
    duration: 180,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000002',
    name: 'Paket Pemakaman Keluarga',
    category: 'bundle',
    price: 4200000,
    description: 'Paket untuk keluarga dengan fasilitas tenda kecil, kursi pelayat, dan koordinasi prosesi.',
    duration: 240,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000003',
    name: 'Penggalian dan Penutupan Makam',
    category: 'operational',
    price: 900000,
    description: 'Layanan penggalian manual dan penutupan makam oleh petugas TPU Depok.',
    duration: 120,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000004',
    name: 'Sewa Tenda Duka 20 Kursi',
    category: 'facility',
    price: 850000,
    description: 'Penyediaan tenda duka ukuran sedang lengkap dengan 20 kursi lipat.',
    duration: 300,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000005',
    name: 'Mobil Jenazah Dalam Kota Depok',
    category: 'transportation',
    price: 1500000,
    description: 'Pengantaran jenazah area Depok dan sekitarnya dengan armada standby.',
    duration: 150,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000006',
    name: 'Pemandian dan Kafanisasi',
    category: 'religious',
    price: 1750000,
    description: 'Tim rohani membantu proses pemandian jenazah dan kafan sesuai syariat.',
    duration: 180,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000007',
    name: 'Batu Nisan Granit Standar',
    category: 'memorial',
    price: 2200000,
    description: 'Pembuatan dan pemasangan batu nisan granit standar dengan ukiran nama.',
    duration: 4320,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000008',
    name: 'Perawatan Makam 3 Bulan',
    category: 'maintenance',
    price: 1200000,
    description: 'Perawatan rutin meliputi pembersihan, pemangkasan rumput, dan tabur bunga berkala.',
    duration: 129600,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000009',
    name: 'Doa dan Talqin Singkat',
    category: 'ceremony',
    price: 650000,
    description: 'Pendampingan doa singkat dan talqin pada saat prosesi pemakaman berlangsung.',
    duration: 60,
    status: 'active',
    isActive: true,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000010',
    name: 'Dokumentasi Prosesi Keluarga',
    category: 'documentation',
    price: 950000,
    description: 'Dokumentasi foto sederhana untuk arsip keluarga selama proses pemakaman.',
    duration: 180,
    status: 'inactive',
    isActive: false,
  },
  {
    id: 'de0b2000-0000-4000-8000-000000000011',
    name: 'Paket Ziarah dan Tabur Bunga',
    category: 'ceremony',
    price: 500000,
    description: 'Layanan tabur bunga dan persiapan area untuk ziarah keluarga setelah pemakaman.',
    duration: 45,
    status: 'active',
    isActive: true,
  },
] as const;

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
    where: { id: TPU_DEPOK_ID },
    update: {},
    create: {
      id: TPU_DEPOK_ID,
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

  for (const plot of TPU_DEPOK_PLOTS) {
    await prisma.plot.upsert({
      where: {
        cemeteryId_plotNumber: {
          cemeteryId: tpuDepok.id,
          plotNumber: plot.plotNumber,
        },
      },
      update: {
        section: plot.section,
        row: plot.row,
        status: plot.status,
        price: plot.price,
        size: plot.size,
        description: plot.description,
        latitude: plot.latitude,
        longitude: plot.longitude,
      },
      create: {
        id: plot.id,
        cemeteryId: tpuDepok.id,
        plotNumber: plot.plotNumber,
        section: plot.section,
        row: plot.row,
        status: plot.status,
        price: plot.price,
        size: plot.size,
        description: plot.description,
        latitude: plot.latitude,
        longitude: plot.longitude,
      },
    });
  }

  for (const service of TPU_DEPOK_SERVICES) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        cemeteryId: tpuDepok.id,
        name: service.name,
        category: service.category,
        price: service.price,
        description: service.description,
        duration: service.duration,
        status: service.status,
        isActive: service.isActive,
      },
      create: {
        id: service.id,
        cemeteryId: tpuDepok.id,
        name: service.name,
        category: service.category,
        price: service.price,
        description: service.description,
        duration: service.duration,
        status: service.status,
        isActive: service.isActive,
      },
    });
  }

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
  console.log(`TPU Depok plots ensured: ${TPU_DEPOK_PLOTS.length}`);
  console.log(`TPU Depok services ensured: ${TPU_DEPOK_SERVICES.length}`);

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
