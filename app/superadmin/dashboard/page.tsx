'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  BookCopy,
  Building2,
  CircleDollarSign,
  MapPinned,
  ShieldPlus,
  Trees,
  Users,
} from 'lucide-react';
import {
  DashboardAsideCard,
  DashboardHero,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface OverviewStats {
  totalCemeteries: number;
  totalPlots: number;
  availablePlots: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  totalCemeteryAdmins: number;
}

const quickNavItems = [
  {
    href: '/superadmin/cemeteries',
    label: 'Semua Cemetery',
    description: 'Lihat daftar & detail seluruh lokasi pemakaman.',
    icon: Building2,
    accent: 'bg-violet-500/10 text-violet-600',
  },
  {
    href: '/superadmin/plots',
    label: 'Kelola Plot',
    description: 'Tambah, ubah status, atau hapus plot per cemetery.',
    icon: Trees,
    accent: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    href: '/superadmin/admins',
    label: 'Kelola Admin',
    description: 'Buat akun cemetery admin dan tugaskan ke lokasi.',
    icon: ShieldPlus,
    accent: 'bg-rose-500/10 text-rose-600',
  },
  {
    href: '/superadmin/bookings',
    label: 'Riwayat Booking',
    description: 'Pantau seluruh transaksi booking dari semua user.',
    icon: BookCopy,
    accent: 'bg-sky-500/10 text-sky-600',
  },
  {
    href: '/superadmin/statistics',
    label: 'Statistik',
    description: 'Analitik pendapatan & performa per cemetery.',
    icon: BarChart3,
    accent: 'bg-amber-500/10 text-amber-600',
  },
];

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OverviewStats | null>(null);

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

        setUser(me);

        const overviewResponse = await fetch('/api/superadmin/overview');
        if (!overviewResponse.ok) throw new Error('Gagal memuat overview');
        const overviewData = await overviewResponse.json();
        setStats(overviewData.stats);
      } catch (loadError) {
        console.error(loadError);
        setError('Terjadi kesalahan saat memuat dashboard super admin.');
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat dashboard super admin...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Dashboard Super Admin"
      description="Pantau seluruh cemetery, booking, plot, dan akun admin dari satu pusat kontrol."
      userEmail={user?.email}
      onLogout={handleLogout}
      headerSlot={
        <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          {user?.email}
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
          {/* Hero */}
          <DashboardHero
            eyebrow="Control Center"
            title="Pemantauan jaringan cemetery secara menyeluruh"
            description="Dashboard ini memusatkan ringkasan operasional lintas lokasi. Gunakan menu di sidebar untuk mengakses pengelolaan cemetery, plot, admin, booking, dan statistik."
          />

          {/* Primary stat cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="Total Plot"
              value={stats?.totalPlots ?? 0}
              description="Akumulasi seluruh plot pada semua cemetery."
              icon={Trees}
            />
            <DashboardStatCard
              label="Jumlah Booking"
              value={stats?.totalBookings ?? 0}
              description="Total transaksi yang terekam sistem."
              icon={MapPinned}
              accentClassName="bg-sky-500/10 text-sky-600"
            />
            <DashboardStatCard
              label="Jumlah User"
              value={stats?.totalUsers ?? 0}
              description="Pengguna yang terdaftar pada platform."
              icon={Users}
              accentClassName="bg-amber-500/10 text-amber-600"
            />
            <DashboardStatCard
              label="Pendapatan Global"
              value={formatRupiah(stats?.totalRevenue ?? 0)}
              description="Pendapatan terakumulasi lintas lokasi."
              icon={CircleDollarSign}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
          </div>

          {/* Secondary stat cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Cemetery"
              value={stats?.totalCemeteries ?? 0}
              description="Lokasi pemakaman yang terdaftar."
              icon={Building2}
              accentClassName="bg-violet-500/10 text-violet-600"
            />
            <DashboardStatCard
              label="Plot Tersedia"
              value={stats?.availablePlots ?? 0}
              description="Sisa plot yang masih dapat dipesan."
              icon={Trees}
              accentClassName="bg-teal-500/10 text-teal-600"
            />
            <DashboardStatCard
              label="Jumlah Cemetery Admin"
              value={stats?.totalCemeteryAdmins ?? 0}
              description="Total akun admin yang sedang aktif."
              icon={ShieldPlus}
              accentClassName="bg-rose-500/10 text-rose-600"
            />
          </div>

         
        </div>
      </div>
    </PortalShell>
  );
}
