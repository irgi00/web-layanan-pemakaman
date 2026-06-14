'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { AdminPaymentReviewPage } from '@/components/admin-payment-review-page';

export default function SuperadminPaymentsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

        if (me.role !== 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
          return;
        }

        setUserEmail(me.email);
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat data pembayaran global...</Card>
        </div>
      </div>
    );
  }

  return (
    <AdminPaymentReviewPage
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Semua Pembayaran"
      description="Pantau pembayaran dari seluruh cemetery dan lakukan override bila dibutuhkan."
      userEmail={userEmail}
      onLogout={handleLogout}
      scopeHint="Super Admin dapat melihat semua pembayaran, memfilter status, dan memvalidasi seluruh cemetery dalam satu halaman."
    />
  );
}
