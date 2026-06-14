'use client';

import { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  Crown,
  Gem,
  Loader2,
  MapPin,
  PackageCheck,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
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

type BookingPurpose = 'CURRENT_BURIAL' | 'FUTURE_PREPARATION';

interface DeceasedFormState {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfDeath: string;
  additionalNotes: string;
}

type DeceasedFormErrors = Partial<Record<keyof DeceasedFormState, string>>;

const initialDeceasedForm: DeceasedFormState = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  dateOfDeath: '',
  placeOfDeath: '',
  additionalNotes: '',
};

const bookingSteps = [
  { step: 1, title: 'Pilih Lahan' },
  { step: 2, title: 'Pilih Layanan' },
  { step: 3, title: 'Data Almarhum/Almarhumah' },
  { step: 4, title: 'Review Booking' },
];

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

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
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
  const [bookingPurpose, setBookingPurpose] =
    useState<BookingPurpose>('FUTURE_PREPARATION');
  const [deceasedForm, setDeceasedForm] =
    useState<DeceasedFormState>(initialDeceasedForm);
  const [deceasedErrors, setDeceasedErrors] = useState<DeceasedFormErrors>({});
  const [activeStep, setActiveStep] = useState(1);
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
        ).sort((a: ServiceBundle, b: ServiceBundle) => a.price - b.price);

        setCemetery(data);
        setPlots(nextPlots);
        setBundles(nextBundles);
        setSelectedPlot(null);
        setSelectedBundle(null);
        setBookingPurpose('FUTURE_PREPARATION');
        setDeceasedForm(initialDeceasedForm);
        setDeceasedErrors({});
        setActiveStep(1);
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

  const updateDeceasedField = (
    field: keyof DeceasedFormState,
    value: string
  ) => {
    setDeceasedForm((current) => ({
      ...current,
      [field]: value,
    }));
    setDeceasedErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validateDeceasedForm = () => {
    if (bookingPurpose !== 'CURRENT_BURIAL') {
      return {};
    }

    const nextErrors: DeceasedFormErrors = {};
    const fullName = deceasedForm.fullName.trim();
    const dateOfBirth = deceasedForm.dateOfBirth.trim();
    const dateOfDeath = deceasedForm.dateOfDeath.trim();

    if (!fullName) {
      nextErrors.fullName = 'Nama lengkap almarhum/almarhumah wajib diisi.';
    }

    if (!dateOfDeath) {
      nextErrors.dateOfDeath =
        'Tanggal wafat wajib diisi untuk pemakaman saat ini.';
    }

    if (dateOfBirth && dateOfDeath) {
      const birthDate = new Date(`${dateOfBirth}T00:00:00`);
      const deathDate = new Date(`${dateOfDeath}T00:00:00`);

      if (
        !Number.isNaN(birthDate.getTime()) &&
        !Number.isNaN(deathDate.getTime()) &&
        deathDate < birthDate
      ) {
        nextErrors.dateOfDeath =
          'Tanggal wafat tidak boleh lebih awal dari tanggal lahir.';
      }
    }

    return nextErrors;
  };

  const proceedToReview = () => {
    const nextErrors = validateDeceasedForm();
    setDeceasedErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setActiveStep(4);
  };

  const handleContinue = async () => {
    if (!canContinue || !selectedPlotData) return;

    const deceasedProfilePayload =
      bookingPurpose === 'CURRENT_BURIAL'
        ? {
            fullName: deceasedForm.fullName.trim(),
            gender: deceasedForm.gender.trim() || undefined,
            dateOfBirth: deceasedForm.dateOfBirth || undefined,
            dateOfDeath: deceasedForm.dateOfDeath || undefined,
            placeOfDeath: deceasedForm.placeOfDeath.trim() || undefined,
            additionalNotes:
              deceasedForm.additionalNotes.trim() || undefined,
          }
        : undefined;

    setLoading(true);

    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cemeteryId: id,
          plotId: selectedPlotData.id,
          bookingPurpose,
          deceasedProfile: deceasedProfilePayload,
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
            <p className="text-sm text-muted-foreground">
              Memuat pilihan makam dan bundle layanan...
            </p>
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
                  <h1 className="text-3xl font-bold md:text-4xl">
                    Pilih Lahan dan Paket Layanan
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-base">
                    {cemetery?.name
                      ? `Booking di ${cemetery.name} sekarang lebih terarah. Pilih lahan, tentukan layanan, lalu lanjutkan dengan data almarhum/almarhumah atau simpan booking untuk persiapan masa depan.`
                      : 'Pilih lahan makam, tentukan layanan, lalu lanjutkan sesuai kebutuhan keluarga Anda.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)] md:p-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tentang pemakaman
                  </p>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {cemetery?.description ||
                      'Informasi tambahan mengenai pemakaman ini akan ditampilkan di sini saat tersedia.'}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/30 p-5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Lokasi
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {cemetery?.location || 'Lokasi akan segera diperbarui'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {bookingSteps.map((step) => (
              <div
                key={step.step}
                className={cn(
                  'rounded-3xl border px-4 py-4 transition-colors',
                  activeStep === step.step
                    ? 'border-primary/50 bg-primary/8 shadow-sm'
                    : activeStep > step.step
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-border/70 bg-white/80'
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {step.step}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {step.title}
                </p>
              </div>
            ))}
          </div>

          {activeStep === 1 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  1. Pilih Lahan Makam
                </h2>
                <p className="text-sm text-muted-foreground">
                  Klik salah satu lahan yang masih tersedia untuk memulai booking.
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
                          isSelected &&
                            'border-primary bg-primary/10 ring-1 ring-primary/30',
                          !available && 'pointer-events-none opacity-60'
                        )}
                        onClick={() => available && setSelectedPlot(plot.id)}
                      >
                        <CardHeader>
                          <CardTitle>
                            {plot.section} - {plot.plotNumber}
                          </CardTitle>
                          <CardDescription>
                            Status:{' '}
                            {plot.status === 'available'
                              ? 'Tersedia'
                              : plot.status === 'reserved'
                                ? 'Dipesan'
                                : 'Terisi'}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {plot.description || 'Tidak ada deskripsi'}
                          </p>

                          {plot.price ? (
                            <p className="mt-3 text-lg font-semibold text-foreground">
                              {formatRupiah(plot.price)}
                            </p>
                          ) : null}
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

              <div className="flex justify-end">
                <Button
                  type="button"
                  className="min-w-[180px]"
                  disabled={!canContinue}
                  onClick={() => setActiveStep(2)}
                >
                  Lanjutkan
                </Button>
              </div>
            </section>
          ) : null}

          {activeStep === 2 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  2. Pilih Bundle Layanan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pilih bundle layanan yang paling sesuai, atau lanjutkan tanpa
                  bundle tambahan.
                </p>
              </div>

              {bundles.length === 0 ? (
                <Card className="border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    Belum ada paket layanan aktif untuk pemakaman ini. Pemesanan
                    tetap bisa dilanjutkan hanya dengan lahan makam.
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
                          isSelected &&
                            'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200'
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
                              {meta.badge ? (
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
                              ) : null}
                              {isSelected ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                  <Check className="mr-1 h-3.5 w-3.5" />
                                  Dipilih
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <CardTitle>{bundle.name}</CardTitle>
                          <CardDescription>
                            {bundle.category || 'paket layanan'}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="min-h-16 text-sm text-muted-foreground">
                            {bundle.description ||
                              'Paket layanan tanpa deskripsi tambahan.'}
                          </p>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Harga bundle
                            </p>
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

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="sm:min-w-[160px]"
                  onClick={() => setActiveStep(1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <Button
                  type="button"
                  className="sm:min-w-[180px]"
                  onClick={() => setActiveStep(3)}
                >
                  Lanjutkan
                </Button>
              </div>
            </section>
          ) : null}

          {activeStep === 3 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  3. Data Almarhum/Almarhumah
                </h2>
                <p className="text-sm text-muted-foreground">
                  Isi data ini jika booking dilakukan untuk pemakaman yang sudah
                  memiliki data almarhum/almarhumah. Jika booking dilakukan
                  untuk persiapan masa depan, Anda dapat melewati langkah ini.
                </p>
              </div>

              <Card className="rounded-[28px] border-border/70 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle>Tujuan booking</CardTitle>
                  <CardDescription>
                    Pilih tujuan utama booking agar alur berikutnya sesuai.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={bookingPurpose}
                    onValueChange={(value) =>
                      setBookingPurpose(value as BookingPurpose)
                    }
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <label
                      htmlFor="booking-purpose-current"
                      className={cn(
                        'cursor-pointer rounded-3xl border p-5 transition-colors',
                        bookingPurpose === 'CURRENT_BURIAL'
                          ? 'border-primary/50 bg-primary/8'
                          : 'border-border/70 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          id="booking-purpose-current"
                          value="CURRENT_BURIAL"
                          className="mt-1"
                        />
                        <div className="space-y-2">
                          <p className="font-semibold text-foreground">
                            Untuk pemakaman saat ini
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            Tampilkan dan simpan data almarhum/almarhumah agar
                            detail booking lebih lengkap untuk proses pemakaman.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      htmlFor="booking-purpose-future"
                      className={cn(
                        'cursor-pointer rounded-3xl border p-5 transition-colors',
                        bookingPurpose === 'FUTURE_PREPARATION'
                          ? 'border-primary/50 bg-primary/8'
                          : 'border-border/70 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          id="booking-purpose-future"
                          value="FUTURE_PREPARATION"
                          className="mt-1"
                        />
                        <div className="space-y-2">
                          <p className="font-semibold text-foreground">
                            Untuk persiapan masa depan
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            Booking tetap bisa dibuat tanpa data
                            almarhum/almarhumah dan dapat dilanjutkan ke tahap
                            pembayaran.
                          </p>
                        </div>
                      </div>
                    </label>
                  </RadioGroup>

                  {bookingPurpose === 'CURRENT_BURIAL' ? (
                    <div className="space-y-5 rounded-[28px] border border-border/70 bg-muted/20 p-5">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          Form data almarhum/almarhumah
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tanggal wafat wajib diisi untuk booking pemakaman saat
                          ini. Field lain dapat dilengkapi sesuai kebutuhan.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="deceased-full-name">
                            Nama lengkap almarhum/almarhumah
                          </Label>
                          <Input
                            id="deceased-full-name"
                            value={deceasedForm.fullName}
                            onChange={(event) =>
                              updateDeceasedField('fullName', event.target.value)
                            }
                            placeholder="Contoh: Ahmad Rahman"
                            aria-invalid={Boolean(deceasedErrors.fullName)}
                          />
                          {deceasedErrors.fullName ? (
                            <p className="text-sm text-destructive">
                              {deceasedErrors.fullName}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deceased-gender">Jenis kelamin</Label>
                          <Input
                            id="deceased-gender"
                            value={deceasedForm.gender}
                            onChange={(event) =>
                              updateDeceasedField('gender', event.target.value)
                            }
                            placeholder="Contoh: Laki-laki"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deceased-place-of-death">
                            Tempat wafat
                          </Label>
                          <Input
                            id="deceased-place-of-death"
                            value={deceasedForm.placeOfDeath}
                            onChange={(event) =>
                              updateDeceasedField(
                                'placeOfDeath',
                                event.target.value
                              )
                            }
                            placeholder="Contoh: Jakarta"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deceased-date-of-birth">
                            Tanggal lahir
                          </Label>
                          <Input
                            id="deceased-date-of-birth"
                            type="date"
                            value={deceasedForm.dateOfBirth}
                            onChange={(event) =>
                              updateDeceasedField(
                                'dateOfBirth',
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(deceasedErrors.dateOfBirth)}
                          />
                          {deceasedErrors.dateOfBirth ? (
                            <p className="text-sm text-destructive">
                              {deceasedErrors.dateOfBirth}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deceased-date-of-death">
                            Tanggal wafat
                          </Label>
                          <Input
                            id="deceased-date-of-death"
                            type="date"
                            value={deceasedForm.dateOfDeath}
                            onChange={(event) =>
                              updateDeceasedField(
                                'dateOfDeath',
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(deceasedErrors.dateOfDeath)}
                          />
                          {deceasedErrors.dateOfDeath ? (
                            <p className="text-sm text-destructive">
                              {deceasedErrors.dateOfDeath}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="deceased-additional-notes">
                            Catatan tambahan
                          </Label>
                          <Textarea
                            id="deceased-additional-notes"
                            value={deceasedForm.additionalNotes}
                            onChange={(event) =>
                              updateDeceasedField(
                                'additionalNotes',
                                event.target.value
                              )
                            }
                            placeholder="Tambahkan informasi penting lain bila diperlukan."
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
                      Booking ini akan dibuat tanpa data almarhum/almarhumah.
                      Anda bisa langsung melewati langkah ini dan melanjutkan ke
                      review booking.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="sm:min-w-[160px]"
                  onClick={() => setActiveStep(2)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:min-w-[160px]"
                    onClick={() => {
                      setBookingPurpose('FUTURE_PREPARATION');
                      setActiveStep(4);
                    }}
                  >
                    Lewati
                  </Button>
                  <Button
                    type="button"
                    className="sm:min-w-[180px]"
                    onClick={proceedToReview}
                  >
                    Lanjutkan
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {activeStep === 4 && selectedPlotData ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  4. Review Booking
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tinjau kembali pilihan cemetery, plot, layanan, tujuan
                  booking, dan data almarhum/almarhumah sebelum lanjut ke
                  pembayaran.
                </p>
              </div>

              <Card className="rounded-[28px] border-border/70 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle>Ringkasan pesanan</CardTitle>
                  <CardDescription>
                    Booking akan dibuat atas akun yang sedang login dan tetap
                    melanjutkan ke tahap pembayaran seperti biasa.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">Cemetery</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {cemetery?.name}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">Plot</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {selectedPlotData.section} - {selectedPlotData.plotNumber}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatRupiah(selectedPlotData.price || 0)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">Layanan</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {selectedBundleData?.name || 'Tanpa bundle tambahan'}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatRupiah(selectedBundleData?.price || 0)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">
                        Tujuan booking
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {bookingPurpose === 'CURRENT_BURIAL'
                          ? 'Untuk pemakaman saat ini'
                          : 'Untuk persiapan masa depan'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total estimasi pembayaran
                        </p>
                        <p className="mt-1 text-3xl font-bold text-foreground">
                          {formatRupiah(totalPrice)}
                        </p>
                      </div>
                      <Badge className="bg-primary hover:bg-primary">
                        {selectedBundleData
                          ? '1 bundle dipilih'
                          : 'Tanpa bundle'}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/70 bg-white p-5">
                    <p className="text-sm font-medium text-muted-foreground">
                      Data almarhum/almarhumah
                    </p>

                    {bookingPurpose === 'CURRENT_BURIAL' ? (
                      <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                        <p>
                          <span className="font-medium text-foreground">
                            Nama lengkap:
                          </span>{' '}
                          {deceasedForm.fullName}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Jenis kelamin:
                          </span>{' '}
                          {deceasedForm.gender.trim() || '-'}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Tanggal lahir:
                          </span>{' '}
                          {deceasedForm.dateOfBirth
                            ? formatProfileDate(deceasedForm.dateOfBirth)
                            : '-'}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Tanggal wafat:
                          </span>{' '}
                          {deceasedForm.dateOfDeath
                            ? formatProfileDate(deceasedForm.dateOfDeath)
                            : '-'}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Tempat wafat:
                          </span>{' '}
                          {deceasedForm.placeOfDeath.trim() || '-'}
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-medium text-foreground">
                            Catatan tambahan:
                          </span>{' '}
                          {deceasedForm.additionalNotes.trim() || '-'}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Data almarhum/almarhumah belum diisi karena booking ini
                        dapat digunakan untuk persiapan masa depan.
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto sm:min-w-[160px]"
                    onClick={() => setActiveStep(3)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Kembali
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto sm:min-w-[240px]"
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
                </CardFooter>
              </Card>
            </section>
          ) : null}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
