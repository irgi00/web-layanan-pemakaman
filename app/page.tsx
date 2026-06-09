'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Heart,
  MapPin,
  Shield,
  Users,
} from 'lucide-react';

import { CemeteryImage } from '@/components/cemetery-image';
import { Header } from '@/components/header';
import { PublicFooter } from '@/components/public-footer';
import { ReviewSection } from '@/components/review-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/utils';

const featureCards = [
  {
    title: 'Informasi Pemakaman Lebih Jelas',
    description: 'Lihat detail pemakaman, lokasi, harga mulai, dan ketersediaan lahan dalam tampilan yang rapi dan mudah dipahami.',
    icon: BadgeCheck,
  },
  {
    title: 'Proses Pemesanan Lebih Tertata',
    description: 'Ikuti tahapan pemesanan mulai dari memilih lokasi, menentukan plot, hingga memilih layanan tambahan dengan lebih terarah.',
    icon: CalendarCheck2,
  },
  {
    title: 'Layanan yang Lebih Empatik',
    description: 'Tampilan dirancang dengan nuansa tenang dan sopan agar keluarga dapat mengambil keputusan dengan lebih nyaman.',
    icon: Heart,
  },
];

const steps = [
  {
    number: '01',
    title: 'Pilih pemakaman',
    description: 'Jelajahi daftar pemakaman dan pelajari informasi pentingnya sebelum memilih.',
  },
  {
    number: '02',
    title: 'Tentukan plot dan layanan',
    description: 'Bandingkan ketersediaan plot serta paket layanan yang sesuai kebutuhan keluarga.',
  },
  {
    number: '03',
    title: 'Lanjutkan proses booking',
    description: 'Masuk ke alur pemesanan yang sudah berjalan di sistem tanpa perubahan proses inti.',
  },
];

interface HomeCemeteryPreviewItem {
  id: string;
  name: string;
  location: string | null;
  description?: string | null;
  imageUrl?: string | null;
  availablePlots: number;
  pricePerPlot: number;
}

function getHomePreviewBadge(availablePlots: number) {
  if (availablePlots > 20) {
    return 'Tersedia banyak';
  }

  if (availablePlots > 0) {
    return 'Masih tersedia';
  }

  return 'Sementara penuh';
}

export default function Home() {
  const [cemeteryPreview, setCemeteryPreview] = useState<HomeCemeteryPreviewItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCemeteryPreview = async () => {
      try {
        const response = await fetch('/api/cemeteries?page=1&limit=3');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal memuat preview pemakaman');
        }

        if (isMounted) {
          setCemeteryPreview(Array.isArray(data.cemeteries) ? data.cemeteries : []);
        }
      } catch (error) {
        console.error('Load cemetery preview error', error);
        if (isMounted) {
          setCemeteryPreview([]);
        }
      } finally {
        if (isMounted) {
          setPreviewLoading(false);
        }
      }
    };

    loadCemeteryPreview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(240,248,242,1),rgba(255,255,255,1))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(39,128,79,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(88,186,130,0.18),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-8">
                <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                  Layanan pemakaman digital yang tenang dan tertata
                </Badge>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
                    Tempat peristirahatan terakhir yang layak, jelas, dan mudah diakses keluarga
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                    MemorialCare membantu proses pencarian pemakaman dan pemesanan layanan dengan
                    pengalaman yang lebih modern, profesional, dan penuh empati tanpa mengubah alur
                    booking yang sudah berjalan.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/cemeteries">
                    <Button size="lg" className="group w-full rounded-full px-6 sm:w-auto">
                      Jelajahi Pemakaman
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full rounded-full border-primary/20 bg-background/80 px-6 sm:w-auto"
                    >
                      Mulai Sekarang
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">Lebih aman</p>
                    <p className="mt-1 text-sm text-muted-foreground">Akses layanan publik yang rapi dan terpercaya.</p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">Lebih mudah dipahami</p>
                    <p className="mt-1 text-sm text-muted-foreground">Informasi penting ditempatkan dengan hierarki yang jelas.</p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">Lebih terarah</p>
                    <p className="mt-1 text-sm text-muted-foreground">Pengguna dapat langsung menuju halaman pemakaman yang dibutuhkan.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[2rem] border border-primary/15 bg-card/95 p-5 shadow-2xl shadow-primary/10 backdrop-blur sm:p-6">
                    <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                      Panduan pemesanan
                    </Badge>
                    <h2 className="mt-5 text-2xl font-semibold text-balance">
                      Ikuti langkah sederhana untuk memesan layanan pemakaman
                    </h2>
                    <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
                      Semua proses dirancang tetap jelas dan tertata, mulai dari memilih
                      pemakaman sampai melanjutkan booking sesuai kebutuhan keluarga.
                    </p>

                    <div className="mt-8 space-y-4">
                      {steps.map((step) => (
                        <div
                          key={step.number}
                          className="rounded-2xl bg-muted/40 p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">
                              {step.number}
                            </div>
                            <div>
                              <p className="font-semibold">{step.title}</p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mt-5 text-3xl font-bold md:text-4xl">
              Membantu keluarga mengurus pemakaman dengan lebih tenang
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              MemorialCare menyajikan informasi pemakaman, ketersediaan lahan, dan alur
              pemesanan secara jelas agar proses pengurusan menjadi lebih mudah dan terorganisir.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="rounded-[1.75rem] border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                Preview pemakaman
              </Badge>
              <h2 className="mt-5 text-3xl font-bold md:text-4xl">
                Halaman pemakaman kini lebih siap dipilih pengguna
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Setiap kartu pemakaman menonjolkan informasi yang paling dibutuhkan keluarga saat
                membandingkan pilihan.
              </p>
            </div>

            <Link href="/cemeteries">
              <Button variant="outline" className="rounded-full border-primary/20 bg-background px-6">
                Lihat Semua Pemakaman
              </Button>
            </Link>
          </div>

          {previewLoading ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden rounded-[1.75rem] border-border/80 bg-background shadow-sm"
                >
                  <Skeleton className="h-52 w-full" />
                  <div className="space-y-4 p-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Skeleton className="h-20 w-full rounded-2xl" />
                      <Skeleton className="h-20 w-full rounded-2xl" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : cemeteryPreview.length > 0 ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {cemeteryPreview.map((item, index) => (
                <Card
                  key={item.id}
                  className="overflow-hidden rounded-[1.75rem] border-border/80 bg-background shadow-sm"
                >
                  <div className="relative">
                    <CemeteryImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-52 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-5">
                      <Badge className="rounded-full bg-white/90 px-3 py-1 text-slate-800 hover:bg-white/90">
                        {getHomePreviewBadge(item.availablePlots)}
                      </Badge>
                      <span className="text-sm font-medium text-white">0{index + 1}</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <p className="mt-2 text-sm text-white/85">
                        {item.location || 'Lokasi akan segera diperbarui'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="line-clamp-3 leading-7 text-muted-foreground">
                      {item.description ||
                        'Informasi pemakaman ini akan membantu keluarga membandingkan lokasi yang paling sesuai.'}
                    </p>
                    <div className="mt-6 rounded-3xl border border-border/70 bg-card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">Nama pemakaman</p>
                        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                          Siap dipilih
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Lokasi tampil jelas di bagian atas kartu dengan foto utama yang dikelola admin.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-background p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Harga mulai
                          </p>
                          <p className="mt-2 font-semibold text-foreground">
                            {formatRupiah(item.pricePerPlot)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-background p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Plot tersedia
                          </p>
                          <p className="mt-2 font-semibold text-foreground">{item.availablePlots}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-12 rounded-[1.75rem] border-border/80 bg-background p-6 text-center shadow-sm">
              <p className="text-muted-foreground">
                Preview pemakaman akan muncul di sini setelah data lokasi tersedia.
              </p>
            </Card>
          )}
        </section>

        <ReviewSection />

        {/* <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Card className="overflow-hidden rounded-[2rem] border-primary/15 bg-[linear-gradient(135deg,rgba(33,107,68,1),rgba(50,140,88,1))] p-8 text-primary-foreground shadow-2xl shadow-primary/15 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge className="rounded-full bg-white/15 px-4 py-1.5 text-white hover:bg-white/15">
                  Siap memulai
                </Badge>
                <h2 className="mt-5 max-w-3xl text-3xl font-bold md:text-4xl">
                  Bantu keluarga mengambil keputusan dengan pengalaman digital yang lebih jelas
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/85">
                  Tombol login dan mulai sekarang tetap mengarah ke route yang sudah ada, sementara
                  tampilan publik dibuat lebih rapi, empatik, dan profesional.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-white/30 bg-white/10 text-white hover:bg-white/15"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-white text-primary hover:bg-white/90"
                  >
                    Mulai Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section> */}
      </main>

      <PublicFooter />
    </div>
  );
}
