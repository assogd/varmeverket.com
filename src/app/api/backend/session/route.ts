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
    // Get cookies from the incoming request
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    console.log('🔵 Server proxy - cookies received:', {
      count: allCookies.length,
      names: allCookies.map(c => c.name),
      hasCookieHeader: !!cookieHeader,
    });

    // Make the session request to backend with forwarded cookies
    const response = await fetch(`${BACKEND_API_URL}/session`, {
      method: 'GET',
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        'Content-Type': 'application/json',
      },
    });

    console.log('🔵 Server proxy - backend response:', {
      status: response.status,
      statusText: response.statusText,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // 401 is expected if not logged in
      if (response.status === 401) {
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

