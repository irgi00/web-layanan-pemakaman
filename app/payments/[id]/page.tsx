'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch payment data
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payments/${id}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        setPayment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPayment();
  }, [id]);

  // 🔹 Handle bayar
  const handlePay = async () => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          paymentId: 'SIMULATED-PAYMENT',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert('Pembayaran berhasil!');

      // redirect ke dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <p className="p-6">Memuat...</p>;

  if (!payment) return <p className="p-6">Data pembayaran tidak ditemukan</p>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <BackButton fallbackHref="/dashboard" />
        <div className="border rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Pembayaran</h1>

        <div>
          <p className="text-sm text-gray-500">Booking ID</p>
          <p className="font-semibold">{payment.bookingId}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Pembayaran</p>
          <p className="text-xl font-bold">
            {formatRupiah(payment.amount)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p
            className={`font-semibold ${
              payment.status === 'COMPLETED'
                ? 'text-green-600'
                : 'text-yellow-600'
            }`}
          >
            {payment.status === 'COMPLETED' ? 'Berhasil' : 'Menunggu'}
          </p>
        </div>

        {payment.status !== 'COMPLETED' && (
          <Button onClick={handlePay} className="w-full">
            Bayar Sekarang
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
