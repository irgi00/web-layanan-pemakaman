'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinned } from 'lucide-react';
import { DashboardSection } from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Badge } from '@/components/ui/badge';
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

interface BookingItem {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  plot: {
    plotNumber: string;
    section: string;
    row: string;
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

export default function AdminBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    const bookingsResponse = await fetch('/api/admin/bookings', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const bookingsBody = await readResponseBody(bookingsResponse);

    if (!bookingsResponse.ok) {
      console.error('Admin bookings request failed', {
        endpoint: '/api/admin/bookings',
        status: bookingsResponse.status,
        statusText: bookingsResponse.statusText,
        error: bookingsBody,
      });
      setError(
        `Data booking gagal dimuat (${bookingsResponse.status}): ${getErrorMessageFromBody(
          bookingsBody,
          'Terjadi kesalahan pada endpoint booking.'
        )}`
      );
      setBookings([]);
    } else {
      setBookings(
        (((bookingsBody as { bookings?: BookingItem[] } | null)?.bookings || []) as BookingItem[])
      );
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
          router.push('/superadmin/bookings');
          return;
        }

        if (me.role !== 'CEMETERY_ADMIN') {
          router.push('/login');
          return;
        }

        setUser(me);
        await loadBookings();
      } catch (loadError) {
        console.error('Admin bookings bootstrap error', loadError);
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat data booking...</Card>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="CEMETERY_ADMIN"
      roleLabel="Cemetery Admin"
      title="Daftar Booking"
      description="Kelola dan lihat daftar pemesanan pada cemetery Anda."
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
          title="Daftar Booking"
          description="Booking yang masuk pada cemetery yang Anda kelola."
        >
          <div className="space-y-4">
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
                      Plot {booking.plot.plotNumber} - {booking.plot.section} - {booking.plot.row}
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
                Belum ada booking pada cemetery ini.
              </div>
            )}
          </div>
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
