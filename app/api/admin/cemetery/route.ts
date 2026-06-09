import { NextRequest, NextResponse } from 'next/server';
import { canAccessCemetery, getAdminActor, isSuperAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCemeteryImageSchema = z
  .object({
    cemeteryId: z.string().uuid().optional(),
    imageUrl: z.string().trim().max(2048, 'Image URL is too long').optional().or(z.literal('')),
  })
  .transform((data) => ({
    cemeteryId: data.cemeteryId,
    imageUrl: data.imageUrl?.trim() || null,
  }))
  .superRefine((data, ctx) => {
    if (!data.imageUrl) {
      return;
    }

    const isExternalUrl = /^https?:\/\//i.test(data.imageUrl);
    const isPublicPath = data.imageUrl.startsWith('/');

    if (!isExternalUrl && !isPublicPath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageUrl'],
        message: 'Gunakan URL http(s) atau path publik yang diawali /',
      });
    }
  });

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateCemeteryImageSchema.parse(body);

    const targetCemeteryId = isSuperAdmin(admin) ? data.cemeteryId : admin.cemeteryId;

    if (!targetCemeteryId) {
      return NextResponse.json(
        {
          error: isSuperAdmin(admin)
            ? 'Cemetery harus dipilih terlebih dahulu'
            : 'No cemetery assigned to this admin account',
        },
        { status: 400 }
      );
    }

    if (!canAccessCemetery(admin, targetCemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cemetery = await prisma.cemetery.findUnique({
      where: { id: targetCemeteryId },
      select: {
        id: true,
        name: true,
        location: true,
      },
    });

    if (!cemetery) {
      return NextResponse.json({ error: 'Cemetery not found' }, { status: 404 });
    }

    const updatedCemetery = await prisma.cemetery.update({
      where: { id: targetCemeteryId },
      data: {
        imageUrl: data.imageUrl,
      },
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        province: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(
      {
        cemetery: updatedCemetery,
        message: 'Gambar cemetery berhasil diperbarui',
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

    console.error('Update cemetery image error:', error);
    return NextResponse.json(
      { error: 'Failed to update cemetery image' },
      { status: 500 }
    );
  }
}
