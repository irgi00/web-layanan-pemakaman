'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortalShell } from '@/components/portal-shell';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRedirectPathByRole, isAdminRole } from '@/lib/roles';
import { DashboardSection } from '@/components/dashboard-shell';
import { UserRound, Mail, Shield, Hash } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function MemberProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const userData = await response.json();

        if (isAdminRole(userData.role)) {
          router.push(getRedirectPathByRole(userData.role));
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-32 w-full" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role="MEMBER"
      roleLabel="Member"
      title="Profil Member"
      description="Informasi akun dan pengaturan profil Anda."
      userEmail={user?.email}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardSection
          title="Data Personal"
          description="Informasi detail mengenai akun Anda saat ini."
        >
          <Card className="p-8 bg-white/80 border-white/70 shadow-sm rounded-[24px] max-w-2xl">
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">ID Akun</p>
                    <p className="font-mono text-sm text-muted-foreground">{user?.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Status Akun</p>
                    <p className="text-sm text-muted-foreground">Aktif dan terverifikasi</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
