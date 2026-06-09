'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PortalRole } from '@/lib/portal-navigation';
import { getPortalRoleLabel } from '@/lib/portal-navigation';
import { DashboardAsideCard, DashboardHero, DashboardSection } from '@/components/dashboard-shell';
import { PortalShell } from '@/components/portal-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PortalPlaceholderPageProps {
  role: PortalRole;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  body: string;
  statusTitle: string;
  statusBody: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: ReactNode;
}

export function PortalPlaceholderPage({
  role,
  title,
  description,
  eyebrow,
  headline,
  body,
  statusTitle,
  statusBody,
  primaryAction,
  secondaryAction,
}: PortalPlaceholderPageProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <PortalShell
      role={role}
      roleLabel={getPortalRoleLabel(role)}
      title={title}
      description={description}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHero
          eyebrow={eyebrow}
          title={headline}
          description={body}
          action={
            primaryAction ? (
              <Link href={primaryAction.href}>
                <Button className="h-11 rounded-xl px-5">{primaryAction.label}</Button>
              </Link>
            ) : undefined
          }
          aside={
            <DashboardAsideCard title={statusTitle}>
              <p>{statusBody}</p>
            </DashboardAsideCard>
          }
        />

        <DashboardSection
          title="Navigasi Siap Dipakai"
          description="Route ini sudah disiapkan agar sidebar per role tetap konsisten dan rapi di desktop maupun mobile."
        >
          <Card className="rounded-[28px] border-white/70 bg-white/80 p-6 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.45)]">
            <p className="text-sm leading-7 text-muted-foreground">{body}</p>
            {secondaryAction ? <div className="mt-5">{secondaryAction}</div> : null}
          </Card>
        </DashboardSection>
      </div>
    </PortalShell>
  );
}
