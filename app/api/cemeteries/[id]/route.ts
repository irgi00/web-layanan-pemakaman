import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cemetery = await prisma.cemetery.findUnique({
      where: { id },
      include: {
        plots: {
          where: { status: 'available' },
          select: {
            id: true,
            plotNumber: true,
            section: true,
            row: true,
            latitude: true,
            longitude: true,
          },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
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

    return NextResponse.json(cemetery, { status: 200 });
  } catch (error) {
    console.error('Get cemetery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
