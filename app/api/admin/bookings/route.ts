import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'CEMETERY_ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get user's cemetery
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { cemetery: true },
    });

    if (!user?.cemetery) {
      return NextResponse.json(
        { error: 'No cemetery assigned' },
        { status: 400 }
      );
    }

    // Get cemetery bookings with details
    const bookings = await prisma.booking.findMany({
      where: { cemeteryId: user.cemetery.id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phoneNumber: true } },
        plot: { select: { plotNumber: true, section: true } },
        deceasedProfile: true,
        serviceBookings: { include: { service: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
