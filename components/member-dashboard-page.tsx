'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarClock,
  CreditCard,
  MapPinned,
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
import { formatRupiah } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface BookingItem {
  id: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
  cemetery: {
    id: string;
    name: string;
    city: string | null;
    province: string | null;
  };
  plot: {
    id: string;
    plotNumber: string;
    section: string;
    row: string;
    status: string;
  };
  payment: {
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    amount: number;
    createdAt: string;
  } | null;
}

export function MemberDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
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

        if (!bookingsResponse.ok) {
          throw new Error('Gagal memuat data booking');
        }

        const bookingsData = await bookingsResponse.json();

        setUser(userData);
        setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
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
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeBookings = bookings.filter((booking) =>
    ['PENDING', 'CONFIRMED'].includes(booking.status)
  ).length;

  const formatBookingDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <PortalShell
      role="MEMBER"
      roleLabel="Member"
      title="Dashboard Member"
      description="Kelola pemesanan makam, status pembayaran, dan aktivitas akun Anda."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHero
          eyebrow="Akun Member"
          title={`Selamat datang, ${user?.firstName} ${user?.lastName}`}
          description="Pantau seluruh pemesanan Anda dalam satu tempat, mulai dari status booking hingga progres pembayaran terbaru."
          action={
            <Link href="/cemeteries">
              <Button className="h-11 rounded-xl px-5 shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Mulai Pemesanan Baru
              </Button>
            </Link>
          }
          aside={
            <DashboardAsideCard title="Ringkasan Akun">
              <p className="font-medium text-foreground">{user?.email}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Booking aktif
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{activeBookings}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Total transaksi
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{bookings.length}</p>
                </div>
              </div>
            </DashboardAsideCard>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            label="Pemesanan Aktif"
            value={activeBookings}
            description="Booking dengan status pending atau confirmed."
            icon={CalendarClock}
          />
          <DashboardStatCard
            label="Total Pemesanan"
            value={bookings.length}
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

        <DashboardSection
          title="Pemesanan Anda"
          description="Riwayat transaksi makam yang sedang berjalan maupun yang sudah selesai."
        >
          {bookings.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border/80 bg-muted/30 px-6 py-14 text-center">
              <p className="mb-4 text-muted-foreground">
                Belum ada pemesanan. Mulailah dengan menelusuri pemakaman yang tersedia.
              </p>
              <Link href="/cemeteries">
                <Button className="rounded-xl px-5">Jelajahi Pemakaman</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="gap-0 rounded-[28px] border-white/70 bg-white/80 py-0 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <MapPinned className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-semibold text-foreground">
                            {booking.cemetery.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Plot {booking.plot.plotNumber} - {booking.plot.section} -{' '}
                            {booking.plot.row}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        <p>Dibuat pada {formatBookingDate(booking.createdAt)}</p>
                        <p>Booking ID: {booking.id}</p>
                      </div>
                    </div>

                    <div className="space-y-3 md:text-right">
                      <div className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary">
                        {booking.status}
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {formatRupiah(booking.totalPrice)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pembayaran: {booking.payment?.status || 'BELUM DIBUAT'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
