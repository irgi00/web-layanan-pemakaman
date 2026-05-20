'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Plus } from 'lucide-react';
import { BackButton } from '@/components/back-button';
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

export default function DashboardPage() {
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dasbor</h1>
              <p className="text-muted-foreground text-sm">Kelola pemesanan dan profil Anda</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton fallbackHref="/" className="mb-8" />
        {/* Welcome Card */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Selamat datang, {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-muted-foreground mb-6">
            {user?.email}
          </p>
          <Link href="/cemeteries">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Mulai Pemesanan Baru
            </Button>
          </Link>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Pemesanan Aktif</div>
            <div className="text-3xl font-bold text-foreground">{activeBookings}</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Pemesanan</div>
            <div className="text-3xl font-bold text-foreground">{bookings.length}</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-muted-foreground text-sm font-medium mb-2">Status Akun</div>
            <div className="text-lg font-bold text-primary">Aktif</div>
          </Card>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">Pemesanan Anda</h3>
            {bookings.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <p className="text-muted-foreground mb-4">
                  Belum ada pemesanan. Mulailah dengan menelusuri pemakaman yang tersedia.
                </p>
                <Link href="/cemeteries">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Jelajahi Pemakaman
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 bg-card border-border">
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
                        <p className="text-sm text-muted-foreground">
                          Booking ID: {booking.id}
                        </p>
                      </div>

                      <div className="space-y-2 text-left md:text-right">
                        <div className="text-sm font-medium text-primary">{booking.status}</div>
                        <div className="text-xl font-bold text-foreground">
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
          </div>
        </div>
      </main>
    </div>
  );
}
