'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Building2, CircleDollarSign, MapPinned, Trees, Users } from 'lucide-react';
import {
  DashboardHero,
  DashboardAsideCard,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';

interface OverviewStats {
  totalCemeteries: number;
  totalPlots: number;
  availablePlots: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  totalCemeteryAdmins: number;
}

interface CemeteryItem {
  id: string;
  name: string;
  location: string | null;
  totalPlots?: number;
  availablePlots?: number;
  totalBookings?: number;
  totalRevenue?: number;
  admins?: Array<{ id: string }>;
}

export default function SuperadminStatisticsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [cemeteries, setCemeteries] = useState<CemeteryItem[]>([]);

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

        const [overviewRes, cemRes] = await Promise.all([
          fetch('/api/superadmin/overview'),
          fetch('/api/superadmin/cemeteries'),
        ]);

        if (!overviewRes.ok || !cemRes.ok) throw new Error('Gagal memuat statistik');

        const overviewData = await overviewRes.json();
        const cemData = await cemRes.json();

        setStats(overviewData.stats);
        setCemeteries(cemData.cemeteries || []);
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat statistik.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="border-white/70 bg-white/90 p-8">Memuat statistik...</Card>
        </div>
      </div>
    );
  }

  const occupancyRate =
    stats && stats.totalPlots > 0
      ? (((stats.totalPlots - stats.availablePlots) / stats.totalPlots) * 100).toFixed(1)
      : '0';

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Statistik & Pendapatan"
      description="Analitik performa sistem cemetery secara menyeluruh."
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
            eyebrow="Monitoring"
            title="Statistik & Performa Sistem"
            description="Ringkasan metrik utama sistem: pendapatan, tingkat hunian, distribusi booking, dan pertumbuhan pengguna di seluruh jaringan cemetery."
            aside={
              <DashboardAsideCard title="Pendapatan Global">
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatRupiah(stats?.totalRevenue ?? 0)}
                </p>
                <p className="mt-1 text-sm">
                  Dari {stats?.totalBookings ?? 0} total booking terkonfirmasi.
                </p>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Tingkat Hunian
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{occupancyRate}%</p>
                </div>
              </DashboardAsideCard>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="Pendapatan Global"
              value={formatRupiah(stats?.totalRevenue ?? 0)}
              description="Akumulasi pendapatan lintas lokasi."
              icon={CircleDollarSign}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              label="Total Booking"
              value={stats?.totalBookings ?? 0}
              description="Semua transaksi yang terekam."
              icon={MapPinned}
              accentClassName="bg-sky-500/10 text-sky-600"
            />
            <DashboardStatCard
              label="Total Pengguna"
              value={stats?.totalUsers ?? 0}
              description="User yang terdaftar di platform."
              icon={Users}
              accentClassName="bg-amber-500/10 text-amber-600"
            />
            <DashboardStatCard
              label="Total Cemetery"
              value={stats?.totalCemeteries ?? 0}
              description="Lokasi pemakaman aktif."
              icon={Building2}
              accentClassName="bg-violet-500/10 text-violet-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Plot"
              value={stats?.totalPlots ?? 0}
              description="Seluruh plot di semua cemetery."
              icon={Trees}
            />
            <DashboardStatCard
              label="Plot Tersedia"
              value={stats?.availablePlots ?? 0}
              description="Plot yang masih bisa dipesan."
              icon={Trees}
              accentClassName="bg-teal-500/10 text-teal-600"
            />
            <DashboardStatCard
              label="Cemetery Admin"
              value={stats?.totalCemeteryAdmins ?? 0}
              description="Total akun admin aktif."
              icon={BarChart3}
              accentClassName="bg-rose-500/10 text-rose-600"
            />
          </div>

          <DashboardSection
            title="Performa Per Cemetery"
            description="Perbandingan metrik utama antar lokasi pemakaman."
          >
            <div className="space-y-3">
              {cemeteries.map((cemetery) => {
                const occupancy =
                  (cemetery.totalPlots ?? 0) > 0
                    ? (
                        (((cemetery.totalPlots ?? 0) - (cemetery.availablePlots ?? 0)) /
                          (cemetery.totalPlots ?? 1)) *
                        100
                      ).toFixed(1)
                    : '0';

                return (
                  <div
                    key={cemetery.id}
                    className="rounded-[24px] border border-border/70 bg-white/70 p-5 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.8)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{cemetery.name}</p>
                        <p className="text-sm text-muted-foreground">{cemetery.location || '-'}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Plot
                          </p>
                          <p className="font-semibold text-foreground">
                            {cemetery.totalPlots ?? 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Tersedia
                          </p>
                          <p className="font-semibold text-emerald-600">
                            {cemetery.availablePlots ?? 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Booking
                          </p>
                          <p className="font-semibold text-foreground">
                            {cemetery.totalBookings ?? 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Hunian
                          </p>
                          <p className="font-semibold text-foreground">{occupancy}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Pendapatan
                          </p>
                          <p className="font-semibold text-foreground">
                            {formatRupiah(cemetery.totalRevenue ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {cemeteries.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Belum ada data cemetery untuk ditampilkan.
                </div>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>
    </PortalShell>
  );
}
