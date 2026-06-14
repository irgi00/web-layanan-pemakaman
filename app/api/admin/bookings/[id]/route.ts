import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canAccessCemetery, getAdminActor } from '@/lib/admin';
import { isPaymentVerified } from '@/lib/payment-workflow';
import { prisma } from '@/lib/prisma';

const bookingActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('start-processing'),
  }),
  z.object({
    action: z.literal('complete'),
  }),
  z.object({
    action: z.literal('cancel'),
    cancellationReason: z.string().trim().min(3, 'Alasan pembatalan wajib diisi'),
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
    const body = bookingActionSchema.parse(await request.json());

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
        plot: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Data booking tidak ditemukan' }, { status: 404 });
    }

    if (!canAccessCemetery(admin, booking.cemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (body.action === 'start-processing') {
      if (!booking.payment || !isPaymentVerified(booking.payment.status)) {
        return NextResponse.json(
          { error: 'Booking ini belum bisa diproses karena pembayaran belum diverifikasi' },
          { status: 400 }
        );
      }

      if (booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { error: 'Hanya booking terkonfirmasi yang bisa mulai diproses' },
          { status: 400 }
        );
      }

      const existingProcessLog = await prisma.auditLog.findFirst({
        where: {
          bookingId: booking.id,
          entityType: 'Booking',
          entityId: booking.id,
          action: 'BOOKING_PROCESS_STARTED',
        },
        orderBy: { createdAt: 'desc' },
      });

      const processLog =
        existingProcessLog ||
        (await prisma.auditLog.create({
          data: {
            userId: admin.id,
            entityType: 'Booking',
            entityId: booking.id,
            action: 'BOOKING_PROCESS_STARTED',
            changes: {
              status: booking.status,
              note: 'Booking siap diproses. Status tetap CONFIRMED karena enum PROCESSING belum tersedia.',
            },
            cemeteryId: booking.cemeteryId,
            bookingId: booking.id,
          },
        }));

      return NextResponse.json(
        {
          message:
            'Booking siap diproses. Status tetap Dikonfirmasi karena enum PROCESSING belum tersedia di project ini.',
          booking: {
            id: booking.id,
            isProcessingStarted: true,
            processingStartedAt: processLog.createdAt,
          },
        },
        { status: 200 }
      );
    }

    if (body.action === 'complete') {
      if (!booking.payment || !isPaymentVerified(booking.payment.status)) {
        return NextResponse.json(
          { error: 'Booking ini belum bisa ditandai selesai karena pembayaran belum diverifikasi' },
          { status: 400 }
        );
      }

      if (booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { error: 'Hanya booking terkonfirmasi yang dapat ditandai selesai' },
          { status: 400 }
        );
      }

      const completedAt = new Date();

      const updatedBooking = await prisma.$transaction(async (tx) => {
        const nextBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'COMPLETED',
            completionDate: completedAt,
          },
        });

        await tx.plot.update({
          where: { id: booking.plotId },
          data: { status: 'occupied' },
        });

        await tx.notification.create({
          data: {
            userId: booking.userId,
            type: 'SERVICE_UPDATE',
            title: 'Pesanan Selesai',
            message: 'Layanan pemakaman Anda telah selesai diproses.',
            relatedBookingId: booking.id,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: admin.id,
            entityType: 'Booking',
            entityId: booking.id,
            action: 'BOOKING_COMPLETED',
            changes: {
              from: booking.status,
              to: 'COMPLETED',
            },
            cemeteryId: booking.cemeteryId,
            bookingId: booking.id,
            plotId: booking.plotId,
          },
        });

        return nextBooking;
      });

      return NextResponse.json(
        {
          message: 'Booking berhasil ditandai selesai.',
          booking: updatedBooking,
        },
        { status: 200 }
      );
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Booking yang sudah selesai tidak dapat dibatalkan' },
        { status: 400 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking ini sudah dibatalkan sebelumnya' },
        { status: 400 }
      );
    }

    const cancellationReason = body.cancellationReason.trim();

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const nextBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
        },
      });

      if (booking.plot.status !== 'available') {
        await tx.plot.update({
          where: { id: booking.plotId },
          data: { status: 'available' },
        });

        await tx.cemetery.update({
          where: { id: booking.cemeteryId },
          data: { availablePlots: { increment: 1 } },
        });
      }

      await tx.notification.create({
        data: {
          userId: booking.userId,
          type: 'SERVICE_UPDATE',
          title: 'Booking Dibatalkan',
          message: `Booking Anda dibatalkan oleh admin. Alasan: ${cancellationReason}`,
          relatedBookingId: booking.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: admin.id,
          entityType: 'Booking',
          entityId: booking.id,
          action: 'BOOKING_CANCELLED',
          changes: {
            from: booking.status,
            to: 'CANCELLED',
            cancellationReason,
          },
          cemeteryId: booking.cemeteryId,
          bookingId: booking.id,
          plotId: booking.plotId,
        },
      });

      return nextBooking;
    });

    return NextResponse.json(
      {
        message: 'Booking berhasil dibatalkan.',
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi aksi booking gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update admin booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
