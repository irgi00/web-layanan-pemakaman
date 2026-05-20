import { NextRequest, NextResponse } from 'next/server';
import { canAccessCemetery, getAdminActor } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePlotSchema = z.object({
  plotNumber: z.string().trim().min(1).optional(),
  section: z.string().trim().min(1).optional(),
  row: z.string().trim().min(1).optional(),
  status: z.enum(['available', 'booked', 'reserved', 'occupied']).optional(),
});

async function getScopedPlot(id: string) {
  const admin = await getAdminActor();

  if (!admin) {
    return { admin: null, plot: null };
  }

  const plot = await prisma.plot.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          id: true,
        },
      },
      cemetery: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });

  if (!plot || !canAccessCemetery(admin, plot.cemeteryId)) {
    return { admin, plot: null };
  }

  return { admin, plot };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin, plot } = await getScopedPlot(id);

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updatePlotSchema.parse(body);

    const updatedPlot = await prisma.plot.update({
      where: { id },
      data: {
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
      { plot: updatedPlot, message: 'Plot updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update plot error:', error);
    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin, plot } = await getScopedPlot(id);

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    if (plot.booking) {
      return NextResponse.json(
        { error: 'Plot cannot be deleted because it already has a booking' },
        { status: 400 }
      );
    }

    await prisma.plot.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Plot deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete plot error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plot' },
      { status: 400 }
    );
  }
}
