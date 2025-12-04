import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

/**
 * Sign on proxy (server-side)
 * Forwards sign-on requests to the backend API to avoid CORS issues
 * POST /api/backend/sign-on
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, redirect } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Build the redirect URL if provided
    const redirectParam = redirect
      ? `?redirect=${encodeURIComponent(redirect)}`
      : '';

    // Forward the request to backend API
    const response = await fetch(
      `${BACKEND_API_URL}/session/sign-on${redirectParam}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || 'Sign-on request failed',
          ...data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Sign-on proxy error:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

