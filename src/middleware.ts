import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Hide /admin route in production by redirecting to a non-existent route
  // This will trigger the frontend's not-found page instead of the CMS not-found
  if (
    process.env.NODE_ENV === 'production' &&
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    // Redirect to a non-existent route to trigger frontend not-found
    // This ensures the frontend's not-found page is shown, not the CMS one
    return NextResponse.redirect(
      new URL('/this-page-does-not-exist', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
