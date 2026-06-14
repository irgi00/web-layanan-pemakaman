'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { AdminBookingsManagementPage } from '@/components/admin-bookings-management-page';

export default function SuperadminBookingsPage() {
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
          <Card className="border-white/70 bg-white/90 p-8">Memuat riwayat booking...</Card>
        </div>
      </div>
    );
  }

  return (
    <AdminBookingsManagementPage
      role="SUPER_ADMIN"
      roleLabel="Super Admin"
      title="Riwayat Booking"
      description="Pantau dan proses booking dari seluruh cemetery."
      userEmail={userEmail}
      onLogout={handleLogout}
      scopeHint="Super Admin dapat melihat seluruh booking, memproses override operasional, dan menuntaskan booking lintas cemetery dengan flow status yang sama."
    />
  );
}
