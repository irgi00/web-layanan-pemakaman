'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import {
  DashboardAsideCard,
  DashboardHero,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRedirectPathByRole, isAdminRole } from '@/lib/roles';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface BookingStats {
  active: number;
  total: number;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<BookingStats>({ active: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/bookings'),
        ]);

        if (!userResponse.ok) {
          router.push('/login');
          return;
        }

        const userData = await userResponse.json();

        if (isAdminRole(userData.role)) {
          router.push(getRedirectPathByRole(userData.role));
          return;
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const bookings = Array.isArray(bookingsData.bookings) ? bookingsData.bookings : [];
          const active = bookings.filter((b: { status: string }) =>
            ['PENDING', 'CONFIRMED'].includes(b.status)
          ).length;
          setStats({ active, total: bookings.length });
        }

        setUser(userData);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-32 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="MEMBER"
      roleLabel="Member"
      title="Dashboard Member"
      description="Ringkasan akun dan aktivitas pemesanan makam Anda."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHero
          eyebrow="Akun Member"
          title={`Selamat datang, ${user?.firstName} ${user?.lastName}`}
          description="Pantau status pemesanan Anda, mulai pemesanan baru, atau tinjau riwayat transaksi langsung dari sini."
          action={
            <Link href="/cemeteries">
              <Button className="h-11 rounded-xl px-5 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Mulai Pemesanan Baru
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            label="Pemesanan Aktif"
            value={stats.active}
            description="Booking dengan status pending atau confirmed."
            icon={CalendarClock}
          />
          <DashboardStatCard
            label="Total Pemesanan"
            value={stats.total}
            description="Seluruh riwayat pemesanan pada akun Anda."
            icon={CreditCard}
            accentClassName="bg-sky-500/10 text-sky-600"
          />
          <DashboardStatCard
            label="Status Akun"
            value="Aktif"
            description="Akun siap dipakai untuk pemesanan baru."
            icon={ShieldCheck}
            accentClassName="bg-amber-500/10 text-amber-600"
          />
        </div>

        
      </div>
    </PortalShell>
  );
}
