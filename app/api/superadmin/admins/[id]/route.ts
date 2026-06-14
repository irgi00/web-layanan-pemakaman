import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import {
  cemeteryAdminSelect,
  normalizeCemeteryId,
  updateCemeteryAdminSchema,
} from '@/lib/superadmin-admins';
import { z } from 'zod';

async function getValidatedAdminTarget(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      cemeteryId: true,
      _count: {
        select: {
          auditLogs: true,
          bookings: true,
          deceasedProfiles: true,
          notifications: true,
        },
      },
    },
  });
}

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
    const targetAdmin = await getValidatedAdminTarget(id);

    if (!targetAdmin || targetAdmin.role !== 'CEMETERY_ADMIN') {
      return NextResponse.json(
        { error: 'Cemetery Admin not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateCemeteryAdminSchema.parse(body);
    const cemeteryId = normalizeCemeteryId(data.cemeteryId);

    if (cemeteryId) {
      const cemetery = await prisma.cemetery.findUnique({
        where: { id: cemeteryId },
        select: { id: true },
      });

      if (!cemetery) {
        return NextResponse.json({ error: 'Cemetery not found' }, { status: 404 });
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, role: true },
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 409 }
      );
    }

    const nextPassword = data.password?.trim() ? data.password : null;
    const passwordHash = nextPassword ? await hashPassword(nextPassword) : undefined;

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        cemeteryId,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: cemeteryAdminSelect,
    });

    return NextResponse.json(
      {
        admin: updatedAdmin,
        message: nextPassword
          ? 'Cemetery Admin updated and password changed successfully'
          : 'Cemetery Admin updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update cemetery admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminActor();

    if (!admin || !isSuperAdmin(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (id === admin.id) {
      return NextResponse.json(
        { error: 'Super Admin tidak dapat menghapus akunnya sendiri.' },
        { status: 400 }
      );
    }

    const targetAdmin = await getValidatedAdminTarget(id);

    if (!targetAdmin || targetAdmin.role !== 'CEMETERY_ADMIN') {
      return NextResponse.json(
        { error: 'Cemetery Admin not found' },
        { status: 404 }
      );
    }

    const hasRelatedData =
      targetAdmin._count.auditLogs > 0 ||
      targetAdmin._count.bookings > 0 ||
      targetAdmin._count.deceasedProfiles > 0 ||
      targetAdmin._count.notifications > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error:
            'Admin ini memiliki riwayat data terkait. Hapus permanen diblokir agar histori tetap aman.',
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Cemetery Admin deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete cemetery admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

