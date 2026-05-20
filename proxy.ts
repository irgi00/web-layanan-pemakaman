import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getRedirectPathByRole } from '@/lib/roles';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';

async function getCurrentRole(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    return typeof verified.payload.role === 'string' ? verified.payload.role : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await getCurrentRole(request);
  const redirectTo = role ? getRedirectPathByRole(role) : null;

  if (pathname === '/login' || pathname === '/admin/login') {
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!role) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (redirectTo !== '/admin/dashboard') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (redirectTo === '/admin/dashboard') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/dashboard', '/dashboard/:path*'],
};
