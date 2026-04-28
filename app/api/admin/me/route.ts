import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { getSql } from '@/lib/neon';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sql = getSql();
    const users = await sql`
      SELECT
        id,
        email,
        "firstName",
        "lastName",
        "phoneNumber",
        role,
        "cemeteryId",
        "createdAt"
      FROM "User"
      WHERE id = ${currentUser.userId}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'CEMETERY_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Get admin user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
