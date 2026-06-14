'use client';

import { useEffect, useState } from 'react';
import { BookCopy, CheckCircle2, Clock3, ExternalLink } from 'lucide-react';
import {
  DashboardHero,
  DashboardAsideCard,
  DashboardSection,
  DashboardStatCard,
} from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  getBookingStatusBadgeClassName,
  getBookingStatusLabel,
  getPaymentStatusBadgeClassName,
  getPaymentStatusLabel,
  isPaymentVerified,
} from '@/lib/payment-workflow';
import {
  getBookingPurposeLabel,
  getDeceasedFullName,
  getFuturePreparationBookingLabel,
  getFuturePreparationDescription,
} from '@/lib/booking-purpose';
import { formatRupiah } from '@/lib/utils';

type AdminRole = 'CEMETERY_ADMIN' | 'SUPER_ADMIN';

interface BookingItem {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  completionDate: string | null;
  isProcessingStarted: boolean;
  processingStartedAt: string | null;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
  };
  cemetery: {
    id: string;
    name: string;
    location: string | null;
  };
  plot: {
    id: string;
    plotNumber: string;
    section: string;
    row: string;
  };
  deceasedProfile: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    dateOfDeath: string | null;
    biography: string | null;
  } | null;
  serviceBookings: Array<{
    id: string;
    quantity: number;
    service: {
      id: string;
      name: string;
      category: string | null;
    };
  }>;
  payment: {
    id: string;
    status: string;
    amount: number;
    proofUrl: string | null;
    rejectionReason: string | null;
    verifiedAt: string | null;
    verifiedBy: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  } | null;
}

interface AdminBookingsManagementPageProps {
  role: AdminRole;
  roleLabel: string;
  title: string;
  description: string;
  userEmail?: string | null;
  onLogout: () => void | Promise<void>;
  scopeHint: string;
}

export function AdminBookingsManagementPage({
  role,
  roleLabel,
  title,
  description,
  userEmail,
  onLogout,
  scopeHint,
}: AdminBookingsManagementPageProps) {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [completeTarget, setCompleteTarget] = useState<BookingItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal memuat daftar booking');
      }

      setBookings(Array.isArray(body.bookings) ? body.bookings : []);
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data booking.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings =
    activeFilter === 'ALL'
      ? bookings
      : bookings.filter((booking) => booking.status === activeFilter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'PENDING').length,
    confirmed: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    completed: bookings.filter((booking) => booking.status === 'COMPLETED').length,
  };

  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value))
      : '-';

  const formatProfileDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
        }).format(new Date(value))
      : '-';

  const handleBookingAction = async (
    bookingId: string,
    payload: Record<string, string>
  ) => {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || 'Gagal memperbarui booking');
    }

    return body;
  };

  const handleStartProcessing = async (booking: BookingItem) => {
    try {
      setSubmitting(true);
      const response = await handleBookingAction(booking.id, { action: 'start-processing' });
      const processingStartedAt =
        typeof response?.booking?.processingStartedAt === 'string'
          ? response.booking.processingStartedAt
          : new Date().toISOString();

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                isProcessingStarted: true,
                processingStartedAt,
              }
            : item
        )
      );
      setError(null);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Gagal memulai proses booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!completeTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await handleBookingAction(completeTarget.id, { action: 'complete' });
      setCompleteTarget(null);
      await loadBookings();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Gagal menandai booking selesai.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await handleBookingAction(cancelTarget.id, {
        action: 'cancel',
        cancellationReason,
      });
      setCancelTarget(null);
      setCancellationReason('');
      await loadBookings();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Gagal membatalkan booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const filterOptions = [
    { label: 'Semua', value: 'ALL' },
    { label: 'Menunggu', value: 'PENDING' },
    { label: 'Dikonfirmasi', value: 'CONFIRMED' },
    { label: 'Selesai', value: 'COMPLETED' },
    { label: 'Dibatalkan', value: 'CANCELLED' },
  ];

  return (
    <PortalShell
      role={role}
      roleLabel={roleLabel}
      title={title}
      description={description}
      userEmail={userEmail}
      onLogout={onLogout}
      headerSlot={
        <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          {userEmail || roleLabel}
        </Badge>
      }
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        ) : null}

        <DashboardHero
          eyebrow="Operasional Booking"
          title={role === 'SUPER_ADMIN' ? 'Semua Booking Sistem' : 'Booking Cemetery Anda'}
          description={scopeHint}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            label="Total Booking"
            value={stats.total}
            description="Semua booking pada scope halaman ini."
            icon={BookCopy}
          />
          <DashboardStatCard
            label="Dikonfirmasi"
            value={stats.confirmed}
            description="Booking dengan pembayaran yang sudah valid."
            icon={Clock3}
            accentClassName="bg-sky-500/10 text-sky-600"
          />
          <DashboardStatCard
            label="Selesai"
            value={stats.completed}
            description="Booking yang sudah selesai diproses."
            icon={CheckCircle2}
            accentClassName="bg-emerald-500/10 text-emerald-600"
          />
        </div>

        <DashboardSection
          title="Daftar Booking"
          description="Pantau status pembayaran dan lakukan aksi operasional sesuai status booking."
          action={
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={activeFilter === option.value ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          }
        >
          {loading ? (
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Memuat daftar booking...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Tidak ada booking untuk filter yang dipilih.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const paymentVerified = isPaymentVerified(booking.payment?.status);
                const processingAcknowledged = booking.isProcessingStarted;

                return (
                  <div
                    key={booking.id}
                    className="rounded-[28px] border border-border/70 bg-white/80 p-5 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.45)]"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <p>Cemetery: {booking.cemetery.name}</p>
                          <p>
                            Plot: {booking.plot.section} - {booking.plot.plotNumber} - {booking.plot.row}
                          </p>
                          <p>Dibuat: {formatDate(booking.createdAt)}</p>
                          <p>Selesai: {formatDate(booking.completionDate)}</p>
                          <p>ID booking: {booking.id}</p>
                          <p>Telepon: {booking.user.phoneNumber || '-'}</p>
                        </div>

                        {booking.serviceBookings.length > 0 ? (
                          <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                            Layanan:{" "}
                            {booking.serviceBookings
                              .map(
                                (item) =>
                                  `${item.service.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`
                              )
                              .join(', ')}
                          </div>
                        ) : null}

                        <div className="rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {getBookingPurposeLabel(booking.deceasedProfile)}
                          </p>
                          {booking.deceasedProfile ? (
                            <div className="mt-2 grid gap-1">
                              <p>
                                Nama almarhum/almarhumah:{' '}
                                <span className="font-medium text-foreground">
                                  {getDeceasedFullName(booking.deceasedProfile)}
                                </span>
                              </p>
                              <p>
                                Tanggal lahir:{' '}
                                {formatProfileDate(
                                  booking.deceasedProfile.dateOfBirth
                                )}
                              </p>
                              <p>
                                Tanggal wafat:{' '}
                                {formatProfileDate(
                                  booking.deceasedProfile.dateOfDeath
                                )}
                              </p>
                              {booking.deceasedProfile.biography ? (
                                <p className="whitespace-pre-line">
                                  Catatan: {booking.deceasedProfile.biography}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-2 grid gap-1">
                              <p className="font-medium text-foreground">
                                {getFuturePreparationBookingLabel()}
                              </p>
                              <p>{getFuturePreparationDescription()}</p>
                            </div>
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
                            Lihat bukti pembayaran
                          </a>
                        ) : null}

                        {booking.payment?.rejectionReason ? (
                          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            Alasan penolakan pembayaran: {booking.payment.rejectionReason}
                          </div>
                        ) : null}

                        {booking.payment?.verifiedBy ? (
                          <p className="text-sm text-muted-foreground">
                            Pembayaran diverifikasi oleh {booking.payment.verifiedBy.firstName}{' '}
                            {booking.payment.verifiedBy.lastName} pada{' '}
                            {formatDate(booking.payment.verifiedAt)}
                          </p>
                        ) : null}

                        {processingAcknowledged ? (
                          <p className="text-sm text-muted-foreground">
                            Proses pesanan dimulai pada {formatDate(booking.processingStartedAt)}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-3 xl:min-w-[280px] xl:text-right">
                        <div className="flex flex-wrap gap-2 xl:justify-end">
                          <Badge
                            variant="outline"
                            className={getBookingStatusBadgeClassName(booking.status)}
                          >
                            {getBookingStatusLabel(booking.status)}
                          </Badge>
                          {processingAcknowledged ? (
                            <Badge
                              variant="outline"
                              className="border-violet-200 bg-violet-50 text-violet-700"
                            >
                              Diproses
                            </Badge>
                          ) : null}
                          <Badge
                            variant="outline"
                            className={getPaymentStatusBadgeClassName(booking.payment?.status)}
                          >
                            {getPaymentStatusLabel(booking.payment?.status)}
                          </Badge>
                        </div>
                        <p className="text-2xl font-semibold text-foreground">
                          {formatRupiah(booking.totalPrice)}
                        </p>

                        {booking.status === 'PENDING' && !paymentVerified ? (
                          <div className="space-y-2">
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 xl:text-left">
                              {booking.payment?.status === 'PENDING_VERIFICATION'
                                ? 'Menunggu verifikasi pembayaran sebelum booking dapat diproses.'
                                : 'Menunggu pembayaran atau pengiriman bukti pembayaran dari member.'}
                            </div>
                            <div className="flex flex-col gap-2 xl:items-end">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 xl:w-auto"
                                onClick={() => {
                                  setCancelTarget(booking);
                                  setCancellationReason('');
                                }}
                              >
                                Batalkan Pesanan
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {booking.status === 'CONFIRMED' && paymentVerified ? (
                          <div className="space-y-2">
                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 xl:text-left">
                              {processingAcknowledged
                                ? 'Booking ini sudah ditandai sedang diproses. Status tetap Dikonfirmasi karena enum PROCESSING belum tersedia.'
                                : 'Booking siap diproses. Anda dapat menandai proses internal terlebih dahulu atau langsung menandai selesai.'}
                            </div>
                            <div className="flex flex-col gap-2 xl:items-end">
                              {!processingAcknowledged ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full xl:w-auto"
                                  disabled={submitting}
                                  onClick={() => handleStartProcessing(booking)}
                                >
                                  Proses Pesanan
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                className="w-full xl:w-auto"
                                onClick={() => setCompleteTarget(booking)}
                              >
                                Tandai Selesai
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 xl:w-auto"
                                onClick={() => {
                                  setCancelTarget(booking);
                                  setCancellationReason('');
                                }}
                              >
                                Batalkan Pesanan
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardSection>
      </div>

      <AlertDialog open={Boolean(completeTarget)} onOpenChange={(open) => !open && setCompleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tandai booking ini selesai?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini akan mengubah status booking menjadi selesai dan plot akan ditandai
              terisi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={handleComplete}>
              {submitting ? 'Memproses...' : 'Ya, tandai selesai'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setCancelTarget(null);
            setCancellationReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Batalkan booking</DialogTitle>
            <DialogDescription>
              Masukkan alasan pembatalan agar perubahan ini tercatat dengan jelas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
            placeholder="Contoh: data pemesanan tidak valid atau ada konflik operasional."
            rows={5}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setCancelTarget(null);
                setCancellationReason('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={submitting || cancellationReason.trim().length < 3}
              onClick={handleCancel}
            >
              {submitting ? 'Memproses...' : 'Batalkan booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
