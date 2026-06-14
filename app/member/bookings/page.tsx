'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PortalShell } from '@/components/portal-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRedirectPathByRole, isAdminRole } from '@/lib/roles';
import {
  canSubmitPaymentProof,
  getBookingStatusBadgeClassName,
  getBookingStatusLabel,
  getPaymentStatusBadgeClassName,
  getPaymentStatusLabel,
} from '@/lib/payment-workflow';
import {
  getBookingPurposeLabel,
  getDeceasedFullName,
  getFuturePreparationBookingLabel,
  getFuturePreparationDescription,
} from '@/lib/booking-purpose';
import { formatRupiah } from '@/lib/utils';

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
  deceasedProfile: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    dateOfDeath: string | null;
    biography: string | null;
  } | null;
  cemetery: {
    name: string;
  };
  plot: {
    plotNumber: string;
    section: string;
    row: string;
  };
  payment: {
    id: string;
    status: string;
    proofUrl: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
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
              <Skeleton key={i} className="h-40" />
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
      description="Pantau status booking, kirim bukti pembayaran, dan lihat hasil verifikasi admin."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="rounded-[28px] border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.45)]">
          <p className="text-sm text-muted-foreground">
            Booking akan tetap berstatus menunggu sampai pembayaran Anda diverifikasi oleh Cemetery
            Admin atau Super Admin.
          </p>
        </Card>

        {bookings.length === 0 ? (
          <Card className="rounded-[24px] border-white/70 bg-white/80 p-12 text-center shadow-sm">
            <p className="mb-4 text-muted-foreground">
              Belum ada pemesanan. Mulailah dengan menelusuri pemakaman yang tersedia.
            </p>
            <Link href="/cemeteries">
              <Button className="rounded-xl shadow-sm">Jelajahi Pemakaman</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="rounded-[24px] border-white/70 bg-white/80 p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{booking.cemetery.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Plot {booking.plot.plotNumber} | {booking.plot.section} | {booking.plot.row}
                      </p>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Dibuat pada {formatBookingDate(booking.createdAt)}</p>
                      <p className="font-mono">ID: {booking.id}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Tujuan booking</p>
                      <p className="mt-1">
                        {getBookingPurposeLabel(booking.deceasedProfile)}
                      </p>
                      {booking.deceasedProfile ? (
                        <p className="mt-2">
                          Almarhum/Almarhumah:{' '}
                          <span className="font-medium text-foreground">
                            {getDeceasedFullName(booking.deceasedProfile)}
                          </span>
                        </p>
                      ) : (
                        <>
                          <p className="mt-2 font-medium text-foreground">
                            {getFuturePreparationBookingLabel()}
                          </p>
                          <p className="mt-1">
                            {getFuturePreparationDescription()}
                          </p>
                        </>
                      )}
                    </div>

                    {booking.payment?.proofUrl ? (
                      <a
                        href={booking.payment.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        <ExternalLink className="size-4" />
                        Lihat bukti pembayaran yang terkirim
                      </a>
                    ) : null}

                    {booking.payment?.rejectionReason ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        Pembayaran ditolak. Alasan admin: {booking.payment.rejectionReason}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3 text-left md:text-right">
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <div
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBookingStatusBadgeClassName(
                          booking.status
                        )}`}
                      >
                        {getBookingStatusLabel(booking.status)}
                      </div>
                      <div
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStatusBadgeClassName(
                          booking.payment?.status
                        )}`}
                      >
                        {getPaymentStatusLabel(booking.payment?.status)}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {formatRupiah(booking.totalPrice)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verifikasi pembayaran: {booking.payment?.verifiedAt ? formatBookingDate(booking.payment.verifiedAt) : 'Belum ada'}
                    </p>

                    {booking.payment ? (
                      <Link href={`/payments/${booking.payment.id}`}>
                        <Button
                          variant={canSubmitPaymentProof(booking.payment.status) ? 'default' : 'outline'}
                          className="w-full md:w-auto"
                        >
                          {canSubmitPaymentProof(booking.payment.status)
                            ? booking.payment.status === 'REJECTED'
                              ? 'Kirim Ulang Bukti'
                              : 'Kirim Bukti Pembayaran'
                            : 'Lihat Detail Pembayaran'}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
