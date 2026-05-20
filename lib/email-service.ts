/**
 * Email service for MemorialCare
 * Integrates with email provider (SendGrid, AWS SES, Resend, etc.)
 * 
 * Usage:
 * - In production, connect to your email service
 * - For now, logs emails to console
 */

import { EmailData, getEmailTemplate, NotificationTemplate } from './email-templates';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email through configured service
 * 
 * In production, replace with:
 * - SendGrid: npm install @sendgrid/mail
 * - Resend: npm install resend
 * - AWS SES: npm install aws-sdk
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    // TODO: Implement actual email sending
    // Example with Resend:
    // const response = await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL || 'noreply@memorialcare.com',
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    // });

    // For development, log to console
    console.log('[EMAIL] Sending to:', options.to);
    console.log('[EMAIL] Subject:', options.subject);
    console.log('[EMAIL] HTML:', options.html);

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send templated notification email
 */
export async function sendNotificationEmail(email: EmailData): Promise<boolean> {
  try {
    const template = getEmailTemplate(email.template, email.data);

    return await sendEmail({
      to: email.to,
      subject: template.subject,
      html: template.html,
      text: template.body,
    });
  } catch (error) {
    console.error('Notification email error:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  email: string,
  data: {
    firstName: string;
    lastName: string;
    cemeteryName: string;
    plotNumber: string;
    bookingDate: string;
    bookingId: string;
    totalPrice: number;
  }
): Promise<boolean> {
  return sendNotificationEmail({
    to: email,
    template: NotificationTemplate.BOOKING_CONFIRMATION,
    data,
  });
}

/**
 * Send payment received email
 */
export async function sendPaymentConfirmation(
  email: string,
  data: {
    firstName: string;
    lastName: string;
    bookingId: string;
    amount: number;
    paymentDate: string;
  }
): Promise<boolean> {
  return sendNotificationEmail({
    to: email,
    template: NotificationTemplate.PAYMENT_RECEIVED,
    data,
  });
}

/**
 * Send service update email
 */
export async function sendServiceUpdate(
  email: string,
  data: {
    firstName: string;
    lastName: string;
    bookingId: string;
    serviceName: string;
    message: string;
  }
): Promise<boolean> {
  return sendNotificationEmail({
    to: email,
    template: NotificationTemplate.SERVICE_UPDATE,
    data,
  });
}

/**
 * Send reminder email
 */
export async function sendReminder(
  email: string,
  data: {
    firstName: string;
    lastName: string;
    eventName: string;
    eventDate: string;
    reminder: string;
  }
): Promise<boolean> {
  return sendNotificationEmail({
    to: email,
    template: NotificationTemplate.REMINDER,
    data,
  });
}
