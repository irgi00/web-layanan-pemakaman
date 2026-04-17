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

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = createBookingSchema.parse(body);

    // Verify plot is available
    const plot = await prisma.plot.findUnique({
      where: { id: data.plotId },
      include: { booking: true },
    });

    if (!plot || plot.status !== 'available' || plot.booking) {
      return NextResponse.json(
        { error: 'Plot is not available' },
        { status: 400 }
      );
    }

    // Calculate total price
    let totalPrice = 500; // Base plot price

    if (data.selectedServices && data.selectedServices.length > 0) {
      for (const selectedService of data.selectedServices) {
        const service = await prisma.service.findUnique({
          where: { id: selectedService.serviceId },
        });

        if (!service) {
          return NextResponse.json(
            { error: `Service ${selectedService.serviceId} not found` },
            { status: 400 }
          );
        }

        totalPrice += service.price * selectedService.quantity;
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: currentUser.userId,
        cemeteryId: data.cemeteryId,
        plotId: data.plotId,
        deceasedProfileId: data.deceasedProfileId,
        totalPrice,
        notes: data.notes,
        status: 'PENDING',
        serviceBookings: {
          create: (data.selectedServices || []).map((service) => ({
            serviceId: service.serviceId,
            quantity: service.quantity,
            price: 0, // Will be filled in after fetching service details
          })),
        },
      },
      include: {
        serviceBookings: {
          include: { service: true },
        },
      },
    });

    // Update plot status
    await prisma.plot.update({
      where: { id: data.plotId },
      data: { status: 'reserved' },
    });

    // Update cemetery available plots
    await prisma.cemetery.update({
      where: { id: data.cemeteryId },
      data: { availablePlots: { decrement: 1 } },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalPrice,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
