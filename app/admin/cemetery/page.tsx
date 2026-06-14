'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { CloudinaryUpload } from '@/components/cloudinary-upload';
import { DashboardSection } from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DEFAULT_CEMETERY_IMAGE, isSupportedCemeteryImageUrl } from '@/lib/cemetery-image';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cemeteryId?: string | null;
}

interface CemeterySummary {
  id: string;
  name: string;
  location: string | null;
  city: string | null;
  province: string | null;
  imageUrl?: string | null;
  capacity?: number;
  contactNumber?: string | null;
  description?: string | null;
}

interface OverviewResponse {
  role: string;
  cemetery: CemeterySummary | null;
  stats: {
    totalPlots: number;
    availablePlots: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

async function readResponseBody(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

function getErrorMessageFromBody(body: unknown, fallbackMessage: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error;
  }

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  return fallbackMessage;
}

export default function AdminCemeteryInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [savingImage, setSavingImage] = useState(false);
  const [imageFormError, setImageFormError] = useState<string | null>(null);
  const [imageFormSuccess, setImageFormSuccess] = useState<string | null>(null);

  const loadCemeteryInfo = async () => {
    const overviewEndpoint = '/api/admin/overview';
    const overviewResponse = await fetch(overviewEndpoint, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const overviewBody = await readResponseBody(overviewResponse);

    if (!overviewResponse.ok) {
      console.error('Admin cemetery info request failed', {
        endpoint: overviewEndpoint,
        status: overviewResponse.status,
        statusText: overviewResponse.statusText,
        error: overviewBody,
      });
      setError(
        `Informasi cemetery gagal dimuat (${overviewResponse.status}): ${getErrorMessageFromBody(
          overviewBody,
          'Terjadi kesalahan pada endpoint overview.'
        )}`
      );
      setOverview(null);
    } else {
      setOverview(overviewBody as OverviewResponse);
      setError(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const me = await meResponse.json();

        if (me.role === 'SUPER_ADMIN') {
          router.push('/superadmin/dashboard');
          return;
        }

        if (me.role !== 'CEMETERY_ADMIN') {
          router.push('/login');
          return;
        }

        setUser(me);
        await loadCemeteryInfo();
      } catch (loadError) {
        console.error('Admin cemetery info bootstrap error', loadError);
        setError('Terjadi kesalahan saat memuat informasi cemetery.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  useEffect(() => {
    setImageUrlInput(overview?.cemetery?.imageUrl ?? '');
  }, [overview?.cemetery?.id, overview?.cemetery?.imageUrl]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleSaveImage = async () => {
    if (!cemetery) {
      return;
    }

    const trimmedImageUrl = imageUrlInput.trim();

    if (trimmedImageUrl && !isSupportedCemeteryImageUrl(trimmedImageUrl)) {
      setImageFormError('Gunakan URL gambar http(s) atau path publik yang diawali /.');
      setImageFormSuccess(null);
      return;
    }

    try {
      setSavingImage(true);
      setImageFormError(null);
      setImageFormSuccess(null);

      const response = await fetch('/api/admin/cemetery', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          imageUrl: trimmedImageUrl,
        }),
      });

      const body = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(getErrorMessageFromBody(body, 'Gagal menyimpan gambar cemetery.'));
      }

      const nextCemetery =
        body && typeof body === 'object' && 'cemetery' in body ? body.cemetery : null;

      if (nextCemetery && typeof nextCemetery === 'object') {
        setOverview((currentOverview) =>
          currentOverview
            ? {
                ...currentOverview,
                cemetery: currentOverview.cemetery
                  ? {
                      ...currentOverview.cemetery,
                      ...(nextCemetery as CemeterySummary),
                    }
                  : (nextCemetery as CemeterySummary),
              }
            : currentOverview
        );
      }

      setImageFormSuccess(
        trimmedImageUrl
          ? 'Gambar cemetery berhasil diperbarui.'
          : 'Gambar cemetery dikosongkan. Placeholder default akan dipakai.'
      );
    } catch (saveError) {
      console.error('Save cemetery image error', saveError);
      setImageFormError(
        saveError instanceof Error
          ? saveError.message
          : 'Terjadi kesalahan saat menyimpan gambar cemetery.'
      );
    } finally {
      setSavingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="border-white/70 bg-white/90 p-8">Memuat informasi cemetery...</Card>
        </div>
      </div>
    );
  }

  const cemetery = overview?.cemetery;

  return (
    <PortalShell
      role="CEMETERY_ADMIN"
      roleLabel="Cemetery Admin"
      title="Informasi Cemetery"
      description="Lihat detail lokasi cemetery yang Anda kelola."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <DashboardSection
          title="Detail Lokasi"
          description="Informasi umum mengenai cemetery yang terhubung dengan akun Anda."
        >
          {cemetery ? (
            <div className="rounded-[24px] border border-border/70 bg-white/70 p-6 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.8)]">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div>
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MapPin className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{cemetery.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {[cemetery.city, cemetery.province].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alamat Lengkap</p>
                      <p className="mt-1 text-base text-foreground">
                        {cemetery.location || 'Belum ada data alamat lengkap.'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status Kapasitas</p>
                      <p className="mt-1 text-base text-foreground">
                        Terdapat {overview.stats.totalPlots} total plot ({overview.stats.availablePlots}{' '}
                        tersedia)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[24px] border border-border/70 bg-card/80 p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preview gambar cemetery</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload foto dari perangkat lokal atau tempel URL/path manual jika dibutuhkan.
                    </p>
                  </div>

                  <CloudinaryUpload
                    value={imageUrlInput}
                    onChange={setImageUrlInput}
                    previewAlt={`Preview gambar ${cemetery.name}`}
                    inputLabel="URL gambar"
                    inputPlaceholder="https://res.cloudinary.com/... atau /images/cemeteries/nama-gambar.jpg"
                    helperText="Kosongkan field ini jika ingin kembali memakai placeholder default."
                    emptyStateTitle="Belum ada foto cemetery"
                    emptyStateDescription="Upload foto preview pemakaman agar kartu dan detail cemetery tampil lebih lengkap."
                    fallbackSrc={DEFAULT_CEMETERY_IMAGE}
                    clearButtonText="Pakai Placeholder"
                  />

                  {imageFormError && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {imageFormError}
                    </div>
                  )}

                  {imageFormSuccess && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {imageFormSuccess}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSaveImage}
                    disabled={savingImage}
                    className="w-full rounded-full"
                  >
                    {savingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan gambar...
                      </>
                    ) : (
                      'Simpan gambar cemetery'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Akun Anda belum terhubung ke cemetery manapun.
            </div>
          )}
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
