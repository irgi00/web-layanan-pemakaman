import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cemeteryId = '99999999-9999-9999-9999-999999999999';

const inspectionQuery = `
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('Cemetery', 'Plot', 'Service')
ORDER BY table_name;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('Cemetery', 'Plot', 'Service')
ORDER BY table_name, ordinal_position;

SELECT id, name, city, province, status
FROM "Cemetery"
WHERE id = '${cemeteryId}';
`;

const insertPlotsQuery = `
INSERT INTO "Plot" (
  id,
  "cemeteryId",
  "plotNumber",
  section,
  row,
  status,
  price,
  size,
  description,
  latitude,
  longitude,
  "createdAt",
  "updatedAt"
)
SELECT
  v.id,
  c.id,
  v.plot_name,
  v.block,
  v.location,
  v.status,
  v.price,
  v.size,
  v.description,
  v.latitude,
  v.longitude,
  NOW(),
  NOW()
FROM "Cemetery" c
CROSS JOIN (
  VALUES
    ('de0a1000-0000-4000-8000-000000000001'::uuid, 'Aster-01', 'Blok A', 'Baris 1 Kavling 01', 'available', 3500000, '2x3 m', 'Plot dekat jalur utama area Ratujaya dengan akses peziarah yang mudah.', -6.4018, 106.7939),
    ('de0a1000-0000-4000-8000-000000000002'::uuid, 'Aster-02', 'Blok A', 'Baris 1 Kavling 02', 'booked', 3550000, '2x3 m', 'Plot keluarga kecil dengan posisi teduh di sisi timur area Ratujaya.', -6.4019, 106.7940),
    ('de0a1000-0000-4000-8000-000000000003'::uuid, 'Aster-05', 'Blok A', 'Baris 2 Kavling 05', 'available', 3600000, '2x3 m', 'Plot strategis untuk prosesi sederhana dengan jarak dekat ke gerbang selatan.', -6.4020, 106.7941),
    ('de0a1000-0000-4000-8000-000000000004'::uuid, 'Bougenville-03', 'Blok B', 'Baris 1 Kavling 03', 'available', 3850000, '2.5x3 m', 'Lahan sedikit lebih lebar untuk makam keluarga di area Abadijaya.', -6.4021, 106.7942),
    ('de0a1000-0000-4000-8000-000000000005'::uuid, 'Bougenville-07', 'Blok B', 'Baris 2 Kavling 07', 'booked', 3900000, '2.5x3 m', 'Plot sudah dipesan, berada dekat mushola dan area parkir internal.', -6.4022, 106.7943),
    ('de0a1000-0000-4000-8000-000000000006'::uuid, 'Cempaka-01', 'Blok C', 'Baris 1 Kavling 01', 'available', 4100000, '3x3 m', 'Plot premium untuk keluarga dengan ruang ziarah lebih lega di area Kalimulya.', -6.4023, 106.7944),
    ('de0a1000-0000-4000-8000-000000000007'::uuid, 'Cempaka-04', 'Blok C', 'Baris 1 Kavling 04', 'available', 4050000, '3x3 m', 'Lahan rata dan mudah dijangkau kendaraan operasional pemakaman.', -6.4024, 106.7945),
    ('de0a1000-0000-4000-8000-000000000008'::uuid, 'Cempaka-09', 'Blok C', 'Baris 2 Kavling 09', 'booked', 4150000, '3x3 m', 'Plot keluarga yang sudah terikat booking dengan posisi dekat pohon peneduh.', -6.4025, 106.7946),
    ('de0a1000-0000-4000-8000-000000000009'::uuid, 'Dahlia-02', 'Blok D', 'Baris 1 Kavling 02', 'available', 3200000, '2x2.5 m', 'Plot ekonomis di sisi barat TPU Depok untuk kebutuhan pemakaman cepat.', -6.4026, 106.7947),
    ('de0a1000-0000-4000-8000-000000000010'::uuid, 'Dahlia-06', 'Blok D', 'Baris 2 Kavling 06', 'available', 3250000, '2x2.5 m', 'Area tenang dengan kontur stabil dan sirkulasi pejalan kaki yang baik.', -6.4027, 106.7948),
    ('de0a1000-0000-4000-8000-000000000011'::uuid, 'Flamboyan-01', 'Blok E', 'Baris 1 Kavling 01', 'booked', 4500000, '3x3 m', 'Plot prioritas dekat jalan cor dan cocok untuk prosesi keluarga besar.', -6.4028, 106.7949),
    ('de0a1000-0000-4000-8000-000000000012'::uuid, 'Flamboyan-05', 'Blok E', 'Baris 1 Kavling 05', 'available', 4450000, '3x3 m', 'Lahan premium dengan akses relatif dekat ke titik kumpul pelayat.', -6.4029, 106.7950),
    ('de0a1000-0000-4000-8000-000000000013'::uuid, 'Kenanga-03', 'Blok F', 'Baris 1 Kavling 03', 'available', 3700000, '2x3 m', 'Plot di area Sukmajaya dengan drainase yang sudah ditata.', -6.4030, 106.7951),
    ('de0a1000-0000-4000-8000-000000000014'::uuid, 'Kenanga-08', 'Blok F', 'Baris 2 Kavling 08', 'booked', 3725000, '2x3 m', 'Sudah terisi booking, lokasi dekat jalur servis dan titik penerangan.', -6.4031, 106.7952),
    ('de0a1000-0000-4000-8000-000000000015'::uuid, 'Melati-02', 'Blok G', 'Baris 1 Kavling 02', 'available', 3400000, '2x3 m', 'Plot serbaguna untuk paket reguler dengan lingkungan area yang rapi.', -6.4032, 106.7953),
    ('de0a1000-0000-4000-8000-000000000016'::uuid, 'Melati-06', 'Blok G', 'Baris 2 Kavling 06', 'available', 3425000, '2x3 m', 'Posisi dekat area Kalibaru, cocok untuk pemakaman keluarga inti.', -6.4033, 106.7954),
    ('de0a1000-0000-4000-8000-000000000017'::uuid, 'Teratai-04', 'Blok H', 'Baris 1 Kavling 04', 'booked', 3950000, '2.5x3 m', 'Plot dengan akses cepat dari gerbang timur dan sudah masuk antrean pemakaian.', -6.4034, 106.7955)
) AS v(
  id,
  plot_name,
  block,
  location,
  status,
  price,
  size,
  description,
  latitude,
  longitude
)
WHERE c.id = '${cemeteryId}'
  AND NOT EXISTS (
    SELECT 1
    FROM "Plot" p
    WHERE p."cemeteryId" = c.id
      AND p."plotNumber" = v.plot_name
  );
`;

const insertServicesQuery = `
INSERT INTO "Service" (
  id,
  "cemeteryId",
  name,
  description,
  price,
  category,
  duration,
  status,
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  v.id,
  c.id,
  v.service_name,
  v.description,
  v.price,
  v.category,
  v.duration,
  v.status,
  v.is_active,
  NOW(),
  NOW()
FROM "Cemetery" c
CROSS JOIN (
  VALUES
    ('de0b2000-0000-4000-8000-000000000001'::uuid, 'Paket Pemakaman Reguler Depok', 'Paket dasar meliputi administrasi pemakaman, penggalian standar, dan penataan awal makam.', 2500000, 'bundle', 180, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000002'::uuid, 'Paket Pemakaman Keluarga', 'Paket untuk keluarga dengan fasilitas tenda kecil, kursi pelayat, dan koordinasi prosesi.', 4200000, 'bundle', 240, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000003'::uuid, 'Penggalian dan Penutupan Makam', 'Layanan penggalian manual dan penutupan makam oleh petugas TPU Depok.', 900000, 'operational', 120, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000004'::uuid, 'Sewa Tenda Duka 20 Kursi', 'Penyediaan tenda duka ukuran sedang lengkap dengan 20 kursi lipat.', 850000, 'facility', 300, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000005'::uuid, 'Mobil Jenazah Dalam Kota Depok', 'Pengantaran jenazah area Depok dan sekitarnya dengan armada standby.', 1500000, 'transportation', 150, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000006'::uuid, 'Pemandian dan Kafanisasi', 'Tim rohani membantu proses pemandian jenazah dan kafan sesuai syariat.', 1750000, 'religious', 180, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000007'::uuid, 'Batu Nisan Granit Standar', 'Pembuatan dan pemasangan batu nisan granit standar dengan ukiran nama.', 2200000, 'memorial', 4320, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000008'::uuid, 'Perawatan Makam 3 Bulan', 'Perawatan rutin meliputi pembersihan, pemangkasan rumput, dan tabur bunga berkala.', 1200000, 'maintenance', 129600, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000009'::uuid, 'Doa dan Talqin Singkat', 'Pendampingan doa singkat dan talqin pada saat prosesi pemakaman berlangsung.', 650000, 'ceremony', 60, 'active', TRUE),
    ('de0b2000-0000-4000-8000-000000000010'::uuid, 'Dokumentasi Prosesi Keluarga', 'Dokumentasi foto sederhana untuk arsip keluarga selama proses pemakaman.', 950000, 'documentation', 180, 'inactive', FALSE),
    ('de0b2000-0000-4000-8000-000000000011'::uuid, 'Paket Ziarah dan Tabur Bunga', 'Layanan tabur bunga dan persiapan area untuk ziarah keluarga setelah pemakaman.', 500000, 'ceremony', 45, 'active', TRUE)
) AS v(
  id,
  service_name,
  description,
  price,
  category,
  duration,
  status,
  is_active
)
WHERE c.id = '${cemeteryId}'
  AND NOT EXISTS (
    SELECT 1
    FROM "Service" s
    WHERE s."cemeteryId" = c.id
      AND s.name = v.service_name
  );
`;

const ensurePlotSchemaQuery = `
ALTER TABLE "Plot"
  ADD COLUMN IF NOT EXISTS price INTEGER,
  ADD COLUMN IF NOT EXISTS size TEXT;
`;

const ensureServiceSchemaQuery = `
ALTER TABLE "Service"
  ADD COLUMN IF NOT EXISTS duration INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT;
`;

const verificationQueries = {
  plotCount: `
SELECT COUNT(*)::int AS total_plots
FROM "Plot"
WHERE "cemeteryId" = '${cemeteryId}';
`,
  serviceCount: `
SELECT COUNT(*)::int AS total_services
FROM "Service"
WHERE "cemeteryId" = '${cemeteryId}';
`,
  plots: `
SELECT
  "plotNumber" AS plot_name,
  section AS block,
  row AS location,
  status,
  price,
  size
FROM "Plot"
WHERE "cemeteryId" = '${cemeteryId}'
ORDER BY section, "plotNumber";
`,
  services: `
SELECT
  name AS service_name,
  category,
  price::int AS price,
  duration,
  COALESCE(status, CASE WHEN "isActive" THEN 'active' ELSE 'inactive' END) AS status
FROM "Service"
WHERE "cemeteryId" = '${cemeteryId}'
ORDER BY category, name;
`,
};

async function main() {
  console.log('=== INSPECTION QUERY ===');
  console.log(inspectionQuery.trim());

  const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('Cemetery', 'Plot', 'Service')
    ORDER BY table_name
  `);

  const columns = await prisma.$queryRawUnsafe<Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>>(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('Cemetery', 'Plot', 'Service')
    ORDER BY table_name, ordinal_position
  `);

  const cemetery = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; city: string | null; province: string | null; status: string }>>(`
    SELECT id, name, city, province, status
    FROM "Cemetery"
    WHERE id = '${cemeteryId}'
  `);

  console.log('=== INSPECTION RESULT: TABLES ===');
  console.table(tables);
  console.log('=== INSPECTION RESULT: COLUMNS ===');
  console.table(columns);
  console.log('=== INSPECTION RESULT: TPU DEPOK ===');
  console.table(cemetery);

  if (cemetery.length === 0) {
    throw new Error(`Cemetery ${cemeteryId} tidak ditemukan. Jalankan seed cemetery terlebih dahulu.`);
  }

  console.log('=== ENSURE PLOT SCHEMA QUERY ===');
  console.log(ensurePlotSchemaQuery.trim());
  await prisma.$executeRawUnsafe(ensurePlotSchemaQuery);
  console.log('=== ENSURE SERVICE SCHEMA QUERY ===');
  console.log(ensureServiceSchemaQuery.trim());
  await prisma.$executeRawUnsafe(ensureServiceSchemaQuery);
  console.log('Schema checked and updated if needed.');

  console.log('=== INSERT PLOTS QUERY ===');
  console.log(insertPlotsQuery.trim());
  const insertedPlots = await prisma.$executeRawUnsafe(insertPlotsQuery);
  console.log(`Inserted plot rows: ${insertedPlots}`);

  console.log('=== INSERT SERVICES QUERY ===');
  console.log(insertServicesQuery.trim());
  const insertedServices = await prisma.$executeRawUnsafe(insertServicesQuery);
  console.log(`Inserted service rows: ${insertedServices}`);

  console.log('=== VERIFICATION QUERY: PLOT COUNT ===');
  console.log(verificationQueries.plotCount.trim());
  const plotCount = await prisma.$queryRawUnsafe<Array<{ total_plots: number }>>(verificationQueries.plotCount);
  console.table(plotCount);

  console.log('=== VERIFICATION QUERY: SERVICE COUNT ===');
  console.log(verificationQueries.serviceCount.trim());
  const serviceCount = await prisma.$queryRawUnsafe<Array<{ total_services: number }>>(verificationQueries.serviceCount);
  console.table(serviceCount);

  console.log('=== VERIFICATION QUERY: PLOTS ===');
  console.log(verificationQueries.plots.trim());
  const plots = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(verificationQueries.plots);
  console.table(plots);

  console.log('=== VERIFICATION QUERY: SERVICES ===');
  console.log(verificationQueries.services.trim());
  const services = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(verificationQueries.services);
  console.table(services);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
