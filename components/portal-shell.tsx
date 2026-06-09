'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, LogOut } from 'lucide-react';
import { getPortalNavigation, getPortalRoleHome, type PortalRole } from '@/lib/portal-navigation';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface PortalShellProps {
  role: PortalRole;
  roleLabel: string;
  title: string;
  description: string;
  userEmail?: string | null;
  onLogout: () => void | Promise<void>;
  children: ReactNode;
  headerSlot?: ReactNode;
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  role,
  roleLabel,
  title,
  description,
  userEmail,
  onLogout,
  children,
  headerSlot,
}: PortalShellProps) {
  const pathname = usePathname();
  const navSections = getPortalNavigation(role);
  const homeHref = getPortalRoleHome(role);

  return (
    <SidebarProvider className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(246,248,251,1))]">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-4 px-3 py-4">
          <Link href={homeHref} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <HeartHandshake className="size-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                MemorialCare
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">{roleLabel}</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          {navSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isPathActive(pathname, item.href)}
                          tooltip={item.label}
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="gap-3 px-3 py-4">
          <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 px-3 py-3 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/70">
              Akun Aktif
            </p>
            <p className="mt-2 truncate text-sm font-medium text-sidebar-foreground">
              {userEmail || roleLabel}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onLogout}
            className="w-full justify-start rounded-xl border-sidebar-border/80 bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="mr-2 size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Keluar</span>
          </Button>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="border border-white/70 bg-white/80 shadow-sm" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                  MemorialCare
                </p>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </div>
            {headerSlot}
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
