import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // Skip admin login page itself
  if (isAdminLogin) return NextResponse.next();

  // For protected routes, check if the user has a persisted auth state
  // The Zustand store persists to localStorage (not accessible in middleware),
  // so we check for the access token cookie / header as a lightweight guard.
  // Full auth verification happens client-side via the API client.
  if (isAdminRoute || isDashboardRoute) {
    // Check for access token in cookies (if we set one) or just let through
    // and let the client-side auth context handle redirection.
    // In production, you'd verify a JWT here. For now, the client-side
    // Zustand store + API client handles auth redirection on 401.
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
