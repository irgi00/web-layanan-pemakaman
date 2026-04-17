/**
 * Email notification service for MemorialCare
 * Handles sending booking confirmations, payment receipts, and reminders
 */

interface EmailTemplate {
  subject: string;
  body: string;
  html: string;
}

export enum NotificationTemplate {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  PAYMENT_RECEIVED = 'payment_received',
  SERVICE_UPDATE = 'service_update',
  REMINDER = 'reminder',
}

export interface EmailData {
  to: string;
  template: NotificationTemplate;
  data: Record<string, any>;
}

/**
 * Get email template based on type
 */
export function getEmailTemplate(template: NotificationTemplate, data: Record<string, any>): EmailTemplate {
  switch (template) {
    case NotificationTemplate.BOOKING_CONFIRMATION:
      return getBookingConfirmationTemplate(data);
    case NotificationTemplate.PAYMENT_RECEIVED:
      return getPaymentReceivedTemplate(data);
    case NotificationTemplate.SERVICE_UPDATE:
      return getServiceUpdateTemplate(data);
    case NotificationTemplate.REMINDER:
      return getReminderTemplate(data);
    default:
      throw new Error('Unknown template');
  }
}

function getBookingConfirmationTemplate(data: {
  firstName: string;
  lastName: string;
  cemeteryName: string;
  plotNumber: string;
  bookingDate: string;
  bookingId: string;
  totalPrice: number;
}): EmailTemplate {
  return {
    subject: `Booking Confirmation - ${data.cemeteryName}`,
    body: `
Dear ${data.firstName} ${data.lastName},

Thank you for your booking with MemorialCare. Your reservation has been confirmed.

Booking Details:
- Cemetery: ${data.cemeteryName}
- Plot: ${data.plotNumber}
- Booking Date: ${data.bookingDate}
- Booking ID: ${data.bookingId}
- Total Price: $${data.totalPrice.toLocaleString()}

Please proceed to complete your payment to finalize this booking.

Best regards,
MemorialCare Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #55a384; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .details { background: #f9f9f9; padding: 20px; border-left: 4px solid #55a384; margin: 20px 0; }
    .details p { margin: 10px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Booking Confirmation</h2>
    </div>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>Thank you for your booking with MemorialCare. Your reservation has been confirmed.</p>
    <div class="details">
      <p><strong>Cemetery:</strong> ${data.cemeteryName}</p>
      <p><strong>Plot:</strong> ${data.plotNumber}</p>
      <p><strong>Booking Date:</strong> ${data.bookingDate}</p>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Total Price:</strong> $${data.totalPrice.toLocaleString()}</p>
    </div>
    <p>Please proceed to complete your payment to finalize this booking.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

function getPaymentReceivedTemplate(data: {
  firstName: string;
  lastName: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
}): EmailTemplate {
  return {
    subject: `Payment Receipt - Booking ${data.bookingId}`,
    body: `
Dear ${data.firstName} ${data.lastName},

Your payment has been received successfully.

Payment Details:
- Booking ID: ${data.bookingId}
- Amount: $${data.amount.toLocaleString()}
- Payment Date: ${data.paymentDate}
- Status: Confirmed

Your booking is now complete. Thank you for choosing MemorialCare.

Best regards,
MemorialCare Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #55a384; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .details { background: #f9f9f9; padding: 20px; border-left: 4px solid #55a384; margin: 20px 0; }
    .details p { margin: 10px 0; }
    .success { color: #28a745; font-weight: bold; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Received</h2>
    </div>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>Your payment has been received successfully.</p>
    <div class="details">
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Amount:</strong> $${data.amount.toLocaleString()}</p>
      <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
      <p><strong class="success">Status: Confirmed</strong></p>
    </div>
    <p>Your booking is now complete. Thank you for choosing MemorialCare.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

function getServiceUpdateTemplate(data: {
  firstName: string;
  lastName: string;
  bookingId: string;
  serviceName: string;
  message: string;
}): EmailTemplate {
  return {
    subject: `Service Update - ${data.serviceName}`,
    body: `
Dear ${data.firstName} ${data.lastName},

We have an update regarding your booking (${data.bookingId}).

Service: ${data.serviceName}
Message: ${data.message}

If you have any questions, please don't hesitate to contact us.

Best regards,
MemorialCare Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #55a384; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .message { background: #f9f9f9; padding: 20px; border-left: 4px solid #55a384; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Service Update</h2>
    </div>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>We have an update regarding your booking (${data.bookingId}).</p>
    <div class="message">
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    </div>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}

function getReminderTemplate(data: {
  firstName: string;
  lastName: string;
  eventName: string;
  eventDate: string;
  reminder: string;
}): EmailTemplate {
  return {
    subject: `Reminder - ${data.eventName}`,
    body: `
Dear ${data.firstName} ${data.lastName},

This is a gentle reminder about your upcoming event.

Event: ${data.eventName}
Date: ${data.eventDate}
Reminder: ${data.reminder}

Best regards,
MemorialCare Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #55a384; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .reminder { background: #fffbea; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Reminder</h2>
    </div>
    <p>Dear ${data.firstName} ${data.lastName},</p>
    <p>This is a gentle reminder about your upcoming event.</p>
    <div class="reminder">
      <p><strong>Event:</strong> ${data.eventName}</p>
      <p><strong>Date:</strong> ${data.eventDate}</p>
      <p><strong>Reminder:</strong> ${data.reminder}</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}
