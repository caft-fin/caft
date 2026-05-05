import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware/Proxy — runs server-side before page rendering.
 *
 * We use a lightweight cookie-based check:
 * - The client sets `caft_auth=1` when the user logs in (see apiClient.ts setTokens).
 * - If the cookie is missing, the user is redirected to login BEFORE the page renders.
 * - Full JWT verification happens server-side via the API client on data fetches.
 *
 * This prevents the flash-of-authenticated-UI for unauthenticated users.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin login page without auth
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protected route patterns
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isAdminRoute || isDashboardRoute) {
    const hasAuthCookie = request.cookies.get('caft_auth')?.value === '1';

    if (!hasAuthCookie) {
      const loginUrl = isAdminRoute
        ? new URL('/admin/login', request.url)
        : new URL('/login', request.url);

      // Store the original URL so we can redirect back after login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login pages
  const isLoginPage = pathname === '/login' || pathname === '/login/verify';
  if (isLoginPage) {
    const hasAuthCookie = request.cookies.get('caft_auth')?.value === '1';
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/login/verify',
  ],
};
