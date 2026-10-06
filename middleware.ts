import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAILS = [
  'assadullahnouman@gmail.com',
  'admin@rankbid.click',
];

const PUBLIC_ROUTES = [
  '/coming-soon',
  '/login',
  '/signup',
  '/admin',
  '/api/waitlist',
  '/api/waitlist/count',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for admin key in query or cookie
  const adminKey = request.nextUrl.searchParams.get('adminKey') || request.cookies.get('adminKey')?.value;

  // Check for auth token (user logged in)
  const authToken = request.cookies.get('auth_token')?.value;

  // If user has valid admin key, allow access to full website
  if (adminKey && (adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY || adminKey === process.env.ADMIN_KEY)) {
    const response = NextResponse.next();
    response.cookies.set('adminKey', adminKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  }

  // If user has admin key cookie, allow access
  if (adminKey) {
    return NextResponse.next();
  }

  // For authenticated users (logged in), allow access
  if (authToken) {
    return NextResponse.next();
  }

  // Redirect non-authenticated users to coming-soon
  return NextResponse.redirect(new URL('/coming-soon', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
