import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { canAccessCemetery, getAdminActor, getScopedCemeteryId } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminActor();

    if (!admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const requestedCemeteryId = request.nextUrl.searchParams.get('cemeteryId');
    const requestedStatus = request.nextUrl.searchParams.get('status');
    const requestedSort = request.nextUrl.searchParams.get('sort');
    const scopedCemeteryId = getScopedCemeteryId(admin, requestedCemeteryId);
    const sortDirection = requestedSort === 'newest' ? 'newest' : 'oldest';
    const paymentStatusFilter: PaymentStatus | null =
      requestedStatus &&
      ['PENDING', 'PENDING_VERIFICATION', 'COMPLETED', 'FAILED', 'REJECTED', 'REFUNDED'].includes(
        requestedStatus
      )
        ? (requestedStatus as PaymentStatus)
        : null;

    if (requestedCemeteryId && !canAccessCemetery(admin, requestedCemeteryId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!scopedCemeteryId && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No cemetery assigned to this admin account' },
        { status: 400 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        ...(scopedCemeteryId ? { booking: { is: { cemeteryId: scopedCemeteryId } } } : {}),
        ...(paymentStatusFilter ? { status: paymentStatusFilter } : {}),
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            cemetery: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
            plot: {
              select: {
                id: true,
                plotNumber: true,
                section: true,
                row: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const sortedPayments = [...payments].sort((left, right) => {
      const leftSubmittedAt =
        left.paymentSubmittedAt?.getTime() ?? left.createdAt.getTime();
      const rightSubmittedAt =
        right.paymentSubmittedAt?.getTime() ?? right.createdAt.getTime();

      if (leftSubmittedAt !== rightSubmittedAt) {
        return sortDirection === 'newest'
          ? rightSubmittedAt - leftSubmittedAt
          : leftSubmittedAt - rightSubmittedAt;
      }

      return sortDirection === 'newest'
        ? right.createdAt.getTime() - left.createdAt.getTime()
        : left.createdAt.getTime() - right.createdAt.getTime();
    });

    return NextResponse.json(
      {
        payments: sortedPayments,
        stats: {
          total: sortedPayments.length,
          pendingVerification: sortedPayments.filter(
            (payment) => payment.status === 'PENDING_VERIFICATION'
          ).length,
          completed: sortedPayments.filter((payment) => payment.status === 'COMPLETED').length,
          rejected: sortedPayments.filter((payment) => payment.status === 'REJECTED').length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
