import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment || payment.booking.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment || payment.booking.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

     // 🔥 Tambahin ini (biar tidak double bayar)
    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      );
    }

    // 🔥 Validasi request
    if (!(body.status === 'completed' || body.success)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Update payment status based on webhook or confirmation
    if (body.status === 'completed' || body.success) {
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          stripePaymentId: body.paymentId,
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      return NextResponse.json(
        {
          message: 'Payment completed successfully',
          payment: updatedPayment,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid payment status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
