import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const country = searchParams.get('country') || undefined;
    const island = searchParams.get('island') || undefined;
    const province = searchParams.get('province') || undefined;
    const city = searchParams.get('city') || undefined;

    const where: any = { status: 'active' };
    if (country) where.country = country;
    if (island) where.island = island;
    if (province) where.province = province;
    if (city) where.city = city;

    const [cemeteries, total] = await Promise.all([
      prisma.cemetery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          location: true,
          address: true,
          country: true,
          island: true,
          province: true,
          city: true,
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
      }),
      prisma.cemetery.count({ where }),
    ]);

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
