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

  // Allow all routes - website is now live
  // All pages are publicly accessible
  return NextResponse.next();
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
