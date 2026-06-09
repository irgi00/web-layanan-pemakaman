'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Gem, Loader2, MapPin, PackageCheck } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { CemeteryImage } from '@/components/cemetery-image';
import { Header } from '@/components/header';
import { PublicFooter } from '@/components/public-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn, formatRupiah } from '@/lib/utils';

interface Plot {
  id: string;
  plotNumber: string;
  section: string;
  price?: number;
  status: 'available' | 'reserved' | 'occupied';
  description?: string;
}

interface ServiceBundle {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  isActive?: boolean;
}

interface CemeteryResponse {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  plots: Plot[];
  services: ServiceBundle[];
}

function getBundleMeta(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('vvip')) {
    return {
      badge: 'Populer',
      cardClassName: 'border-amber-300 bg-gradient-to-b from-amber-50 to-background',
      iconClassName: 'bg-amber-100 text-amber-700',
    };
  }

  if (normalized.includes('vip')) {
    return {
      badge: 'Rekomendasi',
      cardClassName: 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-background',
      iconClassName: 'bg-emerald-100 text-emerald-700',
    };
  }

  return {
    badge: null,
    cardClassName: '',
    iconClassName: 'bg-slate-100 text-slate-700',
  };
}

function getBundleIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes('vvip')) {
    return Gem;
  }

  if (normalized.includes('vip')) {
    return Crown;
  }

  return PackageCheck;
}

export default function CemeteryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [cemetery, setCemetery] = useState<CemeteryResponse | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [bundles, setBundles] = useState<ServiceBundle[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCemeteryDetail = async () => {
      try {
        setPageLoading(true);
        setError(null);

        const res = await fetch(`/api/cemeteries/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal memuat data makam');
        }

        const nextPlots = Array.isArray(data.plots) ? data.plots : [];
        const nextBundles = (
          Array.isArray(data.services)
            ? data.services
            : Array.isArray(data.bundles)
              ? data.bundles
              : []
        ).sort(
          (a: ServiceBundle, b: ServiceBundle) => a.price - b.price
        );

        setCemetery(data);
        setPlots(nextPlots);
        setBundles(nextBundles);
        setSelectedPlot(null);
        setSelectedBundle(null);
      } catch (fetchError) {
        console.error(fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Terjadi kesalahan saat memuat halaman'
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchCemeteryDetail();
  }, [id]);

  const selectedPlotData = useMemo(
    () => plots.find((plot) => plot.id === selectedPlot) || null,
    [plots, selectedPlot]
  );

  const selectedBundleData = useMemo(
    () => bundles.find((bundle) => bundle.id === selectedBundle) || null,
    [bundles, selectedBundle]
  );

  const totalPrice =
    (selectedPlotData?.price || 0) + (selectedBundleData?.price || 0);

  const canContinue =
    Boolean(selectedPlotData) && selectedPlotData?.status === 'available';

  const handleContinue = async () => {
    if (!canContinue || !selectedPlotData) return;

    setLoading(true);

    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cemeteryId: id,
          plotId: selectedPlotData.id,
          selectedServices: selectedBundleData
            ? [
                {
                  serviceId: selectedBundleData.id,
                  quantity: 1,
                },
              ]
            : [],
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        alert(bookingData.error || 'Gagal membuat booking');
        return;
      }

      router.push(`/payments/${bookingData.payment.id}`);
    } catch (submitError) {
      console.error(submitError);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm text-muted-foreground">Memuat pilihan makam dan bundle layanan...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-destructive bg-destructive/10 p-6">
            <p className="font-medium text-destructive">{error}</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="space-y-3">
            <BackButton fallbackHref="/cemeteries" /> 
            <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
              <div className="relative">
                <CemeteryImage
                  src={cemetery?.imageUrl}
                  alt={cemetery?.name || 'Cemetery'}
                  className="h-72 w-full object-cover md:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                  <h1 className="text-3xl font-bold md:text-4xl">Pilih Lahan dan Paket Layanan</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-base">
                    {cemetery?.name
                      ? `Booking di ${cemetery.name} sekarang lebih cepat. Pilih lahan, lalu langsung tentukan paket layanan seperti Reguler, VIP, atau VVIP tanpa klik layanan satu per satu.`
                      : 'Pilih lahan makam dan tentukan paket layanan terbaik untuk kebutuhan keluarga Anda.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)] md:p-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tentang pemakaman</p>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {cemetery?.description ||
                      'Informasi tambahan mengenai pemakaman ini akan ditampilkan di sini saat tersedia.'}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/30 p-5">
                  <p className="text-sm font-medium text-muted-foreground">Lokasi</p>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{cemetery?.location || 'Lokasi akan segera diperbarui'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">1. Pilih Lahan Makam</h2>
            <p className="text-sm text-muted-foreground">
              Klik salah satu lahan yang masih tersedia.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plots.length === 0 ? (
              <Card className="border-border bg-card p-6 md:col-span-2 xl:col-span-3">
                <p className="text-sm text-muted-foreground">
                  Belum ada lahan tersedia untuk pemakaman ini.
                </p>
              </Card>
            ) : (
              plots.map((plot) => {
                const isSelected = plot.id === selectedPlot;
                const available = plot.status === 'available';

                return (
                  <Card
                    key={plot.id}
                    className={cn(
                      'cursor-pointer border-border transition hover:shadow-lg',
                      isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30',
                      !available && 'pointer-events-none opacity-60'
                    )}
                    onClick={() => available && setSelectedPlot(plot.id)}
                  >
                    <CardHeader>
                      <CardTitle>
                        {plot.section} - {plot.plotNumber}
                      </CardTitle>
                      <CardDescription>
                        Status: {plot.status === 'available' ? 'Tersedia' : plot.status === 'reserved' ? 'Dipesan' : 'Terisi'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {plot.description || 'Tidak ada deskripsi'}
                      </p>

                      {plot.price && (
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          {formatRupiah(plot.price)}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button
                        type="button"
                        className="w-full"
                        disabled={!available}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (available) {
                            setSelectedPlot(plot.id);
                          }
                        }}
                      >
                        {isSelected ? 'Dipilih' : 'Pilih lahan'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
          </section>

          <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">2. Pilih Bundle Layanan</h2>
            <p className="text-sm text-muted-foreground">
              Satu klik untuk memilih paket layanan yang paling cocok, seperti Reguler, VIP, atau VVIP.
            </p>
          </div>

          {bundles.length === 0 ? (
            <Card className="border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Belum ada paket layanan aktif untuk pemakaman ini. Pemesanan tetap bisa dilanjutkan hanya dengan lahan makam.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {bundles.map((bundle) => {
                const isSelected = bundle.id === selectedBundle;
                const Icon = getBundleIcon(bundle.name);
                const meta = getBundleMeta(bundle.name);

                return (
                  <Card
                    key={bundle.id}
                    className={cn(
                      'cursor-pointer border-border transition hover:shadow-lg',
                      meta.cardClassName,
                      isSelected && 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200'
                    )}
                    onClick={() =>
                      setSelectedBundle((current) =>
                        current === bundle.id ? null : bundle.id
                      )
                    }
                  >
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={cn(
                            'flex h-11 w-11 items-center justify-center rounded-xl',
                            meta.iconClassName
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          {meta.badge && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'border-transparent',
                                meta.badge === 'Populer'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              )}
                            >
                              {meta.badge}
                            </Badge>
                          )}
                          {isSelected && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600">
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Dipilih
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle>{bundle.name}</CardTitle>
                      <CardDescription>{bundle.category || 'paket layanan'}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="min-h-16 text-sm text-muted-foreground">
                        {bundle.description || 'Paket layanan tanpa deskripsi tambahan.'}
                      </p>
                      <div>
                        <p className="text-sm text-muted-foreground">Harga bundle</p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatRupiah(bundle.price)}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBundle((current) =>
                            current === bundle.id ? null : bundle.id
                          );
                        }}
                      >
                        {isSelected ? 'Bundle dipilih' : 'Pilih bundle'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
          </section>

          {selectedPlotData && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
                <CardDescription>
                  Tinjau pilihan lahan dan bundle layanan sebelum lanjut ke pembayaran.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Lahan makam</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {selectedPlotData.section} - {selectedPlotData.plotNumber}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatRupiah(selectedPlotData.price || 0)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Bundle layanan</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {selectedBundleData?.name || 'Tanpa bundle tambahan'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatRupiah(selectedBundleData?.price || 0)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total estimasi pembayaran</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">
                        {formatRupiah(totalPrice)}
                      </p>
                    </div>
                    <Badge className="bg-primary hover:bg-primary">
                      {selectedBundleData ? '1 bundle dipilih' : 'Tanpa bundle'}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleContinue}
                  disabled={loading || !canContinue}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Lanjutkan ke Pembayaran'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
