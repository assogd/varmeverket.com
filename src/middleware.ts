import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPathTheme } from '@/config/portalTheme';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const theme = getPathTheme(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-portal-theme', theme);

  // Return response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
