'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Users, DollarSign } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/header';
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <section className="bg-primary/10 py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <BackButton fallbackHref="/" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Temukan Tempat Peristirahatan yang Tepat
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Telusuri lahan makam yang tersedia dan temukan pilihan terbaik untuk keluarga Anda.
            </p>
            <div>
              <Link href="/cemeteries/map">
                <Button variant="outline" className="border-border text-foreground hover:bg-background">
                  Lihat Peta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <Card className="p-6 bg-destructive/10 border-destructive mb-8">
              <p className="text-destructive font-medium">{error}</p>
            </Card>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-2 pt-4">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : cemeteries.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border">
              <p className="text-lg text-muted-foreground mb-6">Belum ada data pemakaman yang ditemukan.</p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Kembali ke Beranda
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cemeteries.map((cemetery) => (
                  <Link key={cemetery.id} href={`/cemeteries/${cemetery.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col bg-card border-border">
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-b border-border">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-primary mx-auto mb-2 opacity-60" />
                          <p className="text-muted-foreground text-sm">{cemetery.location}</p>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-foreground mb-2 text-balance">
                          {cemetery.name}
                        </h3>

                        {cemetery.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {cemetery.description}
                          </p>
                        )}

                        <div className="space-y-3 mt-auto pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground font-medium">
                                {cemetery.availablePlots} lahan tersedia
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-accent" />
                              <span className="text-sm text-foreground font-medium">
                                {formatRupiah(cemetery.pricePerPlot)}
                              </span>
                            </div>
                          </div>

                          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">
                      Halaman {page} dari {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
