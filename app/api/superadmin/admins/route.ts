import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAdminSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  password: z.string().min(6),
  cemeteryId: z.string().uuid(),
});

export async function GET() {
  try {
    const admin = await getAdminActor();

    if (!admin || !isSuperAdmin(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: { role: 'CEMETERY_ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cemeteryId: true,
        createdAt: true,
        cemetery: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return NextResponse.json({ admins }, { status: 200 });
  } catch (error) {
    console.error('Get cemetery admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin || !isSuperAdmin(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = createAdminSchema.parse(body);

    const cemetery = await prisma.cemetery.findUnique({
      where: { id: data.cemeteryId },
      select: { id: true, name: true },
    });

    if (!cemetery) {
      return NextResponse.json({ error: 'Cemetery not found' }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const createdAdmin = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        role: 'CEMETERY_ADMIN',
        cemeteryId: data.cemeteryId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cemeteryId: true,
        createdAt: true,
        cemetery: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        admin: createdAdmin,
        message: 'Cemetery Admin created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create cemetery admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
