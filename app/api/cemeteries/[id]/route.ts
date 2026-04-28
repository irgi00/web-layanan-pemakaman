import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSql();
    const { id } = await params;

    const cemeteryResult = await sql`
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
        "contactPhone",
        status
      FROM "Cemetery"
      WHERE id = ${id}
      LIMIT 1
    `;
    const cemetery = cemeteryResult[0];

    if (!cemetery) {
      return NextResponse.json(
        { error: 'Cemetery not found' },
        { status: 404 }
      );
    }

    const plots = await sql`
      SELECT
        id,
        "plotNumber",
        section,
        "row",
        latitude,
        longitude,
        status,
        description,
        ${cemetery.pricePerPlot}::double precision AS price
      FROM "Plot"
      WHERE "cemeteryId" = ${id}
        AND status = 'available'
      ORDER BY section ASC, "row" ASC, "plotNumber" ASC
    `;

    const services = await sql`
      SELECT
        id,
        name,
        description,
        price,
        category,
        "isActive"
      FROM "Service"
      WHERE "cemeteryId" = ${id}
        AND "isActive" = true
      ORDER BY price ASC, name ASC
    `;

    const payload = {
      ...cemetery,
      plots,
      services,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Get cemetery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
