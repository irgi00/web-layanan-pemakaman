import { NextRequest, NextResponse } from 'next/server';
import { removeAuthToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Berhasil keluar' },
      { status: 200 }
    );

    // Remove auth token
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
