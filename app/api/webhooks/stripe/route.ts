import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmation, sendBookingConfirmation } from '@/lib/email-service';

/**
 * Stripe webhook handler
 * Receives payment events from Stripe and updates booking status
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

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Update booking
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
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
        title: 'Payment Confirmed',
        message: `Your payment of $${payment.amount} has been received and confirmed.`,
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
        title: 'Payment Failed',
        message: `Your payment of $${payment.amount} could not be processed. Please try again.`,
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
