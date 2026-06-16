import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/neon';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getSql();

    const [cemeteries, plots, services] = await Promise.all([
      sql`
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
      `,
      sql`
        SELECT
          id,
          "plotNumber",
          section,
          row,
          latitude,
          longitude,
          status,
          description
        FROM "Plot"
        WHERE "cemeteryId" = ${id}
          AND status = 'available'
        ORDER BY section ASC, row ASC, "plotNumber" ASC
      `,
      sql`
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
      `,
    ]);
    const cemetery = cemeteries[0];

    if (!cemetery) {
      return NextResponse.json(
        { error: 'Cemetery not found' },
        { status: 404 }
      );
    }

    const availablePlots = plots.map((plot) => ({
        ...plot,
        price: cemetery.pricePerPlot,
      }));

    return NextResponse.json(
      {
        ...cemetery,
        plots: availablePlots,
        services,
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
