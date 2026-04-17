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

    // Get all plots for the cemetery
    const plots = await prisma.plot.findMany({
      where: { cemeteryId: user.cemetery.id },
      include: { booking: { select: { id: true, userId: true } } },
      orderBy: { plotNumber: 'asc' },
    });

    const stats = {
      total: plots.length,
      available: plots.filter(p => p.status === 'available').length,
      reserved: plots.filter(p => p.status === 'reserved').length,
      occupied: plots.filter(p => p.status === 'occupied').length,
    };

    return NextResponse.json(
      {
        plots,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get plots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
