/**
 * Admin API route to fetch user data and email status
 * Uses server-side API key authentication
 *
 * GET /api/admin/users?email=<email>
 *
 * Form submissions: only from GET /v3/users/:email (API_GUIDE §3.5) —
 * form_submissions on the aggregated user payload. No per-form sweep.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

/**
 * Extract form_submissions from GET /v3/users/:email response (array or object).
 */
function extractFormSubmissionsFromV3(row: unknown): unknown[] {
  if (!row || typeof row !== 'object') return [];
  const o = row as Record<string, unknown>;
  const keys = ['form_submissions', 'formSubmissions', 'submissions'] as const;
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v;
  }
  const data = o.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const k of keys) {
      const v = (data as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
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

    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const [emailSettled] = await Promise.allSettled([
      fetch(`${BACKEND_API_URL}/v2/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      }),
    ]);
    const emailResponse =
      emailSettled.status === 'fulfilled' ? emailSettled.value : null;

    let userResponse: PromiseSettledResult<Response> | null = null;
    let userData: unknown = null;
    let userError: string | null = null;
    try {
      userResponse = await Promise.allSettled([
        fetch(`${BACKEND_API_URL}/v2/users/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            Authorization: authHeader,
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
          } catch {
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
    } catch {
      // optional
    }

    let emailStatus = null;
    let emailError: string | null = null;
    let emailResponseBody: string | null = null;

    if (!emailResponse) {
      emailError =
        emailSettled.status === 'rejected'
          ? String(emailSettled.reason)
          : 'Email request failed';
    } else if (emailResponse.ok) {
      try {
        const emailData = await emailResponse.json();
        emailStatus = Array.isArray(emailData) ? emailData[0] : emailData;
      } catch {
        emailError = 'Failed to parse email status';
      }
    } else {
      emailResponseBody = await emailResponse.text().catch(() => '');
      try {
        const errorJson = JSON.parse(emailResponseBody);
        emailError =
          errorJson.message ||
          `Email endpoint returned ${emailResponse.status}`;
      } catch {
        emailError = `Email endpoint returned ${emailResponse.status}: ${emailResponseBody || emailResponse.statusText}`;
      }
    }

    if (!emailStatus) {
      const is403 = emailResponse?.status === 403;
      const status = is403 ? 403 : 404;
      const message = is403
        ? 'The email endpoint returned 403 Forbidden. The API key may not have permission to access GET /v2/email. Use admin session (log in as staff) or ask the backend team to grant the API key access to this endpoint.'
        : `No email status found for ${email}. ${emailError || 'Email not registered in the system.'}`;

      const backendReport =
        emailResponse && is403
          ? {
              endpoint: `${BACKEND_API_URL}/v2/email/:email`,
              method: 'GET',
              status: emailResponse.status,
              statusText: emailResponse.statusText,
              responseBody: emailResponseBody || undefined,
              requestedEmail: email,
            }
          : null;

      return NextResponse.json(
        {
          error: is403 ? 'Forbidden' : 'User not found',
          message,
          details: { userError, emailError },
          backendReport,
        },
        { status }
      );
    }

    if (userError && userError.includes('403')) {
      userError =
        'User endpoint requires session authentication (not available with API key). Only email status is available.';
    }

    // Form submissions: GET /v3/users/:email only (API_GUIDE §3.5)
    let formSubmissions: unknown[] = [];
    let formSubmissionsError: string | null = null;

    try {
      const v3Res = await fetch(
        `${BACKEND_API_URL}/v3/users/${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
          },
        }
      );
      if (v3Res.ok) {
        const v3Json = await v3Res.json();
        const row = Array.isArray(v3Json) ? v3Json[0] : v3Json;
        formSubmissions = extractFormSubmissionsFromV3(row);
      } else {
        formSubmissionsError =
          v3Res.status === 403 || v3Res.status === 404
            ? 'GET /v3/users/:email unavailable or returned no access — form_submissions require this endpoint.'
            : `GET /v3/users returned ${v3Res.status}`;
      }
    } catch {
      formSubmissionsError = 'Failed to load GET /v3/users (form_submissions)';
    }

    let subscription: unknown = null;
    let subscriptionError: string | null = null;
    try {
      const subRes = await fetch(
        `${BACKEND_API_URL}/v3/users/${encodeURIComponent(email)}/subscription`,
        {
          method: 'GET',
          headers: {
            Authorization: authHeader,
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
    } catch {
      subscriptionError = 'Failed to fetch subscription';
    }

    return NextResponse.json({
      success: true,
      email,
      user: userData,
      emailStatus,
      subscription,
      subscriptionError: subscriptionError || null,
      formSubmissions,
      formSubmissionsError: formSubmissionsError || null,
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
