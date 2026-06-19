import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if we are trying to access admin dashboard routes
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('parkping_admin_token')?.value;

    // Redirect to login if no token is found
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware to all admin paths
export const config = {
  matcher: ['/admin/:path*'],
};
