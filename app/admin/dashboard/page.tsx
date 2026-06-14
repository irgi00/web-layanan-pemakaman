'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CircleDollarSign,
  Layers3,
  Trees,
} from 'lucide-react';
import {
  DashboardAsideCard,
  DashboardHero,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Card } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';

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

function getOverviewEndpointByRole(role: string | null | undefined) {
  return role === 'SUPER_ADMIN' ? '/api/superadmin/overview' : '/api/admin/overview';
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (role: string) => {
    const overviewEndpoint = getOverviewEndpointByRole(role);
    const overviewResponse = await fetch(overviewEndpoint, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const overviewBody = await readResponseBody(overviewResponse);

    if (!overviewResponse.ok) {
      console.error('Admin dashboard overview request failed', {
        endpoint: overviewEndpoint,
        status: overviewResponse.status,
        statusText: overviewResponse.statusText,
        error: overviewBody,
      });
      setError(
        `Overview admin gagal dimuat (${overviewResponse.status}): ${getErrorMessageFromBody(
          overviewBody,
          'Terjadi kesalahan pada endpoint overview.'
        )}`
      );
      setOverview(null);
    } else {
      console.log('Admin dashboard overview request succeeded', {
        endpoint: overviewEndpoint,
        status: overviewResponse.status,
      });
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
        await loadDashboard(me.role);
      } catch (loadError) {
        console.error('Admin dashboard bootstrap error', loadError);
        setError('Terjadi kesalahan saat memuat dashboard.');
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat dashboard admin...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="CEMETERY_ADMIN"
      roleLabel="Cemetery Admin"
      title="Dashboard Cemetery Admin"
      description="Ringkasan dan performa cemetery yang Anda kelola."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        <div className="space-y-8">
          <DashboardHero
            eyebrow="Operasional Lokasi"
            title={overview?.cemetery?.name || 'Cemetery belum ditugaskan'}
            description={
              overview?.cemetery?.location ||
              [overview?.cemetery?.city, overview?.cemetery?.province]
                .filter(Boolean)
                .join(', ') ||
              'Belum ada informasi lokasi yang tersedia untuk akun admin ini.'
            }
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="Plot Tersedia"
              value={overview?.stats.availablePlots ?? 0}
              description="Unit yang siap dipesan saat ini."
              icon={Trees}
            />
            <DashboardStatCard
              label="Total Plot"
              value={overview?.stats.totalPlots ?? 0}
              description="Seluruh plot yang tercatat pada lokasi."
              icon={Layers3}
              accentClassName="bg-sky-500/10 text-sky-600"
            />
            <DashboardStatCard
              label="Jumlah Booking"
              value={overview?.stats.totalBookings ?? 0}
              description="Akumulasi transaksi yang masuk."
              icon={Activity}
              accentClassName="bg-amber-500/10 text-amber-600"
            />
            <DashboardStatCard
              label="Pendapatan Lokasi"
              value={formatRupiah(overview?.stats.totalRevenue ?? 0)}
              description="Total omzet berdasarkan booking tercatat."
              icon={CircleDollarSign}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
