import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { resetCemeteryAdminPasswordSchema } from '@/lib/superadmin-admins';
import { z } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminActor();

    if (!admin || !isSuperAdmin(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const targetAdmin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!targetAdmin || targetAdmin.role !== 'CEMETERY_ADMIN') {
      return NextResponse.json(
        { error: 'Cemetery Admin not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = resetCemeteryAdminPasswordSchema.parse(body);
    const passwordHash = await hashPassword(data.password);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: 'Password Cemetery Admin berhasil direset.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reset cemetery admin password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

