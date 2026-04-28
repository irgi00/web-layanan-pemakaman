import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminActor } from '@/lib/admin';
import { getSql } from '@/lib/neon';

const serviceUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional().or(z.literal('')),
  price: z.coerce.number().nonnegative('Price must be zero or greater'),
  category: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

async function getServiceForAdmin(serviceId: string) {
  const admin = await getAdminActor();

  if (!admin) {
    return { admin: null, service: null };
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
          "cemeteryId"
        FROM "Service"
        WHERE id = ${serviceId}
          AND "cemeteryId" = ${admin.cemeteryId}
        LIMIT 1
      `
    : await sql`
        SELECT
          id,
          name,
          description,
          price,
          category,
          "isActive",
          "cemeteryId"
        FROM "Service"
        WHERE id = ${serviceId}
        LIMIT 1
      `;

  return {
    admin,
    service: services[0] ?? null,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin, service } = await getServiceForAdmin(id);

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = serviceUpdateSchema.parse(body);
    const sql = getSql();

    const updated = await sql`
      UPDATE "Service"
      SET
        name = ${data.name},
        description = ${data.description?.trim() || null},
        price = ${data.price},
        category = ${data.category?.trim() || 'general'},
        "isActive" = ${data.isActive},
        "updatedAt" = NOW()
      WHERE id = ${id}
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
      { service: updated[0], message: 'Service updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update admin service error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin, service } = await getServiceForAdmin(id);

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const sql = getSql();

    await sql`
      DELETE FROM "Service"
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin service error:', error);
    return NextResponse.json(
      {
        error:
          'Failed to delete service. It may still be referenced by an existing booking.',
      },
      { status: 400 }
    );
  }
}
