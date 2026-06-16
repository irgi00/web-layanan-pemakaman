import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);
    const limitParam = Number.parseInt(searchParams.get('limit') || '10', 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;
    const skip = (page - 1) * limit;

    const country = searchParams.get('country')?.trim() || null;
    const island = searchParams.get('island')?.trim() || null;
    const province = searchParams.get('province')?.trim() || null;
    const city = searchParams.get('city')?.trim() || null;
    const sql = getSql();

    const [cemeteries, totalRows] = await Promise.all([
      sql`
        SELECT
          id,
          name,
          location,
          address,
          country,
          island,
          province,
          city,
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
          AND (${country}::text IS NULL OR country = ${country})
          AND (${island}::text IS NULL OR island = ${island})
          AND (${province}::text IS NULL OR province = ${province})
          AND (${city}::text IS NULL OR city = ${city})
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `,
      sql`
        SELECT COUNT(*)::int AS total
        FROM "Cemetery"
        WHERE status = 'active'
          AND (${country}::text IS NULL OR country = ${country})
          AND (${island}::text IS NULL OR island = ${island})
          AND (${province}::text IS NULL OR province = ${province})
          AND (${city}::text IS NULL OR city = ${city})
      `,
    ]);
    const total = totalRows[0]?.total ?? 0;

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
