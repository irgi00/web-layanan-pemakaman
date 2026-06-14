import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSupportedImageUrl } from '@/lib/cemetery-image';
import { getCurrentUser } from '@/lib/jwt';
import { isForbiddenStripePaymentId, normalizeStripePaymentId } from '@/lib/payment-workflow';
import { prisma } from '@/lib/prisma';

const paymentSubmissionSchema = z
  .object({
    proofUrl: z.string().trim().min(1).optional(),
    paymentMethod: z.string().trim().min(1).optional(),
    paymentId: z.string().trim().optional(),
    stripePaymentId: z.string().trim().optional(),
    status: z.string().trim().optional(),
    success: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.proofUrl) {
      return;
    }

    if (!isSupportedImageUrl(data.proofUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['proofUrl'],
        message: 'Gunakan URL bukti pembayaran http(s) atau path publik yang diawali /',
      });
    }
  });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Anda belum masuk' }, { status: 401 });
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            cemetery: {
              select: {
                id: true,
                name: true,
              },
            },
            plot: {
              select: {
                id: true,
                plotNumber: true,
                section: true,
                row: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!payment || payment.booking.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Anda belum masuk' }, { status: 401 });
    }

    const { id } = await params;
    const body = paymentSubmissionSchema.parse(await request.json());

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment || payment.booking.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Pembayaran sudah diverifikasi' }, { status: 400 });
    }

    if (payment.status === 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { error: 'Pembayaran ini sedang menunggu verifikasi admin' },
        { status: 400 }
      );
    }

    const proofUrl = body.proofUrl?.trim() || null;
    const stripePaymentId = normalizeStripePaymentId(body.stripePaymentId ?? body.paymentId);
    const hasGatewayConfirmation = Boolean(body.success || body.status === 'completed');

    if (!proofUrl && !stripePaymentId && !hasGatewayConfirmation) {
      return NextResponse.json(
        { error: 'Bukti pembayaran wajib diisi sebelum dikirim ke admin' },
        { status: 400 }
      );
    }

    if (!proofUrl && hasGatewayConfirmation && !stripePaymentId) {
      return NextResponse.json(
        { error: 'Stripe payment ID wajib unik jika pembayaran berasal dari gateway' },
        { status: 400 }
      );
    }

    if (stripePaymentId) {
      if (isForbiddenStripePaymentId(stripePaymentId)) {
        return NextResponse.json(
          { error: 'Stripe payment ID dummy/static tidak diperbolehkan' },
          { status: 400 }
        );
      }

      const duplicateStripePayment = await prisma.payment.findFirst({
        where: {
          stripePaymentId,
          NOT: { id: payment.id },
        },
        select: { id: true },
      });

      if (duplicateStripePayment) {
        return NextResponse.json(
          { error: 'Stripe payment ID tersebut sudah digunakan pada pembayaran lain' },
          { status: 409 }
        );
      }
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PENDING_VERIFICATION',
        paymentMethod: body.paymentMethod?.trim() || payment.paymentMethod || 'MANUAL_TRANSFER',
        proofUrl: proofUrl ?? payment.proofUrl,
        rejectionReason: null,
        verifiedAt: null,
        verifiedById: null,
        ...(stripePaymentId ? { stripePaymentId } : {}),
      },
      include: {
        booking: {
          include: {
            cemetery: {
              select: {
                id: true,
                name: true,
              },
            },
            plot: {
              select: {
                id: true,
                plotNumber: true,
                section: true,
                row: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message:
          'Pembayaran Anda sedang menunggu verifikasi admin. Mohon tunggu hingga pembayaran dikonfirmasi.',
        payment: updatedPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi pembayaran gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Process payment error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
