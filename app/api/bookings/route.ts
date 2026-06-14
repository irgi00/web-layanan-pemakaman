import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/jwt';
import { z } from 'zod';

const bookingPurposeSchema = z.enum([
  'CURRENT_BURIAL',
  'FUTURE_PREPARATION',
]);

const deceasedProfileInputSchema = z.object({
  fullName: z.string().max(160).optional(),
  gender: z.string().max(50).optional(),
  dateOfBirth: z.string().optional(),
  dateOfDeath: z.string().optional(),
  placeOfDeath: z.string().max(160).optional(),
  additionalNotes: z.string().max(1000).optional(),
});

const createBookingSchema = z
  .object({
    cemeteryId: z.string().uuid(),
    plotId: z.string().uuid(),
    deceasedProfileId: z.string().uuid().optional(),
    bookingPurpose: bookingPurposeSchema.default('FUTURE_PREPARATION'),
    deceasedProfile: deceasedProfileInputSchema.optional(),
    selectedServices: z
      .array(
        z.object({
          serviceId: z.string().uuid(),
          quantity: z.number().min(1),
        })
      )
      .optional(),
    notes: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.deceasedProfileId && value.deceasedProfile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile'],
        message:
          'Pilih salah satu sumber data almarhum/almarhumah, bukan keduanya sekaligus.',
      });
    }

    const hasInlineProfile = Boolean(value.deceasedProfile);
    const fullName = value.deceasedProfile?.fullName?.trim() || '';
    const dateOfBirth = value.deceasedProfile?.dateOfBirth?.trim() || '';
    const dateOfDeath = value.deceasedProfile?.dateOfDeath?.trim() || '';
    const gender = value.deceasedProfile?.gender?.trim() || '';
    const placeOfDeath = value.deceasedProfile?.placeOfDeath?.trim() || '';
    const additionalNotes = value.deceasedProfile?.additionalNotes?.trim() || '';
    const hasAnyInlineValue = [fullName, dateOfBirth, dateOfDeath, gender, placeOfDeath, additionalNotes].some(
      Boolean
    );

    if (
      value.bookingPurpose === 'CURRENT_BURIAL' &&
      !value.deceasedProfileId &&
      !hasInlineProfile
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile'],
        message:
          'Data almarhum/almarhumah perlu diisi untuk booking pemakaman saat ini.',
      });
    }

    if (!hasInlineProfile) {
      return;
    }

    if (!fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'fullName'],
        message: 'Nama lengkap almarhum/almarhumah wajib diisi.',
      });
    }

    if (value.bookingPurpose === 'CURRENT_BURIAL' && !dateOfDeath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'dateOfDeath'],
        message: 'Tanggal wafat wajib diisi untuk pemakaman saat ini.',
      });
    }

    const parsedBirth = parseOptionalDateInput(dateOfBirth);
    const parsedDeath = parseOptionalDateInput(dateOfDeath);

    if (dateOfBirth && !parsedBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'dateOfBirth'],
        message: 'Tanggal lahir tidak valid.',
      });
    }

    if (dateOfDeath && !parsedDeath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'dateOfDeath'],
        message: 'Tanggal wafat tidak valid.',
      });
    }

    if (parsedBirth && parsedDeath && parsedDeath < parsedBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'dateOfDeath'],
        message: 'Tanggal wafat tidak boleh lebih awal dari tanggal lahir.',
      });
    }

    if (
      value.bookingPurpose !== 'CURRENT_BURIAL' &&
      hasAnyInlineValue &&
      !dateOfDeath
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deceasedProfile', 'dateOfDeath'],
        message:
          'Tanggal wafat wajib diisi jika data almarhum/almarhumah ingin disimpan.',
      });
    }
  });

function parseOptionalDateInput(value?: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedDate = new Date(`${trimmedValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function splitFullName(fullName: string) {
  const normalizedName = fullName.trim().replace(/\s+/g, ' ');
  const [firstName, ...remainingParts] = normalizedName.split(' ');

  return {
    firstName,
    lastName: remainingParts.join(' '),
  };
}

function buildDeceasedBiography(input: z.infer<typeof deceasedProfileInputSchema>) {
  const lines = [
    input.gender?.trim()
      ? `Jenis kelamin: ${input.gender.trim()}`
      : null,
    input.placeOfDeath?.trim()
      ? `Tempat wafat: ${input.placeOfDeath.trim()}`
      : null,
    input.additionalNotes?.trim()
      ? `Catatan tambahan: ${input.additionalNotes.trim()}`
      : null,
  ].filter(Boolean);

  return lines.length > 0 ? lines.join('\n') : undefined;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Anda belum masuk' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: currentUser.userId },
      include: {
        cemetery: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
          },
        },
        plot: {
          select: {
            id: true,
            plotNumber: true,
            section: true,
            row: true,
            status: true,
          },
        },
        deceasedProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            dateOfDeath: true,
            biography: true,
          },
        },
        serviceBookings: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            proofUrl: true,
            rejectionReason: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[BOOKINGS][GET]', {
      currentUserId: currentUser.userId,
      bookingUserIds: bookings.map((booking) => ({
        bookingId: booking.id,
        booking_user_id: booking.userId,
      })),
    });

    return NextResponse.json(
      {
        bookings,
        stats: {
          total: bookings.length,
          active: bookings.filter((booking) =>
            ['PENDING', 'CONFIRMED'].includes(booking.status)
          ).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get member bookings error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Anda belum masuk' }, { status: 401 });
    }

    const body = await request.json();
    const data = createBookingSchema.parse(body);

    const plot = await prisma.plot.findUnique({
      where: { id: data.plotId },
      include: { booking: true, cemetery: true },
    });

    if (
      !plot ||
      plot.cemeteryId !== data.cemeteryId ||
      plot.status !== 'available' ||
      plot.booking
    ) {
      return NextResponse.json(
        { error: 'Lahan sudah tidak tersedia' },
        { status: 400 }
      );
    }

    let existingDeceasedProfileId: string | undefined = data.deceasedProfileId;

    if (existingDeceasedProfileId) {
      const deceasedProfile = await prisma.deceasedProfile.findUnique({
        where: { id: existingDeceasedProfileId },
        select: { id: true, userId: true },
      });

      if (!deceasedProfile || deceasedProfile.userId !== currentUser.userId) {
        return NextResponse.json(
          { error: 'Profil almarhum tidak valid untuk akun ini' },
          { status: 403 }
        );
      }
    }

    let totalPrice = plot.cemetery.pricePerPlot;
    const serviceBookingItems: Array<{
      serviceId: string;
      quantity: number;
      price: number;
    }> = [];

    if (data.selectedServices && data.selectedServices.length > 0) {
      for (const selectedService of data.selectedServices) {
        const service = await prisma.service.findUnique({
          where: { id: selectedService.serviceId },
        });

        if (
          !service ||
          service.cemeteryId !== data.cemeteryId ||
          !service.isActive
        ) {
          return NextResponse.json(
            { error: `Layanan ${selectedService.serviceId} tidak ditemukan` },
            { status: 400 }
          );
        }

        totalPrice += service.price * selectedService.quantity;
        serviceBookingItems.push({
          serviceId: service.id,
          quantity: selectedService.quantity,
          price: service.price,
        });
      }
    }

    const { booking, payment } = await prisma.$transaction(async (tx) => {
      let deceasedProfileId = existingDeceasedProfileId;

      if (!deceasedProfileId && data.deceasedProfile) {
        const normalizedProfile = {
          fullName: data.deceasedProfile.fullName?.trim() || '',
          gender: data.deceasedProfile.gender?.trim() || undefined,
          dateOfBirth: data.deceasedProfile.dateOfBirth?.trim() || undefined,
          dateOfDeath: data.deceasedProfile.dateOfDeath?.trim() || undefined,
          placeOfDeath: data.deceasedProfile.placeOfDeath?.trim() || undefined,
          additionalNotes:
            data.deceasedProfile.additionalNotes?.trim() || undefined,
        };
        const parsedDateOfDeath = parseOptionalDateInput(
          normalizedProfile.dateOfDeath
        );

        if (!normalizedProfile.fullName || !parsedDateOfDeath) {
          throw new Error(
            'Data almarhum/almarhumah belum lengkap untuk disimpan.'
          );
        }

        const parsedDateOfBirth = parseOptionalDateInput(
          normalizedProfile.dateOfBirth
        );
        const { firstName, lastName } = splitFullName(
          normalizedProfile.fullName
        );
        const deceasedProfile = await tx.deceasedProfile.create({
          data: {
            userId: currentUser.userId,
            firstName,
            lastName,
            dateOfBirth: parsedDateOfBirth,
            dateOfDeath: parsedDateOfDeath,
            biography: buildDeceasedBiography(normalizedProfile),
          },
          select: { id: true },
        });

        deceasedProfileId = deceasedProfile.id;
      }

      const booking = await tx.booking.create({
        data: {
          userId: currentUser.userId,
          cemeteryId: data.cemeteryId,
          plotId: data.plotId,
          deceasedProfileId,
          totalPrice,
          notes: data.notes,
          status: 'PENDING',
          serviceBookings: {
            create: serviceBookingItems.map((service) => ({
              serviceId: service.serviceId,
              quantity: service.quantity,
              price: service.price,
            })),
          },
        },
        include: {
          serviceBookings: {
            include: { service: true },
          },
        },
      });

      await tx.plot.update({
        where: { id: data.plotId },
        data: { status: 'reserved' },
      });

      await tx.cemetery.update({
        where: { id: data.cemeteryId },
        data: { availablePlots: { decrement: 1 } },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          status: 'PENDING',
        },
      });

      return { booking, payment };
    });

    console.log('[BOOKINGS][POST]', {
      currentUserId: currentUser.userId,
      bookingId: booking.id,
      booking_user_id: booking.userId,
      bookingPurpose: data.bookingPurpose,
      hasDeceasedProfile: Boolean(booking.deceasedProfileId),
    });

    return NextResponse.json(
      {
        message: 'Pemesanan berhasil dibuat',
        booking: {
          id: booking.id,
          totalPrice: booking.totalPrice,
          status: booking.status,
          deceasedProfileId: booking.deceasedProfileId,
        },
        payment: {
          id: payment.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
