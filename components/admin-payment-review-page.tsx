'use client';

import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, ShieldCheck, XCircle } from 'lucide-react';
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
} from '@/lib/payment-workflow';
import { formatRupiah } from '@/lib/utils';

type AdminRole = 'CEMETERY_ADMIN' | 'SUPER_ADMIN';
type PaymentSortOrder = 'oldest' | 'newest';

interface PaymentItem {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  proofUrl: string | null;
  paymentSubmittedAt: string | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  updatedAt: string;
  createdAt: string;
  booking: {
    id: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
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
  };
  verifiedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface AdminPaymentReviewPageProps {
  role: AdminRole;
  roleLabel: string;
  title: string;
  description: string;
  userEmail?: string | null;
  onLogout: () => void | Promise<void>;
  scopeHint: string;
}

export function AdminPaymentReviewPage({
  role,
  roleLabel,
  title,
  description,
  userEmail,
  onLogout,
  scopeHint,
}: AdminPaymentReviewPageProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<PaymentSortOrder>('oldest');
  const [approveTarget, setApproveTarget] = useState<PaymentItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PaymentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({ sort: sortOrder });
      const response = await fetch(`/api/admin/payments?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal memuat daftar pembayaran');
      }

      setPayments(Array.isArray(body.payments) ? body.payments : []);
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data pembayaran.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [sortOrder]);

  const filteredPayments =
    activeFilter === 'ALL'
      ? payments
      : payments.filter((payment) => payment.status === activeFilter);

  const stats = {
    total: payments.length,
    pendingVerification: payments.filter((payment) => payment.status === 'PENDING_VERIFICATION')
      .length,
    completed: payments.filter((payment) => payment.status === 'COMPLETED').length,
    rejected: payments.filter((payment) => payment.status === 'REJECTED').length,
  };

  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/payments/${approveTarget.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal menyetujui pembayaran');
      }

      setApproveTarget(null);
      await loadPayments();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyetujui pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/payments/${rejectTarget.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal menolak pembayaran');
      }

      setRejectTarget(null);
      setRejectionReason('');
      await loadPayments();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Gagal menolak pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value))
      : '-';

  const filterOptions = [
    { label: 'Semua', value: 'ALL' },
    { label: 'Menunggu Verifikasi', value: 'PENDING_VERIFICATION' },
    { label: 'Terverifikasi', value: 'COMPLETED' },
    { label: 'Ditolak', value: 'REJECTED' },
  ];

  const sortLabel =
    sortOrder === 'newest'
      ? 'Pembayaran terbaru tampil lebih dulu.'
      : 'Pembayaran terlama tampil lebih dulu.';

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
          eyebrow="Verifikasi Pembayaran"
          title={role === 'SUPER_ADMIN' ? 'Semua Pembayaran Masuk' : 'Pembayaran Lokasi Anda'}
          description={scopeHint}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            label="Total Pembayaran"
            value={stats.total}
            description="Seluruh data pembayaran dalam scope halaman ini."
            icon={CreditCard}
          />
          <DashboardStatCard
            label="Menunggu Review"
            value={stats.pendingVerification}
            description="Bukti pembayaran yang perlu ditinjau admin."
            icon={ShieldCheck}
            accentClassName="bg-amber-500/10 text-amber-600"
          />
          <DashboardStatCard
            label="Ditolak"
            value={stats.rejected}
            description="Pembayaran yang perlu dikirim ulang oleh member."
            icon={XCircle}
            accentClassName="bg-rose-500/10 text-rose-600"
          />
        </div>

        <DashboardSection
          title="Daftar Pembayaran"
          description={`Periksa bukti pembayaran, status booking, dan lakukan aksi verifikasi sesuai kebutuhan. ${sortLabel}`}
          actionPlacement="below"
          action={
            <div className="space-y-3">
              <label className="flex w-full max-w-xs flex-col gap-2 text-sm text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                  Urutkan
                </span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as PaymentSortOrder)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary"
                >
                  <option value="oldest">Terlama</option>
                  <option value="newest">Terbaru</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={activeFilter === option.value ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setActiveFilter(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          }
        >
          {loading ? (
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Memuat daftar pembayaran...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Tidak ada pembayaran untuk filter yang dipilih.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-[28px] border border-border/70 bg-white/80 p-5 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-4">
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {payment.booking.user.firstName} {payment.booking.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.booking.user.email}</p>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p>Cemetery: {payment.booking.cemetery.name}</p>
                        <p>
                          Plot: {payment.booking.plot.section} - {payment.booking.plot.plotNumber} -{' '}
                          {payment.booking.plot.row}
                        </p>
                        <p>Dikirim pada: {formatDate(payment.paymentSubmittedAt ?? payment.createdAt)}</p>
                        <p>Dibuat: {formatDate(payment.booking.createdAt)}</p>
                        <p>Metode: {payment.paymentMethod || 'Belum diisi'}</p>
                        <p>ID booking: {payment.booking.id}</p>
                        <p>ID payment: {payment.id}</p>
                      </div>

                      {payment.proofUrl ? (
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <ExternalLink className="size-4" />
                          Lihat bukti pembayaran
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Belum ada URL bukti pembayaran.
                        </p>
                      )}

                      {payment.rejectionReason ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          Alasan penolakan: {payment.rejectionReason}
                        </div>
                      ) : null}

                      {payment.verifiedBy ? (
                        <p className="text-sm text-muted-foreground">
                          Diverifikasi oleh {payment.verifiedBy.firstName} {payment.verifiedBy.lastName}{' '}
                          pada {formatDate(payment.verifiedAt)}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3 xl:min-w-[250px] xl:text-right">
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Badge
                          variant="outline"
                          className={getPaymentStatusBadgeClassName(payment.status)}
                        >
                          {getPaymentStatusLabel(payment.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getBookingStatusBadgeClassName(payment.booking.status)}
                        >
                          {getBookingStatusLabel(payment.booking.status)}
                        </Badge>
                      </div>
                      <p className="text-2xl font-semibold text-foreground">
                        {formatRupiah(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Update terakhir {formatDate(payment.updatedAt)}
                      </p>

                      {payment.status === 'PENDING_VERIFICATION' ? (
                        <div className="flex flex-col gap-2 xl:items-end">
                          <Button
                            type="button"
                            className="w-full xl:w-auto"
                            onClick={() => setApproveTarget(payment)}
                          >
                            Setujui Pembayaran
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 xl:w-auto"
                            onClick={() => {
                              setRejectTarget(payment);
                              setRejectionReason(payment.rejectionReason || '');
                            }}
                          >
                            Tolak Pembayaran
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      <AlertDialog open={Boolean(approveTarget)} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui pembayaran ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pembayaran yang disetujui akan mengubah status pembayaran menjadi terverifikasi dan
              booking menjadi dikonfirmasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={handleApprove}>
              {submitting ? 'Memproses...' : 'Ya, setujui'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setRejectTarget(null);
            setRejectionReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tolak pembayaran</DialogTitle>
            <DialogDescription>
              Masukkan alasan penolakan agar member dapat memperbaiki bukti pembayaran.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Contoh: Bukti transfer kurang jelas atau nominal tidak sesuai."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={submitting || rejectionReason.trim().length < 3}
              className="bg-rose-600 hover:bg-rose-700"
              onClick={handleReject}
            >
              {submitting ? 'Memproses...' : 'Tolak pembayaran'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
