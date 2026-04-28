import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminActor } from '@/lib/admin';
import { getSql } from '@/lib/neon';

const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional().or(z.literal('')),
  price: z.coerce.number().nonnegative('Price must be zero or greater'),
  category: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const sql = getSql();
    const services = admin.cemeteryId
      ? await sql`
          SELECT
            id,
            name,
            description,
            price,
            category,
            "isActive",
            "cemeteryId",
            "createdAt",
            "updatedAt"
          FROM "Service"
          WHERE "cemeteryId" = ${admin.cemeteryId}
          ORDER BY name ASC
        `
      : await sql`
          SELECT
            id,
            name,
            description,
            price,
            category,
            "isActive",
            "cemeteryId",
            "createdAt",
            "updatedAt"
          FROM "Service"
          ORDER BY name ASC
        `;

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error('Get admin services error:', error);
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

    if (!admin.cemeteryId) {
      return NextResponse.json(
        { error: 'No cemetery assigned to this admin account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = serviceSchema.parse(body);
    const sql = getSql();

    const inserted = await sql`
      INSERT INTO "Service" (
        id,
        "cemeteryId",
        name,
        description,
        price,
        category,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${admin.cemeteryId},
        ${data.name},
        ${data.description?.trim() || null},
        ${data.price},
        ${data.category?.trim() || 'general'},
        ${data.isActive},
        NOW(),
        NOW()
      )
      RETURNING
        id,
        name,
        description,
        price,
        category,
        "isActive",
        "cemeteryId",
        "createdAt",
        "updatedAt"
    `;

    return NextResponse.json(
      { service: inserted[0], message: 'Service created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create admin service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
