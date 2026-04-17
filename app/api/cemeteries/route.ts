import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const cemeteries = await prisma.cemetery.findMany({
      where: { status: 'active' },
      skip,
      take: limit,
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
      },
    });

    const total = await prisma.cemetery.count({
      where: { status: 'active' },
    });

    return NextResponse.json(
      {
        cemeteries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cemeteries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
