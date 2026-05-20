import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/jwt';
import { z } from 'zod';

const createBookingSchema = z.object({
  cemeteryId: z.string().uuid(),
  plotId: z.string().uuid(),
  deceasedProfileId: z.string().optional(),
  selectedServices: z.array(z.object({
    serviceId: z.string().uuid(),
    quantity: z.number().min(1),
  })).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Anda belum masuk' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: currentUser.userId },
      include: {
        cemetery: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
          },
        },
        plot: {
          select: {
            id: true,
            plotNumber: true,
            section: true,
            row: true,
            status: true,
          },
        },
        serviceBookings: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[BOOKINGS][GET]', {
      currentUserId: currentUser.userId,
      bookingUserIds: bookings.map((booking) => ({
        bookingId: booking.id,
        booking_user_id: booking.userId,
      })),
    });

    return NextResponse.json(
      {
        bookings,
        stats: {
          total: bookings.length,
          active: bookings.filter((booking) =>
            ['PENDING', 'CONFIRMED'].includes(booking.status)
          ).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get member bookings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Anda belum masuk' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createBookingSchema.parse(body);

    // Verify plot is available
    const plot = await prisma.plot.findUnique({
      where: { id: data.plotId },
      include: { booking: true, cemetery: true },
    });

    if (!plot || plot.cemeteryId !== data.cemeteryId || plot.status !== 'available' || plot.booking) {
      return NextResponse.json(
        { error: 'Lahan sudah tidak tersedia' },
        { status: 400 }
      );
    }

    if (data.deceasedProfileId) {
      const deceasedProfile = await prisma.deceasedProfile.findUnique({
        where: { id: data.deceasedProfileId },
        select: { id: true, userId: true },
      });

      if (!deceasedProfile || deceasedProfile.userId !== currentUser.userId) {
        return NextResponse.json(
          { error: 'Profil almarhum tidak valid untuk akun ini' },
          { status: 403 }
        );
      }
    }

    // Calculate total price
    let totalPrice = plot.cemetery.pricePerPlot;
    const serviceBookingItems: Array<{
      serviceId: string;
      quantity: number;
      price: number;
    }> = [];

    if (data.selectedServices && data.selectedServices.length > 0) {
      for (const selectedService of data.selectedServices) {
        const service = await prisma.service.findUnique({
          where: { id: selectedService.serviceId },
        });

        if (!service || service.cemeteryId !== data.cemeteryId || !service.isActive) {
          return NextResponse.json(
            { error: `Layanan ${selectedService.serviceId} tidak ditemukan` },
            { status: 400 }
          );
        }

        totalPrice += service.price * selectedService.quantity;
        serviceBookingItems.push({
          serviceId: service.id,
          quantity: selectedService.quantity,
          price: service.price,
        });
      }
    }

    const { booking, payment } = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: currentUser.userId,
          cemeteryId: data.cemeteryId,
          plotId: data.plotId,
          deceasedProfileId: data.deceasedProfileId,
          totalPrice,
          notes: data.notes,
          status: 'PENDING',
          serviceBookings: {
            create: serviceBookingItems.map((service) => ({
              serviceId: service.serviceId,
              quantity: service.quantity,
              price: service.price,
            })),
          },
        },
        include: {
          serviceBookings: {
            include: { service: true },
          },
        },
      });

      await tx.plot.update({
        where: { id: data.plotId },
        data: { status: 'reserved' },
      });

      await tx.cemetery.update({
        where: { id: data.cemeteryId },
        data: { availablePlots: { decrement: 1 } },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          status: 'PENDING',
        },
      });

      return { booking, payment };
    });

    console.log('[BOOKINGS][POST]', {
      currentUserId: currentUser.userId,
      bookingId: booking.id,
      booking_user_id: booking.userId,
    });

    return NextResponse.json(
      {
        message: 'Pemesanan berhasil dibuat',
        booking: {
          id: booking.id,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
        payment: {
          id: payment.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
