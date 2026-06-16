import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmation } from '@/lib/email-service';
import { formatRupiah } from '@/lib/utils';

/**
 * Stripe webhook handler
 * Receives payment events from Stripe and updates payment review status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify webhook signature with Stripe
    // const sig = request.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    switch (body.type) {
      case 'payment_intent.succeeded':
        return handlePaymentSucceeded(body.data.object);
      case 'payment_intent.payment_failed':
        return handlePaymentFailed(body.data.object);
      default:
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    // Update payment status
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
      include: { booking: { include: { user: true } } },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Mark payment as awaiting admin review instead of auto-confirming the booking.
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PENDING_VERIFICATION',
        paymentSubmittedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Send payment confirmation email
    await sendPaymentConfirmation(payment.booking.user.email, {
      firstName: payment.booking.user.firstName,
      lastName: payment.booking.user.lastName,
      bookingId: payment.bookingId,
      amount: payment.amount,
      paymentDate: new Date().toLocaleDateString(),
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        type: 'PAYMENT_RECEIVED',
        title: 'Pembayaran Menunggu Verifikasi',
        message: `Pembayaran Anda sebesar ${formatRupiah(payment.amount)} sudah tercatat dan sedang menunggu verifikasi admin.`,
        relatedBookingId: payment.bookingId,
      },
    });

    console.log('[WEBHOOK] Payment succeeded for booking:', payment.bookingId);

    return NextResponse.json({ processed: true }, { status: 200 });
  } catch (error) {
    console.error('Handle payment succeeded error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    // Update payment status
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
      include: { booking: { include: { user: true } } },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: payment.booking.userId,
        type: 'BOOKING_CONFIRMATION',
        title: 'Pembayaran Gagal',
        message: `Pembayaran Anda sebesar ${formatRupiah(payment.amount)} tidak dapat diproses. Silakan coba lagi.`,
        relatedBookingId: payment.bookingId,
      },
    });

    console.log('[WEBHOOK] Payment failed for booking:', payment.bookingId);

    return NextResponse.json({ processed: true }, { status: 200 });
  } catch (error) {
    console.error('Handle payment failed error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment failure' },
      { status: 500 }
    );
  }
}
