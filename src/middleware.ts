import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public admin pages and API auth routes
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/forgot-password') ||
    pathname.startsWith('/admin/reset-password') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Protect all /admin routes - just check if cookie exists
  // The actual verification happens on the page/API level
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value;

    // No token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists, allow access
    // The page will verify the token validity using the session API
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
