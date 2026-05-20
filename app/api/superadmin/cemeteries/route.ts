import { NextResponse } from 'next/server';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const admin = await getAdminActor();

    if (!admin || !isSuperAdmin(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cemeteries = await prisma.cemetery.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        province: true,
        totalPlots: true,
        availablePlots: true,
        admins: {
          where: { role: 'CEMETERY_ADMIN' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        plots: {
          select: {
            id: true,
            status: true,
          },
        },
        bookings: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      {
        cemeteries: cemeteries.map((cemetery) => ({
          id: cemetery.id,
          name: cemetery.name,
          location: cemetery.location,
          city: cemetery.city,
          province: cemetery.province,
          totalPlots: cemetery.plots.length || cemetery.totalPlots,
          availablePlots:
            cemetery.plots.filter((plot) => plot.status === 'available').length ||
            cemetery.availablePlots,
          totalBookings: cemetery.bookings.length,
          totalRevenue: cemetery.bookings.reduce(
            (sum, booking) => sum + booking.totalPrice,
            0
          ),
          admins: cemetery.admins,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get superadmin cemeteries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
