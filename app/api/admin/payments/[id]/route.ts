import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canAccessCemetery, getAdminActor } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

const reviewPaymentSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('approve'),
  }),
  z.object({
    action: z.literal('reject'),
    rejectionReason: z.string().trim().min(3, 'Alasan penolakan wajib diisi'),
  }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = reviewPaymentSchema.parse(await request.json());

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            cemetery: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Data pembayaran tidak ditemukan' }, { status: 404 });
    }

    if (!canAccessCemetery(admin, payment.booking.cemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (payment.booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking yang sudah dibatalkan tidak dapat divalidasi pembayarannya' },
        { status: 400 }
      );
    }

    if (body.action === 'approve') {
      if (payment.status !== 'PENDING_VERIFICATION') {
        return NextResponse.json(
          { error: 'Hanya pembayaran yang menunggu verifikasi yang dapat disetujui' },
          { status: 400 }
        );
      }

      const reviewedAt = new Date();

      const result = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: payment.paidAt ?? reviewedAt,
            verifiedAt: reviewedAt,
            verifiedById: admin.id,
            rejectionReason: null,
          },
          include: {
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

        const updatedBooking =
          payment.booking.status === 'CONFIRMED'
            ? payment.booking
            : await tx.booking.update({
                where: { id: payment.bookingId },
                data: { status: 'CONFIRMED' },
              });

        await tx.notification.create({
          data: {
            userId: payment.booking.userId,
            type: 'PAYMENT_RECEIVED',
            title: 'Pembayaran Berhasil Diverifikasi',
            message: 'Pembayaran Anda telah diverifikasi. Booking telah dikonfirmasi.',
            relatedBookingId: payment.bookingId,
          },
        });

        await tx.auditLog.createMany({
          data: [
            {
              userId: admin.id,
              entityType: 'Payment',
              entityId: payment.id,
              action: 'PAYMENT_VERIFIED',
              changes: {
                from: payment.status,
                to: 'COMPLETED',
              },
              cemeteryId: payment.booking.cemeteryId,
              bookingId: payment.bookingId,
            },
            {
              userId: admin.id,
              entityType: 'Booking',
              entityId: payment.bookingId,
              action: 'BOOKING_CONFIRMED_BY_PAYMENT',
              changes: {
                from: payment.booking.status,
                to: 'CONFIRMED',
              },
              cemeteryId: payment.booking.cemeteryId,
              bookingId: payment.bookingId,
            },
          ],
        });

        return {
          payment: updatedPayment,
          booking: updatedBooking,
        };
      });

      return NextResponse.json(
        {
          message: 'Pembayaran berhasil diverifikasi dan booking dikonfirmasi.',
          payment: result.payment,
          booking: result.booking,
        },
        { status: 200 }
      );
    }

    if (payment.status !== 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { error: 'Hanya pembayaran yang menunggu verifikasi yang dapat ditolak' },
        { status: 400 }
      );
    }

    const rejectionReason = body.rejectionReason.trim();

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          rejectionReason,
          verifiedAt: null,
          verifiedById: null,
          paidAt: null,
        },
      });

      const updatedBooking =
        payment.booking.status === 'PENDING'
          ? payment.booking
          : await tx.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'PENDING' },
            });

      await tx.notification.create({
        data: {
          userId: payment.booking.userId,
          type: 'SERVICE_UPDATE',
          title: 'Pembayaran Ditolak',
          message:
            'Pembayaran Anda belum dapat diverifikasi. Silakan periksa alasan penolakan dan kirim ulang bukti pembayaran.',
          relatedBookingId: payment.bookingId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: admin.id,
          entityType: 'Payment',
          entityId: payment.id,
          action: 'PAYMENT_REJECTED',
          changes: {
            from: payment.status,
            to: 'REJECTED',
            rejectionReason,
          },
          cemeteryId: payment.booking.cemeteryId,
          bookingId: payment.bookingId,
        },
      });

      return {
        payment: updatedPayment,
        booking: updatedBooking,
      };
    });

    return NextResponse.json(
      {
        message: 'Pembayaran ditolak dan booking dikembalikan ke status menunggu.',
        payment: result.payment,
        booking: result.booking,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi aksi pembayaran gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Review payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
