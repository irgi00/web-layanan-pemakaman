import { NextRequest, NextResponse } from 'next/server';
import { canAccessCemetery, getAdminActor, getScopedCemeteryId } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPlotSchema = z.object({
  cemeteryId: z.string().uuid().optional(),
  plotNumber: z.string().trim().min(1),
  section: z.string().trim().min(1),
  row: z.string().trim().min(1),
  status: z.enum(['available', 'booked', 'reserved', 'occupied']).default('available'),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const requestedCemeteryId = request.nextUrl.searchParams.get('cemeteryId');
    const scopedCemeteryId = getScopedCemeteryId(admin, requestedCemeteryId);

    if (!scopedCemeteryId && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No cemetery assigned to this admin account' },
        { status: 400 }
      );
    }

    if (requestedCemeteryId && !canAccessCemetery(admin, requestedCemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plots = await prisma.plot.findMany({
      where: scopedCemeteryId ? { cemeteryId: scopedCemeteryId } : undefined,
      include: {
        booking: { select: { id: true, userId: true } },
        cemetery: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: [{ cemeteryId: 'asc' }, { plotNumber: 'asc' }],
    });

    const stats = {
      total: plots.length,
      available: plots.filter((plot) => plot.status === 'available').length,
      booked: plots.filter((plot) => plot.status === 'booked').length,
      reserved: plots.filter((plot) => plot.status === 'reserved').length,
      occupied: plots.filter((plot) => plot.status === 'occupied').length,
    };

    return NextResponse.json({ plots, stats }, { status: 200 });
  } catch (error) {
    console.error('Get plots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const data = createPlotSchema.parse(body);
    const cemeteryId = getScopedCemeteryId(admin, data.cemeteryId);

    if (!cemeteryId) {
      return NextResponse.json(
        { error: 'Cemetery is required' },
        { status: 400 }
      );
    }

    if (!canAccessCemetery(admin, cemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cemetery = await prisma.cemetery.findUnique({
      where: { id: cemeteryId },
      select: { id: true },
    });

    if (!cemetery) {
      return NextResponse.json({ error: 'Cemetery not found' }, { status: 404 });
    }

    const plot = await prisma.plot.create({
      data: {
        cemeteryId,
        plotNumber: data.plotNumber,
        section: data.section,
        row: data.row,
        status: data.status,
      },
      include: {
        cemetery: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(
      { plot, message: 'Plot created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create plot error:', error);
    return NextResponse.json(
      { error: 'Failed to create plot. Plot number may already exist.' },
      { status: 400 }
    );
  }
}
