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
    const [emailSettled] = await Promise.allSettled([
      fetch(`${BACKEND_API_URL}/v2/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      }),
    ]);
    const emailResponse =
      emailSettled.status === 'fulfilled' ? emailSettled.value : null;

    // Try to get user data, but it may fail with 403 (API key cannot access /v2/users)
    // We'll handle this gracefully and treat user data as optional.
    let userResponse: PromiseSettledResult<Response> | null = null;
    let userData: unknown = null;
    let userError: string | null = null;
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

      if (userResponse.status === 'fulfilled') {
        const res = userResponse.value;
        if (res.ok) {
          try {
            const userJson = await res.json();
            userData = Array.isArray(userJson) ? userJson[0] : userJson;
          } catch (e) {
            userError = 'Failed to parse user data';
          }
        } else {
          userError = `User endpoint returned ${res.status} ${res.statusText}`;
        }
      } else {
        userError = userResponse.reason
          ? String(userResponse.reason)
          : 'User request failed';
      }
    } catch (e) {
      // Ignore - we'll show email status only
    }

    // Handle email response
    let emailStatus = null;
    let emailError: string | null = null;

    if (!emailResponse) {
      emailError =
        emailSettled.status === 'rejected'
          ? String(emailSettled.reason)
          : 'Email request failed';
    } else if (emailResponse.ok) {
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
      const is403 = emailResponse?.status === 403;
      const status = is403 ? 403 : 404;
      const message = is403
        ? 'The email endpoint returned 403 Forbidden. The API key may not have permission to access GET /v2/email. Use admin session (log in as staff) or ask the backend team to grant the API key access to this endpoint.'
        : `No email status found for ${email}. ${emailError || 'Email not registered in the system.'}`;
      return NextResponse.json(
        {
          error: is403 ? 'Forbidden' : 'User not found',
          message,
          details: { userError, emailError },
        },
        { status }
      );
    }
    
    // If user data failed with 403, add a helpful note
    if (userError && userError.includes('403')) {
      userError = 'User endpoint requires session authentication (not available with API key). Only email status is available.';
    }

    // Fetch Stripe subscription for this user (staff/API key lookup by email)
    // Backend may support GET /v3/users/subscription?email=... for staff; if not, we get 403/404 and show null
    let subscription: unknown = null;
    let subscriptionError: string | null = null;
    try {
      const subRes = await fetch(
        `${BACKEND_API_URL}/v3/users/${encodeURIComponent(email)}/subscription`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
          },
        }
      );
      if (subRes.ok) {
        const subJson = await subRes.json();
        subscription = Array.isArray(subJson) ? subJson : [subJson];
      } else {
        subscriptionError =
          subRes.status === 403 || subRes.status === 404
            ? 'Subscription lookup not available for this user or not supported with API key'
            : `Subscription endpoint returned ${subRes.status}`;
      }
    } catch (_e) {
      subscriptionError = 'Failed to fetch subscription';
    }

    return NextResponse.json({
      success: true,
      email,
      user: userData,
      emailStatus,
      subscription,
      subscriptionError: subscriptionError || null,
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
