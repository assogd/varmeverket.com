/**
 * Admin API route to fetch bookings
 * Uses server-side API key authentication
 *
 * GET /api/admin/bookings?email=<email>
 * GET /api/admin/bookings?space=<space>
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

// API key credentials (should be in environment variables)
const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!API_KEY_USERNAME || !API_KEY_PASSWORD) {
      console.error('❌ API key not configured');
      return NextResponse.json(
        {
          error: 'API key not configured',
          message:
            'BACKEND_API_KEY_USERNAME and BACKEND_API_KEY_PASSWORD must be set in environment variables',
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const space = searchParams.get('space');

    // Create HTTP Basic Auth header
    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');

    let url: string;
    
    if (email) {
      // Get bookings for a specific user
      // Note: /v2/bookings requires session auth (user's own bookings)
      // API key might not have access to this endpoint
      url = `${BACKEND_API_URL}/v2/bookings?email=${encodeURIComponent(email)}`;
    } else if (space) {
      // Get public calendar for a space (v3 is public, no auth needed)
      url = `${BACKEND_API_URL}/v3/bookings?space=${encodeURIComponent(space)}`;
    } else {
      // Get multi-space calendar (all spaces) - public endpoint
      url = `${BACKEND_API_URL}/v3/bookings`;
    }

    console.log('🔐 Fetching bookings:', { email, space, url });

    // Build headers
    // For /v2/bookings, try with API key (might not work - requires session)
    // For /v3/bookings, no auth needed (public endpoint)
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    
    // Only use API key for /v2/bookings (user bookings)
    // /v3/bookings is public and doesn't need auth
    if (email) {
      headers.Authorization = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const responseText = await response.text();
    let errorData: unknown = { message: response.statusText };

    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { message: responseText || response.statusText };
    }

    if (!response.ok) {
      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url,
      });
      
      // Special handling for 403 on /v2/bookings
      if (response.status === 403 && email) {
        return NextResponse.json(
          {
            error: 'Permission denied',
            message:
              'The /v2/bookings endpoint requires session authentication (user must be logged in). The API key does not have access to user-specific bookings. Try using the "By Space" or "All Bookings" options instead, which use the public /v3/bookings endpoint.',
            status: response.status,
            suggestion: 'Use "By Space" or "All Bookings" search types for admin access',
          },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Failed to fetch bookings',
          message:
            (errorData as { message?: string })?.message ||
            response.statusText ||
            'Unknown error',
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    let bookings: unknown;
    try {
      bookings = JSON.parse(responseText);
    } catch {
      bookings = responseText;
    }

    console.log('✅ Bookings fetched:', {
      count: Array.isArray(bookings) ? bookings.length : 0,
    });

    return NextResponse.json({
      success: true,
      bookings: Array.isArray(bookings) ? bookings : [bookings],
      count: Array.isArray(bookings) ? bookings.length : 1,
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
