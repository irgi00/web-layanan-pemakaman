export const VERIFIED_PAYMENT_STATUSES = new Set(['COMPLETED']);
export const REQUIRES_ADMIN_REVIEW_PAYMENT_STATUSES = new Set([
  'PENDING',
  'PENDING_VERIFICATION',
  'FAILED',
  'REJECTED',
]);

export function isPaymentVerified(status: string | null | undefined) {
  return status === 'COMPLETED';
}

export function canSubmitPaymentProof(status: string | null | undefined) {
  return status === 'PENDING' || status === 'FAILED' || status === 'REJECTED';
}

export function isAwaitingPaymentVerification(status: string | null | undefined) {
  return status === 'PENDING_VERIFICATION';
}

export function getPaymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case 'PENDING':
      return 'Belum Dibayar';
    case 'PENDING_VERIFICATION':
      return 'Menunggu Verifikasi';
    case 'COMPLETED':
      return 'Terverifikasi';
    case 'FAILED':
      return 'Gagal';
    case 'REJECTED':
      return 'Ditolak';
    case 'REFUNDED':
      return 'Dikembalikan';
    default:
      return status || 'Tidak diketahui';
  }
}

export function getBookingStatusLabel(status: string | null | undefined) {
  switch (status) {
    case 'PENDING':
      return 'Menunggu';
    case 'CONFIRMED':
      return 'Dikonfirmasi';
    case 'COMPLETED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status || 'Tidak diketahui';
  }
}

export function getPaymentStatusBadgeClassName(status: string | null | undefined) {
  switch (status) {
    case 'COMPLETED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'PENDING_VERIFICATION':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'REJECTED':
    case 'FAILED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'REFUNDED':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700';
  }
}

export function getBookingStatusBadgeClassName(status: string | null | undefined) {
  switch (status) {
    case 'COMPLETED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'CONFIRMED':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'CANCELLED':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export function normalizeStripePaymentId(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function isForbiddenStripePaymentId(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  const forbiddenValues = new Set([
    'mock',
    'test',
    'manual',
    'payment',
    'simulated',
    'simulated-payment',
  ]);

  return forbiddenValues.has(normalized);
}
