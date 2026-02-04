/**
 * Admin API route to fetch form submissions
 * Uses server-side API key authentication
 *
 * GET /api/admin/form-submissions?formSlug=<slug>
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
    const formSlug = searchParams.get('formSlug');
    const includeArchived = searchParams.get('archived') === '1';

    if (!formSlug) {
      return NextResponse.json(
        { error: 'formSlug parameter is required' },
        { status: 400 }
      );
    }

    // Build URL
    const url = includeArchived
      ? `${BACKEND_API_URL}/v3/forms/${formSlug}?archived=1`
      : `${BACKEND_API_URL}/v3/forms/${formSlug}`;

    // Create HTTP Basic Auth header
    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');

    console.log('🔐 Fetching form submissions with API key:', {
      formSlug,
      includeArchived,
      url,
      hasCredentials: !!credentials,
    });

    // Fetch from backend API with API key authentication
    // Note: GET requests typically don't need Content-Type header
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const responseText = await response.text();
    let errorData: unknown = { message: response.statusText };

    try {
      errorData = JSON.parse(responseText);
    } catch {
      // If response is not JSON, use the text as error message
      errorData = { message: responseText || response.statusText };
    }

    if (!response.ok) {
      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url,
      });
      return NextResponse.json(
        {
          error: 'Failed to fetch form submissions',
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

    let submissions: unknown;
    try {
      submissions = JSON.parse(responseText);
    } catch {
      submissions = responseText;
    }

    console.log('✅ Form submissions fetched:', {
      formSlug,
      count: Array.isArray(submissions) ? submissions.length : 0,
    });

    return NextResponse.json({
      success: true,
      formSlug,
      submissions: Array.isArray(submissions) ? submissions : [submissions],
      count: Array.isArray(submissions) ? submissions.length : 1,
    });
  } catch (error) {
    console.error('❌ Error fetching form submissions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch form submissions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
