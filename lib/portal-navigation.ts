import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookCopy,
  Building2,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  Trees,
  UserRound,
  Users,
} from 'lucide-react';

export type PortalRole = 'MEMBER' | 'CEMETERY_ADMIN' | 'SUPER_ADMIN';

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface PortalNavSection {
  label: string;
  items: PortalNavItem[];
}

const portalNavigationByRole: Record<PortalRole, PortalNavSection[]> = {
  MEMBER: [
    {
      label: 'Utama',
      items: [{ href: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Akun',
      items: [
        { href: '/member/bookings', label: 'Pemesanan Saya', icon: BookCopy },
        { href: '/member/profile', label: 'Profil', icon: UserRound },
      ],
    },
  ],
  CEMETERY_ADMIN: [
    {
      label: 'Utama',
      items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Operasional',
      items: [
        { href: '/admin/plots', label: 'Kelola Plot Makam', icon: Trees },
        { href: '/admin/payments', label: 'Verifikasi Pembayaran', icon: CreditCard },
        { href: '/admin/bookings', label: 'Daftar Booking', icon: BookCopy },
        { href: '/admin/cemetery', label: 'Informasi Cemetery', icon: MapPinned },
      ],
    },
  ],
  SUPER_ADMIN: [
    {
      label: 'Utama',
      items: [{ href: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Master Data',
      items: [
        { href: '/superadmin/cemeteries', label: 'Semua Cemetery', icon: Building2 },
        { href: '/superadmin/plots', label: 'Kelola Plot', icon: Trees },
        { href: '/superadmin/admins', label: 'Kelola Admin', icon: Users },
      ],
    },
    {
      label: 'Monitoring',
      items: [
        { href: '/superadmin/payments', label: 'Semua Pembayaran', icon: CreditCard },
        { href: '/superadmin/bookings', label: 'Riwayat Booking', icon: BookCopy },
        { href: '/superadmin/statistics', label: 'Statistik', icon: BarChart3 },
      ],
    },
  ],
};

export function getPortalNavigation(role: PortalRole) {
  return portalNavigationByRole[role];
}

export function getPortalRoleLabel(role: PortalRole) {
  if (role === 'SUPER_ADMIN') {
    return 'Super Admin';
  }

  if (role === 'CEMETERY_ADMIN') {
    return 'Cemetery Admin';
  }

  return 'Member';
}

export function getPortalRoleHome(role: PortalRole) {
  return getPortalNavigation(role)[0]?.items[0]?.href ?? '/';
}
