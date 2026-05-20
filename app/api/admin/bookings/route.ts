import { NextRequest, NextResponse } from 'next/server';
import { canAccessCemetery, getAdminActor, getScopedCemeteryId } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const requestedCemeteryId = request.nextUrl.searchParams.get('cemeteryId');
    const scopedCemeteryId = getScopedCemeteryId(admin, requestedCemeteryId);

    if (requestedCemeteryId && !canAccessCemetery(admin, requestedCemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!scopedCemeteryId && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No cemetery assigned to this admin account' },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: scopedCemeteryId ? { cemeteryId: scopedCemeteryId } : undefined,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        cemetery: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        plot: {
          select: {
            id: true,
            plotNumber: true,
            section: true,
            row: true,
          },
        },
        deceasedProfile: true,
        serviceBookings: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        bookings,
        stats: {
          total: bookings.length,
          totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
