// ─────────────────────────────────────────────────────────
// CAFT — Auth API Proxy Route Handler
//
// Why this file exists:
//   Next.js `rewrites` in next.config.ts proxy /api/* to the
//   Express backend server-to-server.  That works for most calls,
//   but the spec disallows Set-Cookie headers in a rewrite
//   response — the browser never receives the httpOnly
//   `caft_access` / `caft_refresh` cookies the backend sets on
//   login, OTP verify, and token refresh.
//
//   This App Router Route Handler takes priority over the rewrite
//   for all /api/auth/* paths and manually copies every Set-Cookie
//   value from the backend response into the NextResponse, so the
//   browser gets the cookies it needs.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

// ── Config ────────────────────────────────────────────────

const BACKEND = process.env.BACKEND_URL ?? 'http://127.0.0.1:5000';

/** Never cache auth responses. */
export const dynamic = 'force-dynamic';

// ── Core proxy ────────────────────────────────────────────

// In Next.js 15+, dynamic route params are a Promise.
type AuthRouteCtx = { params: Promise<{ path: string[] }> };

async function proxyAuth(
  req: NextRequest,
  ctx: AuthRouteCtx,
): Promise<NextResponse> {
  // Build the upstream URL
  const { path } = await ctx.params;
  const suffix = path.join('/');
  const qs = req.nextUrl.search; // includes leading '?' if present
  const upstream = `${BACKEND}/api/auth/${suffix}${qs}`;

  // Assemble forwarded headers — pass cookies and content-type through
  const fwdHeaders: Record<string, string> = {};

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) fwdHeaders['cookie'] = cookieHeader;

  const contentType = req.headers.get('content-type');
  if (contentType) fwdHeaders['content-type'] = contentType;

  const authorization = req.headers.get('authorization');
  if (authorization) fwdHeaders['authorization'] = authorization;

  // Forward real-IP so backend rate-limiting / audit logging works
  const forwarded = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip');
  if (forwarded) fwdHeaders['x-forwarded-for'] = forwarded;

  // Read body for non-safe methods
  let body: BodyInit | undefined;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) {
    body = await req.text();
  }

  // ── Hit the backend ──────────────────────────────────────
  let backendRes: Response;
  try {
    backendRes = await fetch(upstream, {
      method: req.method,
      headers: fwdHeaders,
      body,
      redirect: 'manual', // handle redirects ourselves (Google OAuth)
    });
  } catch (err) {
    console.error('[Auth Proxy] Backend unreachable at', upstream, err);
    return NextResponse.json(
      { success: false, message: 'Authentication service is temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }

  // ── Handle 3xx (Google OAuth redirects) ─────────────────
  if (backendRes.status >= 300 && backendRes.status < 400) {
    const location = backendRes.headers.get('location') ?? '/';
    const res = NextResponse.redirect(location, { status: backendRes.status });
    copySetCookieHeaders(backendRes, res);
    return res;
  }

  // ── Build the proxy response ─────────────────────────────
  const responseBody = await backendRes.text();
  const res = new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: {
      'content-type': backendRes.headers.get('content-type') ?? 'application/json',
    },
  });

  // ── THE KEY PART: forward all Set-Cookie headers ─────────
  // NextResponse strips them; we put them back one by one.
  copySetCookieHeaders(backendRes, res);

  return res;
}

// ── Helper ────────────────────────────────────────────────

/**
 * Copy every `Set-Cookie` header from a fetch `Response` into a
 * `NextResponse`.  Uses `getSetCookie()` (Node 18+ / WinterCG) for
 * proper multi-value handling, with a fallback for older runtimes.
 */
function copySetCookieHeaders(from: Response, to: NextResponse): void {
  // getSetCookie() returns each cookie as a separate string — unlike
  // headers.get('set-cookie') which concatenates them and loses info.
  const h = from.headers as Headers & { getSetCookie?: () => string[] };
  const cookies: string[] = typeof h.getSetCookie === 'function'
    ? h.getSetCookie()
    : [];

  // Fallback for runtimes that don't support getSetCookie yet
  if (cookies.length === 0) {
    const raw = from.headers.get('set-cookie');
    if (raw) cookies.push(raw);
  }

  for (const cookie of cookies) {
    to.headers.append('set-cookie', cookie);
  }
}

// ── Export all HTTP methods ───────────────────────────────

export const GET     = proxyAuth;
export const POST    = proxyAuth;
export const PUT     = proxyAuth;
export const PATCH   = proxyAuth;
export const DELETE  = proxyAuth;
export const OPTIONS = proxyAuth;
