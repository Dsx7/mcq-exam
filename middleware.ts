import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

/**
 * Middleware uses ONLY the edge-safe authConfig (no mongoose, no bcryptjs).
 * JWT verification is handled internally by NextAuth using the NEXTAUTH_SECRET.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public paths — no auth required
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/exam/') ||
    pathname.startsWith('/api/exam/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/seed');

  if (isPublic) return NextResponse.next();

  // Not logged in → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = session.user?.role;

  // Role-based page guards
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (pathname.startsWith('/teacher') && role !== 'teacher') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based API guards
  if (pathname.startsWith('/api/admin') && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  if (pathname.startsWith('/api/teacher') && role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads/).*)'],
};
