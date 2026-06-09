'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
import { CemeteryImage } from '@/components/cemetery-image';
import {
  DashboardHero,
  DashboardAsideCard,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isSupportedCemeteryImageUrl } from '@/lib/cemetery-image';

interface CemeteryItem {
  id: string;
  name: string;
  location: string | null;
  city?: string | null;
  province?: string | null;
  imageUrl?: string | null;
  totalPlots?: number;
  availablePlots?: number;
  totalBookings?: number;
  totalRevenue?: number;
  admins?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
}

export default function SuperadminCemeteriesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);
  const [selectedCemeteryId, setSelectedCemeteryId] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [savingImage, setSavingImage] = useState(false);
  const [imageFormError, setImageFormError] = useState<string | null>(null);
  const [imageFormSuccess, setImageFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me');
        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }
        const me = await meResponse.json();
        if (me.role !== 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
          return;
        }
        setUserEmail(me.email);

        const cemRes = await fetch('/api/superadmin/cemeteries');
        if (!cemRes.ok) throw new Error('Gagal memuat data cemetery');
        const cemData = await cemRes.json();
        const nextCemeteries = cemData.cemeteries || [];
        setCemeteries(nextCemeteries);
        setSelectedCemeteryId((currentValue: string) => currentValue || nextCemeteries[0]?.id || '');
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data cemetery.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  useEffect(() => {
    const selectedCemetery = cemeteries.find((cemetery) => cemetery.id === selectedCemeteryId);
    setImageUrlInput(selectedCemetery?.imageUrl ?? '');
  }, [cemeteries, selectedCemeteryId]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const selectedCemetery =
    cemeteries.find((cemetery) => cemetery.id === selectedCemeteryId) || null;

  const handleSaveImage = async () => {
    if (!selectedCemeteryId) {
      setImageFormError('Pilih cemetery terlebih dahulu.');
      setImageFormSuccess(null);
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
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cemeteryId: selectedCemeteryId,
          imageUrl: trimmedImageUrl,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal memperbarui gambar cemetery.');
      }

      const updatedCemetery = body.cemetery as CemeteryItem | undefined;

      if (updatedCemetery) {
        setCemeteries((currentCemeteries) =>
          currentCemeteries.map((cemetery) =>
            cemetery.id === updatedCemetery.id
              ? {
                  ...cemetery,
                  ...updatedCemetery,
                }
              : cemetery
          )
        );
      }

      setImageFormSuccess(
        trimmedImageUrl
          ? 'Gambar cemetery berhasil diperbarui.'
          : 'Gambar cemetery dikosongkan. Placeholder default akan dipakai.'
      );
    } catch (saveError) {
      console.error('Save superadmin cemetery image error', saveError);
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat data cemetery...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Semua Cemetery"
      description="Pantau seluruh lokasi pemakaman yang terdaftar dalam sistem."
      userEmail={userEmail}
      onLogout={handleLogout}
      headerSlot={
        <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          {userEmail}
        </Badge>
      }
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="space-y-8">
          <DashboardHero
            eyebrow="Master Data"
            title="Jaringan Cemetery"
            description="Daftar lengkap seluruh lokasi pemakaman yang terdaftar, beserta kapasitas plot, jumlah booking, dan admin yang bertugas."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Cemetery"
              value={cemeteries.length}
              description="Lokasi pemakaman yang terdaftar."
              icon={Building2}
              accentClassName="bg-violet-500/10 text-violet-600"
            />
            <DashboardStatCard
              label="Total Plot"
              value={cemeteries.reduce((sum, c) => sum + (c.totalPlots ?? 0), 0)}
              description="Akumulasi seluruh plot."
              icon={Building2}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              label="Plot Tersedia"
              value={cemeteries.reduce((sum, c) => sum + (c.availablePlots ?? 0), 0)}
              description="Plot yang masih bisa dipesan."
              icon={Building2}
              accentClassName="bg-sky-500/10 text-sky-600"
            />
          </div>

          <DashboardSection
            title="Kelola Gambar Cemetery"
            description="Pilih cemetery, masukkan URL/path gambar, lalu simpan untuk memperbarui tampilan publik."
          >
            <div className="grid gap-6 rounded-[24px] border border-border/70 bg-white/70 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="selected-cemetery">Pilih cemetery</Label>
                  <select
                    id="selected-cemetery"
                    value={selectedCemeteryId}
                    onChange={(event) => setSelectedCemeteryId(event.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="">Pilih cemetery</option>
                    {cemeteries.map((cemetery) => (
                      <option key={cemetery.id} value={cemetery.id}>
                        {cemetery.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="superadmin-cemetery-image-url">URL gambar</Label>
                  <Input
                    id="superadmin-cemetery-image-url"
                    value={imageUrlInput}
                    onChange={(event) => setImageUrlInput(event.target.value)}
                    placeholder="https://... atau /images/cemeteries/nama-gambar.jpg"
                    disabled={!selectedCemetery}
                  />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Kosongkan field ini untuk memakai placeholder default pada kartu dan detail cemetery.
                  </p>
                </div>

                {selectedCemetery && (
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="font-medium text-foreground">{selectedCemetery.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedCemetery.location || 'Lokasi belum tersedia'}
                    </p>
                  </div>
                )}

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
                  disabled={!selectedCemetery || savingImage}
                  className="rounded-full"
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

              <div className="space-y-4 rounded-[24px] border border-border/70 bg-card/80 p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preview publik</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gambar ini akan dipakai di halaman daftar dan detail cemetery saat tersedia.
                  </p>
                </div>
                <div className="overflow-hidden rounded-[20px] border border-border/70 bg-muted/30">
                  <CemeteryImage
                    src={imageUrlInput}
                    alt={
                      selectedCemetery
                        ? `Preview gambar ${selectedCemetery.name}`
                        : 'Preview gambar cemetery'
                    }
                    className="h-64 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection
            title="Daftar Semua Cemetery"
            description="Data lengkap setiap lokasi pemakaman beserta statistik operasional."
          >
            <div className="overflow-hidden rounded-[24px] border border-border/70">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Cemetery</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Total Plot</TableHead>
                      <TableHead>Tersedia</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cemeteries.map((cemetery) => (
                      <TableRow key={cemetery.id} className="bg-white/70">
                        <TableCell className="font-medium">{cemetery.name}</TableCell>
                        <TableCell>{cemetery.location || '-'}</TableCell>
                        <TableCell>{cemetery.totalPlots ?? 0}</TableCell>
                        <TableCell>{cemetery.availablePlots ?? 0}</TableCell>
                        <TableCell>{cemetery.totalBookings ?? 0}</TableCell>
                        <TableCell>{cemetery.admins?.length ?? 0}</TableCell>
                      </TableRow>
                    ))}
                    {cemeteries.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Belum ada cemetery yang terdaftar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </PortalShell>
  );
}
