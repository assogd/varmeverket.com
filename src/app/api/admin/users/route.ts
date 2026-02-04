/**
 * Admin API route to fetch user data and email status
 * Uses server-side API key authentication
 *
 * GET /api/admin/users?email=<email>
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

    if (!email) {
      return NextResponse.json(
        { error: 'email parameter is required' },
        { status: 400 }
      );
    }

    // Create HTTP Basic Auth header
    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');

    // Fetch email status (this works with API key)
    // Note: /v2/users/:email requires session auth, not API key
    // So we'll only fetch email status which the API key can access
    const [emailResponse] = await Promise.allSettled([
      fetch(`${BACKEND_API_URL}/v2/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      }),
    ]);
    
    // Try to get user data, but it will likely fail with 403
    // We'll handle this gracefully
    let userResponse: PromiseSettledResult<Response> | null = null;
    try {
      userResponse = await Promise.allSettled([
        fetch(`${BACKEND_API_URL}/v2/users/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
          },
        }),
      ]).then(results => results[0]);
    } catch (e) {
      // Ignore - we'll show email status only
    }

    // Handle email response
    let emailStatus = null;
    let emailError: string | null = null;

    if (emailResponse.ok) {
      try {
        const emailData = await emailResponse.json();
        emailStatus = Array.isArray(emailData) ? emailData[0] : emailData;
      } catch (e) {
        emailError = 'Failed to parse email status';
      }
    } else {
      const errorText = await emailResponse.text().catch(() => '');
      try {
        const errorJson = JSON.parse(errorText);
        emailError = errorJson.message || `Email endpoint returned ${emailResponse.status}`;
      } catch {
        emailError = `Email endpoint returned ${emailResponse.status}: ${errorText || emailResponse.statusText}`;
      }
      console.log('⚠️ Email endpoint response:', {
        status: emailResponse.status,
        error: emailError,
      });
    }

    // If email status failed, return error
    // User data is optional (requires session auth, not API key)
    if (!emailStatus) {
      return NextResponse.json(
        {
          error: 'User not found',
          message: `No email status found for ${email}. ${emailError || 'Email not registered in the system.'}`,
          details: { userError, emailError },
        },
        { status: 404 }
      );
    }
    
    // If user data failed with 403, add a helpful note
    if (userError && userError.includes('403')) {
      userError = 'User endpoint requires session authentication (not available with API key). Only email status is available.';
    }

    return NextResponse.json({
      success: true,
      email,
      user: userData,
      emailStatus,
      warnings: {
        userError: userError || null,
        emailError: emailError || null,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
