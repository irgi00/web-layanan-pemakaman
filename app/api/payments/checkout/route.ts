import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const checkoutSchema = z.object({
  bookingId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
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
    const data = checkoutSchema.parse(body);

    // Get booking and verify user owns it
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { payment: true, user: true },
    });

    if (!booking || booking.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (!booking.payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // In production, integrate with Stripe here
    // For now, return a payment session URL
    const paymentUrl = `/api/payments/${booking.payment.id}/process`;

    return NextResponse.json(
      {
        message: 'Payment session created',
        paymentUrl,
        paymentId: booking.payment.id,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
