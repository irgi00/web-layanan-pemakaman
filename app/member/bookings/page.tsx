'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalShell } from '@/components/portal-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRedirectPathByRole, isAdminRole } from '@/lib/roles';
import { formatRupiah } from '@/lib/utils';
import { DashboardSection } from '@/components/dashboard-shell';

interface User {
  id: string;
  email: string;
  role: string;
}

interface BookingItem {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  cemetery: {
    name: string;
  };
  plot: {
    plotNumber: string;
    section: string;
    row: string;
  };
  payment: {
    status: string;
  } | null;
}

export default function MemberBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingsData = async () => {
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

    fetchBookingsData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const formatBookingDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-32 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
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
      title="Pemesanan Saya"
      description="Daftar seluruh riwayat pemesanan plot makam Anda."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardSection
          title="Riwayat Pemesanan"
          description="Pantau status pemesanan, tagihan, dan detail plot Anda."
        >
          {bookings.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 border-white/70 shadow-sm rounded-[24px]">
              <p className="text-muted-foreground mb-4">
                Belum ada pemesanan. Mulailah dengan menelusuri pemakaman yang tersedia.
              </p>
              <Link href="/cemeteries">
                <Button className="rounded-xl shadow-sm">
                  Jelajahi Pemakaman
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className="p-6 bg-white/80 border-white/70 shadow-sm rounded-[24px] transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-foreground">
                        {booking.cemetery.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Plot {booking.plot.plotNumber} | {booking.plot.section} | {booking.plot.row}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dibuat pada {formatBookingDate(booking.createdAt)}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-0.5 rounded-md mt-2">
                        ID: {booking.id}
                      </p>
                    </div>

                    <div className="space-y-2 text-left md:text-right">
                      <div className="inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                        {booking.status}
                      </div>
                      <div className="text-xl font-bold text-foreground block mt-2">
                        {formatRupiah(booking.totalPrice)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pembayaran: <span className="font-medium text-foreground">{booking.payment?.status || 'BELUM DIBUAT'}</span>
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
