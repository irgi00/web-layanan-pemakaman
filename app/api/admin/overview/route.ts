import { NextResponse } from 'next/server';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      console.error('Get admin overview error: unauthenticated or non-admin request');
      return NextResponse.json(
        { error: 'Not authenticated as admin' },
        { status: 401 }
      );
    }

    if (!isSuperAdmin(admin) && !admin.cemeteryId) {
      console.error('Get admin overview error: cemetery admin has no cemetery assignment', {
        adminId: admin.id,
        role: admin.role,
      });
      return NextResponse.json(
        { error: 'No cemetery assigned to this admin account' },
        { status: 400 }
      );
    }

    const bookingWhere = isSuperAdmin(admin) ? {} : { cemeteryId: admin.cemeteryId! };
    const plotWhere = isSuperAdmin(admin) ? {} : { cemeteryId: admin.cemeteryId! };

    const [plots, bookings, cemetery] = await Promise.all([
      prisma.plot.findMany({
        where: plotWhere,
        select: {
          id: true,
          status: true,
        },
      }),
      prisma.booking.findMany({
        where: bookingWhere,
        select: {
          id: true,
          totalPrice: true,
          cemeteryId: true,
        },
      }),
      isSuperAdmin(admin)
        ? Promise.resolve(null)
        : prisma.cemetery.findUnique({
            where: { id: admin.cemeteryId! },
            select: {
              id: true,
              name: true,
              location: true,
              city: true,
              province: true,
              imageUrl: true,
            },
          }),
    ]);

    if (!isSuperAdmin(admin) && !cemetery) {
      console.error('Get admin overview error: assigned cemetery not found', {
        adminId: admin.id,
        cemeteryId: admin.cemeteryId,
      });
      return NextResponse.json(
        { error: 'Assigned cemetery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        role: admin.role,
        cemetery,
        stats: {
          totalPlots: plots.length,
          availablePlots: plots.filter((plot) => plot.status === 'available').length,
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin overview error:', error);
    return NextResponse.json(
      { error: 'Failed to load admin overview' },
      { status: 500 }
    );
  }
}
