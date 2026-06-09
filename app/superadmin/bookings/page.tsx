'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookCopy, MapPinned } from 'lucide-react';
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

interface BookingItem {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  cemetery: {
    id: string;
    name: string;
    location: string | null;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plot: {
    plotNumber: string;
  };
}

export default function SuperadminBookingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

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

        const bookingsRes = await fetch('/api/admin/bookings');
        if (!bookingsRes.ok) throw new Error('Gagal memuat data booking');
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat data booking.');
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat riwayat booking...</Card>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <PortalShell
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Riwayat Booking"
      description="Pantau seluruh transaksi booking makam dari semua cemetery dan semua user."
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
            title="Riwayat Booking Global"
            description="Seluruh transaksi booking makam yang terekam dalam sistem, mencakup semua cemetery dan semua user yang terdaftar."
            aside={
              <DashboardAsideCard title="Ringkasan Booking">
                <div className="mt-3 grid gap-3">
                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Total Booking
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{bookings.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Pendapatan
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {formatRupiah(totalRevenue)}
                    </p>
                  </div>
                </div>
              </DashboardAsideCard>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Booking"
              value={bookings.length}
              description="Semua transaksi yang terekam."
              icon={BookCopy}
              accentClassName="bg-sky-500/10 text-sky-600"
            />
            <DashboardStatCard
              label="Booking Aktif"
              value={bookings.filter((b) => b.status === 'confirmed').length}
              description="Booking yang sudah dikonfirmasi."
              icon={BookCopy}
              accentClassName="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              label="Menunggu"
              value={bookings.filter((b) => b.status === 'pending').length}
              description="Booking yang menunggu konfirmasi."
              icon={BookCopy}
              accentClassName="bg-amber-500/10 text-amber-600"
            />
          </div>

          <DashboardSection
            title="Daftar Semua Booking"
            description="Riwayat lengkap booking dari seluruh user dan seluruh cemetery."
          >
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-[24px] border border-border/70 bg-white/70 p-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.8)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <MapPinned className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.cemetery.name} - Plot {booking.plot.plotNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <Badge variant="outline" className="mb-2 rounded-full px-3 py-1">
                        {booking.status}
                      </Badge>
                      <p className="text-base font-semibold text-foreground">
                        {formatRupiah(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Belum ada booking di seluruh sistem.
                </div>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>
    </PortalShell>
  );
}
