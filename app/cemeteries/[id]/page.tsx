'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Gem, Loader2, PackageCheck } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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

        const nextPlots = data.plots || [];
        const nextBundles = (data.services || []).sort(
          (a: ServiceBundle, b: ServiceBundle) => a.price - b.price
        );

        setCemetery(data);
        setPlots(nextPlots);
        setBundles(nextBundles);
        setSelectedPlot(nextPlots[0]?.id || null);
        setSelectedBundle(nextBundles[0]?.id || null);
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

  const handleContinue = async () => {
    if (!selectedPlotData || selectedPlotData.status !== 'available') return;

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
      <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-muted-foreground">Memuat pilihan makam dan bundle layanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive bg-destructive/10 p-6">
          <p className="font-medium text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Booking bundle
          </Badge>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Pilih Lahan dan Paket Layanan
            </h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              {cemetery?.name
                ? `Booking di ${cemetery.name} sekarang lebih cepat. Pilih lahan, lalu langsung tentukan paket layanan seperti Reguler, VIP, atau VVIP tanpa klik layanan satu per satu.`
                : 'Pilih lahan makam dan tentukan paket layanan terbaik untuk kebutuhan keluarga Anda.'}
            </p>
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
            {plots.map((plot) => {
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
                    <CardDescription>Status: {plot.status}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {plot.description || 'Tidak ada deskripsi'}
                    </p>

                    {plot.price && (
                      <p className="mt-3 text-lg font-semibold text-foreground">
                        Rp {plot.price.toLocaleString('id-ID')}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full" disabled={!available}>
                      {isSelected ? 'Dipilih' : 'Pilih lahan'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
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
                Belum ada bundle layanan aktif untuk cemetery ini. Booking tetap bisa dilanjutkan hanya dengan lahan makam.
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
                    onClick={() => setSelectedBundle(bundle.id)}
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
                      <CardDescription>{bundle.category || 'bundle'}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="min-h-16 text-sm text-muted-foreground">
                        {bundle.description || 'Paket layanan tanpa deskripsi tambahan.'}
                      </p>
                      <div>
                        <p className="text-sm text-muted-foreground">Harga bundle</p>
                        <p className="text-2xl font-bold text-foreground">
                          Rp {bundle.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full"
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
                    Rp {selectedPlotData.price?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Bundle layanan</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {selectedBundleData?.name || 'Tanpa bundle tambahan'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Rp {selectedBundleData?.price.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total estimasi pembayaran</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Badge className="bg-primary hover:bg-primary">
                    1 bundle dipilih
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleContinue}
                disabled={loading || selectedPlotData.status !== 'available'}
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
  );
}
