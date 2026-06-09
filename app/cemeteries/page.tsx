'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  MapPin,
  Trees,
  Users,
} from 'lucide-react';

import { BackButton } from '@/components/back-button';
import { CemeteryImage } from '@/components/cemetery-image';
import { Header } from '@/components/header';
import { PublicFooter } from '@/components/public-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/utils';

interface Cemetery {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  description?: string;
  totalPlots: number;
  availablePlots: number;
  pricePerPlot: number;
  imageUrl?: string;
  contactEmail: string;
  contactPhone: string;
}

function getAvailabilityMeta(availablePlots: number) {
  if (availablePlots > 20) {
    return {
      label: 'Banyak tersedia',
      className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    };
  }

  if (availablePlots > 0) {
    return {
      label: 'Terbatas',
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    };
  }

  return {
    label: 'Penuh',
    className: 'bg-slate-200 text-slate-700 hover:bg-slate-200',
  };
}

export default function CemeteriesPage() {
  const [cemeteries, setCemeteries] = useState<Cemetery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchCemeteries = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/cemeteries?page=${page}&limit=12`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat data pemakaman');
        }

        if (!isMounted) return;

        const list = Array.isArray(data.cemeteries)
          ? data.cemeteries
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

        setCemeteries(list);
        setTotalPages(data.pagination?.pages || data.pages || 1);
      } catch (err) {
        if (!isMounted) return;

        console.error(err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data pemakaman');
        setCemeteries([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCemeteries();

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(240,248,242,1),rgba(255,255,255,1))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(57,138,89,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(119,194,149,0.14),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div className="space-y-5">
                <h1 className="max-w-3xl text-3xl font-bold text-balance md:text-4xl lg:text-5xl">
                  Temukan pemakaman yang paling sesuai dengan kebutuhan keluarga
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Kami merapikan tampilan daftar pemakaman agar informasi seperti lokasi, harga
                  mulai, plot tersedia, dan status lebih mudah dibaca sebelum Anda masuk ke detail.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/cemeteries/map">
                    <Button variant="outline" className="w-full rounded-full border-primary/20 bg-background/80 sm:w-auto">
                      Lihat Peta
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full rounded-full sm:w-auto">Mulai Sekarang</Button>
                  </Link>
                </div>
              </div>

              <Card className="rounded-[2rem] border-border/80 bg-card/90 p-6 shadow-xl shadow-primary/5">
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-3xl border border-border/70 bg-background p-5">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="mt-4 font-semibold">Lokasi mudah dipindai</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Nama pemakaman dan area tampil lebih menonjol.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background p-5">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                    <p className="mt-4 font-semibold">Harga mulai jelas</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Pengguna lebih cepat memperkirakan biaya awal.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background p-5">
                    <Trees className="h-5 w-5 text-primary" />
                    <p className="mt-4 font-semibold">Status lebih informatif</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Badge ketersediaan membantu proses pemilihan.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {error && (
            <Card className="mb-8 rounded-3xl border-destructive/30 bg-destructive/10 p-6">
              <p className="font-medium text-destructive">{error}</p>
            </Card>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="overflow-hidden rounded-[1.75rem] border-border/80">
                  <Skeleton className="h-44 w-full" />
                  <div className="space-y-4 p-6">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="grid gap-3 pt-4 sm:grid-cols-2">
                      <Skeleton className="h-20 w-full rounded-2xl" />
                      <Skeleton className="h-20 w-full rounded-2xl" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : cemeteries.length === 0 ? (
            <Card className="rounded-[2rem] border-border/80 bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                Belum ada data pemakaman yang ditemukan.
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button className="rounded-full">Kembali ke Beranda</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Daftar pemakaman tersedia</h2>
                  <p className="mt-2 text-muted-foreground">
                    Pilih lokasi yang paling sesuai, lalu lanjutkan ke halaman detail untuk melihat
                    plot dan layanan yang tersedia.
                  </p>
                </div>
                <Badge className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                  {cemeteries.length} pemakaman pada halaman ini
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {cemeteries.map((cemetery) => {
                  const availability = getAvailabilityMeta(cemetery.availablePlots);

                  return (
                    <Link key={cemetery.id} href={`/cemeteries/${cemetery.id}`} className="group">
                      <Card className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl">
                        <div className="relative">
                          <CemeteryImage
                            src={cemetery.imageUrl}
                            alt={cemetery.name}
                            className="h-52 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
                          <div className="absolute right-5 top-5">
                            <Badge className={`rounded-full px-3 py-1 ${availability.className}`}>
                              {availability.label}
                            </Badge>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                              <MapPin className="h-7 w-7" />
                            </div>
                            <h3 className="mt-8 text-2xl font-semibold text-balance">
                              {cemetery.name}
                            </h3>
                            <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
                              <MapPin className="h-4 w-4 text-white" />
                              {cemetery.location || 'Lokasi akan segera diperbarui'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          {cemetery.description && (
                            <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                              {cemetery.description}
                            </p>
                          )}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Harga mulai
                              </p>
                              <p className="mt-2 text-lg font-semibold text-foreground">
                                {formatRupiah(cemetery.pricePerPlot)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                Plot tersedia
                              </p>
                              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                                <Users className="h-4 w-4 text-primary" />
                                {cemetery.availablePlots}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3 text-sm">
                            <span className="text-muted-foreground">Total plot</span>
                            <span className="font-medium text-foreground">{cemetery.totalPlots}</span>
                          </div>

                          <div className="mt-6">
                            <Button className="w-full rounded-full">
                              Lihat Detail
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    className="rounded-full border-primary/20 bg-background px-5"
                  >
                    Sebelumnya
                  </Button>
                  <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                    Halaman {page} dari {totalPages}
                  </Badge>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    className="rounded-full border-primary/20 bg-background px-5"
                  >
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}

          <Card className="mt-12 rounded-[2rem] border-border/80 bg-[linear-gradient(180deg,rgba(242,249,244,1),rgba(255,255,255,1))] p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <BadgeCheck className="h-5 w-5" />
                  <p className="font-medium">Alur publik tetap sama</p>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">
                  Setelah memilih pemakaman, pengguna tetap masuk ke proses detail dan booking yang
                  sudah ada
                </h3>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                  Pembaruan ini hanya memoles presentasi visual agar daftar lokasi terasa lebih
                  siap dipilih tanpa menyentuh query data, alur booking, maupun auth.
                </p>
              </div>

              <Link href="/about">
                <Button variant="outline" className="rounded-full border-primary/20 bg-background px-6">
                  Pelajari MemorialCare
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
