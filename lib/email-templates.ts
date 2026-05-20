/**
 * Email notification service for MemorialCare
 * Handles sending booking confirmations, payment receipts, and reminders
 */

interface EmailTemplate {
  subject: string;
  body: string;
  html: string;
}

function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat('id-ID').format(value)}`
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
      return getBookingConfirmationTemplate(data as {
        firstName: string;
        lastName: string;
        cemeteryName: string;
        plotNumber: string;
        bookingDate: string;
        bookingId: string;
        totalPrice: number;
      });
    case NotificationTemplate.PAYMENT_RECEIVED:
      return getPaymentReceivedTemplate(data as {
        firstName: string;
        lastName: string;
        bookingId: string;
        amount: number;
        paymentDate: string;
      });
    case NotificationTemplate.SERVICE_UPDATE:
      return getServiceUpdateTemplate(data as {
        firstName: string;
        lastName: string;
        bookingId: string;
        serviceName: string;
        message: string;
      });
    case NotificationTemplate.REMINDER:
      return getReminderTemplate(data as {
        firstName: string;
        lastName: string;
        eventName: string;
        eventDate: string;
        reminder: string;
      });
    default:
      throw new Error('Template tidak dikenal');
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
    subject: `Konfirmasi Pemesanan - ${data.cemeteryName}`,
    body: `
Yth. ${data.firstName} ${data.lastName},

Terima kasih telah melakukan pemesanan melalui MemorialCare. Reservasi Anda telah dikonfirmasi.

Detail Pemesanan:
- Pemakaman: ${data.cemeteryName}
- Lahan: ${data.plotNumber}
- Tanggal Pemesanan: ${data.bookingDate}
- ID Pemesanan: ${data.bookingId}
- Total Harga: ${formatRupiah(data.totalPrice)}

Silakan lanjutkan pembayaran untuk menyelesaikan pemesanan ini.

Hormat kami,
Tim MemorialCare
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
      <h2>Konfirmasi Pemesanan</h2>
    </div>
    <p>Yth. ${data.firstName} ${data.lastName},</p>
    <p>Terima kasih telah melakukan pemesanan melalui MemorialCare. Reservasi Anda telah dikonfirmasi.</p>
    <div class="details">
      <p><strong>Pemakaman:</strong> ${data.cemeteryName}</p>
      <p><strong>Lahan:</strong> ${data.plotNumber}</p>
      <p><strong>Tanggal Pemesanan:</strong> ${data.bookingDate}</p>
      <p><strong>ID Pemesanan:</strong> ${data.bookingId}</p>
      <p><strong>Total Harga:</strong> ${formatRupiah(data.totalPrice)}</p>
    </div>
    <p>Silakan lanjutkan pembayaran untuk menyelesaikan pemesanan ini.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. Seluruh hak cipta dilindungi.</p>
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
    subject: `Bukti Pembayaran - Pemesanan ${data.bookingId}`,
    body: `
Yth. ${data.firstName} ${data.lastName},

Pembayaran Anda telah berhasil diterima.

Detail Pembayaran:
- ID Pemesanan: ${data.bookingId}
- Jumlah: ${formatRupiah(data.amount)}
- Tanggal Pembayaran: ${data.paymentDate}
- Status: Terkonfirmasi

Pemesanan Anda kini telah selesai. Terima kasih telah memilih MemorialCare.

Hormat kami,
Tim MemorialCare
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
      <h2>Pembayaran Diterima</h2>
    </div>
    <p>Yth. ${data.firstName} ${data.lastName},</p>
    <p>Pembayaran Anda telah berhasil diterima.</p>
    <div class="details">
      <p><strong>ID Pemesanan:</strong> ${data.bookingId}</p>
      <p><strong>Jumlah:</strong> ${formatRupiah(data.amount)}</p>
      <p><strong>Tanggal Pembayaran:</strong> ${data.paymentDate}</p>
      <p><strong class="success">Status: Terkonfirmasi</strong></p>
    </div>
    <p>Pemesanan Anda kini telah selesai. Terima kasih telah memilih MemorialCare.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. Seluruh hak cipta dilindungi.</p>
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
    subject: `Pembaruan Layanan - ${data.serviceName}`,
    body: `
Yth. ${data.firstName} ${data.lastName},

Kami memiliki pembaruan terkait pemesanan Anda (${data.bookingId}).

Layanan: ${data.serviceName}
Pesan: ${data.message}

Jika ada pertanyaan, silakan hubungi kami kapan saja.

Hormat kami,
Tim MemorialCare
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
      <h2>Pembaruan Layanan</h2>
    </div>
    <p>Yth. ${data.firstName} ${data.lastName},</p>
    <p>Kami memiliki pembaruan terkait pemesanan Anda (${data.bookingId}).</p>
    <div class="message">
      <p><strong>Layanan:</strong> ${data.serviceName}</p>
      <p><strong>Pesan:</strong> ${data.message}</p>
    </div>
    <p>Jika ada pertanyaan, silakan hubungi kami kapan saja.</p>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. Seluruh hak cipta dilindungi.</p>
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
    subject: `Pengingat - ${data.eventName}`,
    body: `
Yth. ${data.firstName} ${data.lastName},

Ini adalah pengingat untuk agenda Anda yang akan datang.

Acara: ${data.eventName}
Tanggal: ${data.eventDate}
Pengingat: ${data.reminder}

Hormat kami,
Tim MemorialCare
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
      <h2>Pengingat</h2>
    </div>
    <p>Yth. ${data.firstName} ${data.lastName},</p>
    <p>Ini adalah pengingat untuk agenda Anda yang akan datang.</p>
    <div class="reminder">
      <p><strong>Acara:</strong> ${data.eventName}</p>
      <p><strong>Tanggal:</strong> ${data.eventDate}</p>
      <p><strong>Pengingat:</strong> ${data.reminder}</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MemorialCare. Seluruh hak cipta dilindungi.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}
