import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

/**
 * Get API key credentials for the logged-in user
 * Each user has their own unique API key credentials
 */
async function getApiKeyCredentials(): Promise<{
  username: string;
  password: string;
} | null> {
  try {
    // Get session to find logged-in user
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    const sessionResponse = await fetch(`${BACKEND_API_URL}/session`, {
      method: 'GET',
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        Accept: 'application/json',
      },
    });

    if (!sessionResponse.ok) {
      return null;
    }

    const sessionData = await sessionResponse.json();
    const user = sessionData?.user;

    if (!user?.username) {
      return null;
    }

    // The username (UUID) is the API key username
    // Try to fetch the full user data to get the API key password
    const userResponse = await fetch(
      `${BACKEND_API_URL}/v2/users/${encodeURIComponent(user.email)}`,
      {
        method: 'GET',
        headers: {
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          Accept: 'application/json',
        },
      }
    );

    let apiKeyPassword: string | null = null;

    if (userResponse.ok) {
      try {
        const fullUserData = await userResponse.json();
        // Check for API key password in various possible fields
        apiKeyPassword =
          fullUserData.api_key ||
          fullUserData.apiKey ||
          fullUserData.api_key_password ||
          fullUserData.apiKeyPassword ||
          fullUserData.password || // Sometimes the password field might be the API key
          null;
      } catch {
        // If we can't parse the response, continue without password
      }
    }

    // If we couldn't get the password from user data, try environment variable as fallback
    if (!apiKeyPassword) {
      apiKeyPassword =
        process.env.BACKEND_API_KEY_PASSWORD ||
        'pC1J2b8bryDVh8IlVMFfMcI-5_uz2VLLWqHI1hCAkoM'; // Fallback to example password
    }

    return {
      username: user.username, // User's UUID is the API key username
      password: apiKeyPassword,
    };
  } catch (error) {
    console.error('Error getting API key credentials:', error);
    return null;
  }
}

/**
 * Check email activation status
 * GET /api/admin/check-email?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Get API key credentials for the logged-in user
    const apiKeyCreds = await getApiKeyCredentials();
    if (!apiKeyCreds) {
      return NextResponse.json(
        {
          error:
            'Unable to get API key credentials. Please ensure you are logged in.',
        },
        { status: 401 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(
      `${apiKeyCreds.username}:${apiKeyCreds.password}`
    ).toString('base64');

    const response = await fetch(
      `${BACKEND_API_URL}/v2/email/${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.status_message || 'Failed to check email status',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking email status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Activate a user (set enabled=1)
 * POST /api/admin/check-email
 * Body: { email: "user@example.com" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required in request body' },
        { status: 400 }
      );
    }

    // Get API key credentials for the logged-in user
    const apiKeyCreds = await getApiKeyCredentials();
    if (!apiKeyCreds) {
      return NextResponse.json(
        {
          error:
            'Unable to get API key credentials. Please ensure you are logged in.',
        },
        { status: 401 }
      );
    }

    // Create Basic Auth header
    const credentials = Buffer.from(
      `${apiKeyCreds.username}:${apiKeyCreds.password}`
    ).toString('base64');

    const response = await fetch(
      `${BACKEND_API_URL}/v2/email/${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: 'enabled=1',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.status_message || 'Failed to activate user',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error activating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
