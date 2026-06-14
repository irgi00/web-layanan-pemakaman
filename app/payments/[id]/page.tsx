'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink, Loader2 } from 'lucide-react';
import { BackButton } from '@/components/back-button';
import { CloudinaryUpload } from '@/components/cloudinary-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  canSubmitPaymentProof,
  getBookingStatusBadgeClassName,
  getBookingStatusLabel,
  getPaymentStatusBadgeClassName,
  getPaymentStatusLabel,
  isAwaitingPaymentVerification,
} from '@/lib/payment-workflow';
import { isSupportedImageUrl } from '@/lib/cemetery-image';
import { formatRupiah } from '@/lib/utils';

interface PaymentDetail {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  proofUrl: string | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  booking: {
    id: string;
    status: string;
    cemetery: {
      id: string;
      name: string;
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

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${id}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal memuat pembayaran');
      }

      setPayment(body);
      setProofUrl(body.proofUrl || '');
      setPaymentMethod(body.paymentMethod || 'Transfer Bank');
      setError(null);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat pembayaran.');
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  const handleSubmitProof = async () => {
    const trimmedProofUrl = proofUrl.trim();

    if (!trimmedProofUrl) {
      setError('Bukti pembayaran wajib diisi sebelum dikirim ke admin.');
      return;
    }

    if (!isSupportedImageUrl(trimmedProofUrl)) {
      setError('Gunakan URL bukti pembayaran http(s) atau path publik yang diawali /.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/payments/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proofUrl: trimmedProofUrl,
          paymentMethod,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || 'Gagal mengirim bukti pembayaran');
      }

      setMessage(body.message || 'Bukti pembayaran berhasil dikirim.');
      setPayment(body.payment);
      setProofUrl(body.payment?.proofUrl || trimmedProofUrl);
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error ? submitError.message : 'Gagal mengirim bukti pembayaran.'
      );
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

  if (loading) {
    return <p className="p-6">Memuat data pembayaran...</p>;
  }

  if (!payment) {
    return <p className="p-6">Data pembayaran tidak ditemukan.</p>;
  }

  const showProofForm = canSubmitPaymentProof(payment.status);
  const showAwaitingVerificationActions = isAwaitingPaymentVerification(payment.status);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {error ? (
          <Card className="border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        ) : null}

        {message ? (
          <Card className="border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </Card>
        ) : null}

        <Card className="rounded-[28px] border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Pembayaran Booking</h1>
              <p className="text-sm text-muted-foreground">
                Upload bukti pembayaran dari perangkat Anda atau tempel URL manual agar admin dapat memverifikasi pesanan.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Badge variant="outline" className={getPaymentStatusBadgeClassName(payment.status)}>
                {getPaymentStatusLabel(payment.status)}
              </Badge>
              <Badge
                variant="outline"
                className={getBookingStatusBadgeClassName(payment.booking.status)}
              >
                {getBookingStatusLabel(payment.booking.status)}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <p>Cemetery: {payment.booking.cemetery.name}</p>
            <p>
              Plot: {payment.booking.plot.section} - {payment.booking.plot.plotNumber} -{' '}
              {payment.booking.plot.row}
            </p>
            <p>ID booking: {payment.booking.id}</p>
            <p>ID pembayaran: {payment.id}</p>
            <p>Metode: {payment.paymentMethod || '-'}</p>
            <p>Terverifikasi pada: {formatDate(payment.verifiedAt)}</p>
          </div>

          <div className="mt-6 rounded-3xl border border-primary/15 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Total pembayaran</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatRupiah(payment.amount)}</p>
          </div>

          {payment.proofUrl ? (
            <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Bukti pembayaran saat ini</p>
              <a
                href={payment.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-4" />
                Buka bukti pembayaran
              </a>
            </div>
          ) : null}

          {payment.rejectionReason ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Pembayaran sebelumnya ditolak. Alasan admin: {payment.rejectionReason}
            </div>
          ) : null}

          {showAwaitingVerificationActions ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Pembayaran Anda sedang menunggu verifikasi admin. Mohon tunggu hingga pembayaran
              dikonfirmasi.
            </div>
          ) : null}

          {showAwaitingVerificationActions ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
              <p className="text-sm leading-6 text-emerald-800">
                Bukti pembayaran Anda telah dikirim dan sedang menunggu verifikasi admin. Anda
                dapat kembali ke dashboard untuk memantau status booking.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href="/member/dashboard">Kembali ke Dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-emerald-200 bg-white/90 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Link href="/member/bookings">Lihat Riwayat Booking</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {payment.status === 'COMPLETED' && payment.verifiedBy ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Pembayaran telah diverifikasi oleh {payment.verifiedBy.firstName}{' '}
              {payment.verifiedBy.lastName}. Booking Anda sudah siap diproses admin.
            </div>
          ) : null}

          {showProofForm ? (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="payment-method">
                  Metode pembayaran
                </label>
                <Input
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  placeholder="Contoh: Transfer Bank"
                />
              </div>

              <div className="space-y-2">
                <CloudinaryUpload
                  value={proofUrl}
                  onChange={setProofUrl}
                  previewAlt="Preview bukti pembayaran"
                  inputLabel="URL/path bukti pembayaran"
                  inputPlaceholder="https://res.cloudinary.com/... atau /uploads/bukti-transfer.jpg"
                  helperText="Sistem hanya menyimpan URL/path bukti pembayaran, bukan file gambar langsung."
                  emptyStateTitle="Belum ada bukti pembayaran"
                  emptyStateDescription="Upload gambar transfer dari perangkat lokal Anda. Jika upload gagal, Anda masih bisa mengisi URL manual."
                  clearButtonText="Hapus Bukti"
                />
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={submitting || proofUrl.trim().length === 0}
                onClick={handleSubmitProof}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Mengirim bukti pembayaran...
                  </>
                ) : payment.status === 'REJECTED' ? (
                  'Kirim Ulang Bukti Pembayaran'
                ) : (
                  'Kirim Bukti Pembayaran'
                )}
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
