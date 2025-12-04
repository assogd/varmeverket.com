import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

/**
 * Get session (server-side proxy)
 * Forwards cookies from the client request to the backend API
 * GET /api/backend/session
 */
export async function GET(request: NextRequest) {
  try {
    // Get cookies from the incoming request header
    // Backend cookies are set for api.varmeverket.com, so they come in the Cookie header
    // from the browser's request to our Next.js server
    const cookieHeader = request.headers.get('cookie') || '';

    // Also check Next.js cookie store for any local cookies
    const cookieStore = await cookies();
    const localCookies = cookieStore.getAll();
    const localCookieHeader = localCookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    // Combine both cookie headers
    const combinedCookieHeader = [cookieHeader, localCookieHeader]
      .filter(Boolean)
      .join('; ');

    console.log('🔵 Server proxy - cookies received:', {
      fromHeader: cookieHeader,
      fromStore: localCookieHeader,
      combined: combinedCookieHeader,
      hasCookies: !!combinedCookieHeader,
    });

    // Make the session request to backend with forwarded cookies
    // Note: Backend cookies are set for api.varmeverket.com domain
    // They come in the Cookie header from the browser's request
    const response = await fetch(`${BACKEND_API_URL}/session`, {
      method: 'GET',
      headers: {
        ...(combinedCookieHeader ? { Cookie: combinedCookieHeader } : {}),
        'Content-Type': 'application/json',
      },
    });

    console.log('🔵 Server proxy - backend response:', {
      status: response.status,
      statusText: response.statusText,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // 401 or 400 can mean not logged in (backend might return 400 for invalid/missing session)
      if (response.status === 401 || response.status === 400) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated', data: null },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Session check failed',
          data: null,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

