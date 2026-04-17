import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

/**
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Mark notification as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: currentUser.userId,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json(
        { message: 'All notifications marked as read' },
        { status: 200 }
      );
    }

    if (notificationId) {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification || notification.userId !== currentUser.userId) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return NextResponse.json(
        { message: 'Notification marked as read' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'No notification ID provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
