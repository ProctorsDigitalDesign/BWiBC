import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'wibc_tool_auth';

// Public routes that do NOT require the tool password
const PUBLIC_PATHS = [
  '/login',
  '/waitlist',
  '/api/auth',         // the auth endpoint itself
  '/api/stripe',       // Stripe webhook / checkout (must remain public)
  '/_next',            // Next.js assets
  '/favicon.ico',
  '/LOGO.webp',
  '/background-waitlist.png',
  '/waitlist-background.png',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through unconditionally
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check for the authentication cookie
  const authCookie = request.cookies.get(COOKIE_NAME);

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to /login with the original path as a query param so
    // we can send the user back after successful authentication.
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
