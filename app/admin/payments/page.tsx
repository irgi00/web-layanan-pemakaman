'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { AdminPaymentReviewPage } from '@/components/admin-payment-review-page';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const meResponse = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!meResponse.ok) {
          router.push('/admin/login');
          return;
        }

        const me = await meResponse.json();

        if (me.role === 'SUPER_ADMIN') {
          router.push('/superadmin/payments');
          return;
        }

        if (me.role !== 'CEMETERY_ADMIN') {
          router.push('/login');
          return;
        }

        setUser(me);
      } catch (error) {
        console.error(error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Card className="border-white/70 bg-white/90 p-8">Memuat verifikasi pembayaran...</Card>
        </div>
      </div>
    );
  }

  return (
    <AdminPaymentReviewPage
      role="CEMETERY_ADMIN"
      roleLabel="Cemetery Admin"
      title="Verifikasi Pembayaran"
      description="Tinjau bukti pembayaran yang masuk ke cemetery Anda."
      userEmail={user?.email}
      onLogout={handleLogout}
      scopeHint="Cemetery Admin hanya dapat melihat dan memvalidasi pembayaran dari cemetery yang ditugaskan kepadanya."
    />
  );
}
