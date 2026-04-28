import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const sql = getSql();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const cemeteries = await sql`
      SELECT
        id,
        name,
        location,
        latitude,
        longitude,
        description,
        "totalPlots",
        "availablePlots",
        "pricePerPlot",
        "imageUrl",
        "contactEmail",
        "contactPhone"
      FROM "Cemetery"
      WHERE status = 'active'
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `;

    const totalResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM "Cemetery"
      WHERE status = 'active'
    `;
    const total = totalResult[0]?.total ?? 0;

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
