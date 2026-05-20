import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { comparePassword } from '@/lib/auth';
import { createToken } from '@/lib/jwt';
import { getSql } from '@/lib/neon';
import { getRedirectPathByRole, isAdminRole } from '@/lib/roles';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const sql = getSql();
    const body = await request.json();
    const data = loginSchema.parse(body);

    const users = await sql`
      SELECT
        id,
        email,
        "firstName",
        "lastName",
        "passwordHash",
        role,
        "cemeteryId"
      FROM "User"
      WHERE email = ${data.email}
      LIMIT 1
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak valid' },
        { status: 401 }
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Akun ini tidak memiliki akses admin' },
        { status: 403 }
      );
    }

    const passwordMatch = await comparePassword(data.password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak valid' },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'Berhasil masuk sebagai admin',
        redirectTo: getRedirectPathByRole(user.role),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          cemeteryId: user.cemeteryId,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
