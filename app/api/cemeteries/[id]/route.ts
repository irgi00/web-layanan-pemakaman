import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cemetery = await prisma.cemetery.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        latitude: true,
        longitude: true,
        description: true,
        totalPlots: true,
        availablePlots: true,
        pricePerPlot: true,
        imageUrl: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        plots: {
          orderBy: [
            { section: 'asc' },
            { row: 'asc' },
            { plotNumber: 'asc' },
          ],
          select: {
            id: true,
            plotNumber: true,
            section: true,
            row: true,
            latitude: true,
            longitude: true,
            status: true,
            description: true,
          },
        },
        services: {
          where: { isActive: true },
          orderBy: [{ price: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            isActive: true,
          },
        },
      },
    });

    if (!cemetery) {
      return NextResponse.json(
        { error: 'Cemetery not found' },
        { status: 404 }
      );
    }

    const plots = cemetery.plots
      .filter((plot) => plot.status === 'available')
      .map((plot) => ({
        ...plot,
        price: cemetery.pricePerPlot,
      }));

    return NextResponse.json(
      {
        ...cemetery,
        plots,
        services: cemetery.services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cemetery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
