import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function DashboardPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashboardTopbar({
  title,
  description,
  rightSlot,
}: {
  title: string;
  description: string;
  rightSlot?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            MemorialCare
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {rightSlot}
      </div>
    </header>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  action,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-white/70 bg-white/90 py-0 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
      <div className="grid gap-8 px-6 py-7 md:grid-cols-[1.2fr,0.8fr] md:px-8">
        <div className="space-y-4">
          <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
          {action}
        </div>
        <div className="flex items-start justify-start md:justify-end">{aside}</div>
      </div>
    </Card>
  );
}

export function DashboardSection({
  title,
  description,
  action,
  actionPlacement = 'side',
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  actionPlacement?: 'side' | 'below';
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-white/70 bg-white/90 py-0 shadow-[0_20px_70px_-50px_rgba(15,23,42,0.45)]',
        className
      )}
    >
      <CardHeader className="border-b border-border/60 bg-white/70 py-5">
        {actionPlacement === 'below' ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {action}
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {action}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 py-5 sm:px-6">{children}</CardContent>
    </Card>
  );
}

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  accentClassName,
}: {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  accentClassName?: string;
}) {
  return (
    <Card className="overflow-hidden border-white/70 bg-white/90 py-0 shadow-[0_16px_48px_-36px_rgba(15,23,42,0.35)]">
      <CardContent className="flex items-start justify-between gap-4 px-5 py-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary',
            accentClassName
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardAsideCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full rounded-3xl border border-primary/10 bg-primary/[0.07] p-5 text-sm text-muted-foreground',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <ArrowUpRight className="size-4 text-primary" />
        {title}
      </div>
      {children}
    </div>
  );
}
