import { NextResponse } from 'next/server';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      console.error('Get superadmin overview error: unauthenticated or non-admin request');
      return NextResponse.json(
        { error: 'Not authenticated as admin' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(admin)) {
      console.error('Get superadmin overview error: non-superadmin access denied', {
        adminId: admin.id,
        role: admin.role,
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [cemeteries, users, plots, bookings, cemeteryAdmins] = await Promise.all([
      prisma.cemetery.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          city: true,
          province: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.count(),
      prisma.plot.findMany({
        select: {
          id: true,
          status: true,
          cemeteryId: true,
        },
      }),
      prisma.booking.findMany({
        select: {
          id: true,
          totalPrice: true,
        },
      }),
      prisma.user.count({
        where: { role: 'CEMETERY_ADMIN' },
      }),
    ]);

    return NextResponse.json(
      {
        stats: {
          totalCemeteries: cemeteries.length,
          totalPlots: plots.length,
          availablePlots: plots.filter((plot) => plot.status === 'available').length,
          totalBookings: bookings.length,
          totalUsers: users,
          totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
          totalCemeteryAdmins: cemeteryAdmins,
        },
        cemeteries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get superadmin overview error:', error);
    return NextResponse.json(
      { error: 'Failed to load superadmin overview' },
      { status: 500 }
    );
  }
}
