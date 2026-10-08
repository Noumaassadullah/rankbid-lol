import { NextRequest, NextResponse } from 'next/server';
import { categoryFromSlug, categoryPath } from '@/lib/categories';

const ADMIN_EMAILS = [
  'assadullahnouman@gmail.com',
  'admin@rankbid.click',
];

// Indexable content pages, open to everyone (and search/AI crawlers) before launch.
// Matched exactly or as a path prefix ('/product' covers '/product/:id').
const PUBLIC_PAGES = [
  '/about',
  '/why',
  '/rules',
  '/faq',
  '/categories',
  '/platforms',
  '/product',
  '/leaderboard',
  '/today',
  '/daily',
  '/archive',
  '/stats',
];

const PUBLIC_ROUTES = [
  '/coming-soon',
  '/login',
  '/signup',
  '/admin',
  '/support', // shareable vote links: guests vote with name + email
  '/tos',
  '/privacy',
  '/cookies',
  '/api/waitlist',
  '/api/waitlist/count',
];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow static files from /public and metadata routes (robots.txt, sitemap.xml, llms.txt, icons, OG images)
  if (/\.(png|jpe?g|gif|svg|webp|ico|txt|xml|webmanifest)$/i.test(pathname) || /(^|\/)(opengraph-image|twitter-image|icon|apple-icon)(-\w+)?$/.test(pathname)) {
    return NextResponse.next();
  }

  // Old category links used ?category=AIMedia; the canonical page is /categories/ai-media.
  if (pathname === '/categories' && searchParams.get('category')) {
    const raw = searchParams.get('category')!;
    const category = categoryFromSlug(raw);
    const url = request.nextUrl.clone();
    url.pathname = category ? categoryPath(category) : '/categories';
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

  // (An ?adminKey= visit falls through so the admin cookie still gets set below.)
  if (!searchParams.has('adminKey') && (pathname === '/' || PUBLIC_PAGES.some(route => pathname === route || pathname.startsWith(`${route}/`)))) {
    return NextResponse.next();
  }

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
