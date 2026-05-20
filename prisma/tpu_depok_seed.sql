BEGIN;

ALTER TABLE "Plot"
  ADD COLUMN IF NOT EXISTS price INTEGER,
  ADD COLUMN IF NOT EXISTS size VARCHAR(50);

ALTER TABLE "Service"
  ADD COLUMN IF NOT EXISTS duration INTEGER,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30);

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
  longitude
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
  v.longitude
FROM "Cemetery" c
CROSS JOIN (
  VALUES
    ('de0a1000-0000-4000-8000-000000000001'::uuid, 'Aster-01', 'Blok A', 'Baris 1 Kavling 01', 'available', 3500000, '2x3 m', 'Plot dekat jalur utama area Sanulimah dengan akses peziarah yang mudah.', -6.4018, 106.7939),
    ('de0a1000-0000-4000-8000-000000000002'::uuid, 'Aster-02', 'Blok A', 'Baris 1 Kavling 02', 'booked', 3550000, '2x3 m', 'Plot keluarga kecil dengan posisi teduh di sisi timur area Sanulimah.', -6.4019, 106.7940),
    ('de0a1000-0000-4000-8000-000000000003'::uuid, 'Aster-05', 'Blok A', 'Baris 2 Kavling 05', 'available', 3600000, '2x3 m', 'Plot strategis untuk prosesi sederhana dengan jarak dekat ke gerbang selatan.', -6.4020, 106.7941),
    ('de0a1000-0000-4000-8000-000000000004'::uuid, 'Bougenville-03', 'Blok B', 'Baris 1 Kavling 03', 'available', 3850000, '2.5x3 m', 'Lahan sedikit lebih lebar untuk makam keluarga di area Ratujaya.', -6.4021, 106.7942),
    ('de0a1000-0000-4000-8000-000000000005'::uuid, 'Bougenville-07', 'Blok B', 'Baris 2 Kavling 07', 'booked', 3900000, '2.5x3 m', 'Plot sudah dipesan, berada dekat mushola dan area parkir internal.', -6.4022, 106.7943),
    ('de0a1000-0000-4000-8000-000000000006'::uuid, 'Cempaka-01', 'Blok C', 'Baris 1 Kavling 01', 'available', 4100000, '3x3 m', 'Plot premium untuk keluarga dengan ruang ziarah lebih lega di area Kalimulya.', -6.4023, 106.7944),
    ('de0a1000-0000-4000-8000-000000000007'::uuid, 'Cempaka-04', 'Blok C', 'Baris 1 Kavling 04', 'available', 4050000, '3x3 m', 'Lahan rata dan mudah dijangkau kendaraan operasional pemakaman.', -6.4024, 106.7945),
    ('de0a1000-0000-4000-8000-000000000008'::uuid, 'Cempaka-09', 'Blok C', 'Baris 2 Kavling 09', 'booked', 4150000, '3x3 m', 'Plot keluarga yang sudah terikat booking dengan posisi dekat pohon peneduh.', -6.4025, 106.7946),
    ('de0a1000-0000-4000-8000-000000000009'::uuid, 'Dahlia-02', 'Blok D', 'Baris 1 Kavling 02', 'available', 3200000, '2x2.5 m', 'Plot ekonomis di sisi barat TPU Depok untuk kebutuhan pemakaman cepat.', -6.4026, 106.7947),
    ('de0a1000-0000-4000-8000-000000000010'::uuid, 'Dahlia-06', 'Blok D', 'Baris 2 Kavling 06', 'available', 3250000, '2x2.5 m', 'Area tenang dengan kontur stabil dan sirkulasi pejalan kaki yang baik.', -6.4027, 106.7948),
    ('de0a1000-0000-4000-8000-000000000011'::uuid, 'Flamboyan-01', 'Blok E', 'Baris 1 Kavling 01', 'booked', 4500000, '3x3 m', 'Plot prioritas dekat jalan cor dan cocok untuk prosesi keluarga besar.', -6.4028, 106.7949),
    ('de0a1000-0000-4000-8000-000000000012'::uuid, 'Flamboyan-05', 'Blok E', 'Baris 1 Kavling 05', 'available', 4450000, '3x3 m', 'Lahan premium dengan akses relatif dekat ke titik kumpul pelayat.', -6.4029, 106.7950),
    ('de0a1000-0000-4000-8000-000000000013'::uuid, 'Kenanga-03', 'Blok F', 'Baris 1 Kavling 03', 'available', 3700000, '2x3 m', 'Plot di area perluasan TPU Depok dengan drainase yang sudah ditata.', -6.4030, 106.7951),
    ('de0a1000-0000-4000-8000-000000000014'::uuid, 'Kenanga-08', 'Blok F', 'Baris 2 Kavling 08', 'booked', 3725000, '2x3 m', 'Sudah terisi booking, lokasi dekat jalur servis dan titik penerangan.', -6.4031, 106.7952),
    ('de0a1000-0000-4000-8000-000000000015'::uuid, 'Melati-02', 'Blok G', 'Baris 1 Kavling 02', 'available', 3400000, '2x3 m', 'Plot serbaguna untuk paket reguler dengan lingkungan area yang rapi.', -6.4032, 106.7953),
    ('de0a1000-0000-4000-8000-000000000016'::uuid, 'Melati-06', 'Blok G', 'Baris 2 Kavling 06', 'available', 3425000, '2x3 m', 'Posisi dekat area Sanulimah lama, cocok untuk pemakaman keluarga inti.', -6.4033, 106.7954),
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
WHERE c.id = '99999999-9999-9999-9999-999999999999'
  AND NOT EXISTS (
    SELECT 1
    FROM "Plot" p
    WHERE p."cemeteryId" = c.id
      AND p."plotNumber" = v.plot_name
  );

INSERT INTO "Service" (
  id,
  "cemeteryId",
  name,
  category,
  price,
  description,
  duration,
  status,
  "isActive"
)
SELECT
  v.id,
  c.id,
  v.service_name,
  v.category,
  v.price,
  v.description,
  v.duration,
  v.status,
  CASE WHEN v.status = 'active' THEN TRUE ELSE FALSE END
FROM "Cemetery" c
CROSS JOIN (
  VALUES
    ('de0b2000-0000-4000-8000-000000000001'::uuid, 'Paket Pemakaman Reguler Depok', 'bundle', 2500000, 'Paket dasar meliputi administrasi pemakaman, penggalian standar, dan penataan awal makam.', 180, 'active'),
    ('de0b2000-0000-4000-8000-000000000002'::uuid, 'Paket Pemakaman Keluarga', 'bundle', 4200000, 'Paket untuk keluarga dengan fasilitas tenda kecil, kursi pelayat, dan koordinasi prosesi.', 240, 'active'),
    ('de0b2000-0000-4000-8000-000000000003'::uuid, 'Penggalian dan Penutupan Makam', 'operational', 900000, 'Layanan penggalian manual dan penutupan makam oleh petugas TPU Depok.', 120, 'active'),
    ('de0b2000-0000-4000-8000-000000000004'::uuid, 'Sewa Tenda Duka 20 Kursi', 'facility', 850000, 'Penyediaan tenda duka ukuran sedang lengkap dengan 20 kursi lipat.', 300, 'active'),
    ('de0b2000-0000-4000-8000-000000000005'::uuid, 'Mobil Jenazah Dalam Kota Depok', 'transportation', 1500000, 'Pengantaran jenazah area Depok dan sekitarnya dengan armada standby.', 150, 'active'),
    ('de0b2000-0000-4000-8000-000000000006'::uuid, 'Pemandian dan Kafanisasi', 'religious', 1750000, 'Tim rohani membantu proses pemandian jenazah dan kafan sesuai syariat.', 180, 'active'),
    ('de0b2000-0000-4000-8000-000000000007'::uuid, 'Batu Nisan Granit Standar', 'memorial', 2200000, 'Pembuatan dan pemasangan batu nisan granit standar dengan ukiran nama.', 4320, 'active'),
    ('de0b2000-0000-4000-8000-000000000008'::uuid, 'Perawatan Makam 3 Bulan', 'maintenance', 1200000, 'Perawatan rutin meliputi pembersihan, pemangkasan rumput, dan tabur bunga berkala.', 129600, 'active'),
    ('de0b2000-0000-4000-8000-000000000009'::uuid, 'Doa dan Talqin Singkat', 'ceremony', 650000, 'Pendampingan doa singkat dan talqin pada saat prosesi pemakaman berlangsung.', 60, 'active'),
    ('de0b2000-0000-4000-8000-000000000010'::uuid, 'Dokumentasi Prosesi Keluarga', 'documentation', 950000, 'Dokumentasi foto sederhana untuk arsip keluarga selama proses pemakaman.', 180, 'inactive'),
    ('de0b2000-0000-4000-8000-000000000011'::uuid, 'Paket Ziarah dan Tabur Bunga', 'ceremony', 500000, 'Layanan tabur bunga dan persiapan area untuk ziarah keluarga setelah pemakaman.', 45, 'active')
) AS v(
  id,
  service_name,
  category,
  price,
  description,
  duration,
  status
)
WHERE c.id = '99999999-9999-9999-9999-999999999999'
  AND NOT EXISTS (
    SELECT 1
    FROM "Service" s
    WHERE s."cemeteryId" = c.id
      AND s.name = v.service_name
  );

CREATE OR REPLACE VIEW cemetery_plots AS
SELECT
  p.id,
  p."cemeteryId" AS cemetery_id,
  p."plotNumber" AS plot_name,
  p.section AS block,
  p.row AS location,
  p.status,
  p.price,
  p.size,
  p.description,
  p.latitude,
  p.longitude,
  p."createdAt" AS created_at,
  p."updatedAt" AS updated_at
FROM "Plot" p;

CREATE OR REPLACE VIEW funeral_services AS
SELECT
  s.id,
  s."cemeteryId" AS cemetery_id,
  s.name AS service_name,
  s.category,
  s.price::integer AS price,
  s.description,
  s.duration,
  COALESCE(s.status, CASE WHEN s."isActive" THEN 'active' ELSE 'inactive' END) AS status,
  s."createdAt" AS created_at,
  s."updatedAt" AS updated_at
FROM "Service" s;

SELECT *
FROM cemetery_plots
WHERE cemetery_id = '99999999-9999-9999-9999-999999999999'
ORDER BY block, plot_name;

SELECT *
FROM funeral_services
WHERE cemetery_id = '99999999-9999-9999-9999-999999999999'
ORDER BY category, service_name;

COMMIT;
