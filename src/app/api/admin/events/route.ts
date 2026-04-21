/**
 * Admin API route to work with saved events
 *
 * GET    /api/admin/events?email=<email>
 *   → List saved events for a specific user
 *
 * POST   /api/admin/events
 *   Body: { email: string; articleId: string }
 *   → Add a saved event for a user (proxies POST /v3/users/:email/saved-events)
 *
 * DELETE /api/admin/events
 *   Body: { email: string; articleId: string }
 *   → Remove a saved event for a user (proxies DELETE /v3/users/:email/saved-events/:article_id)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiAccess } from '@/lib/adminApiAuth';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.BACKEND_API_URL ||
  'https://api.varmeverket.com';

const API_KEY_USERNAME = process.env.BACKEND_API_KEY_USERNAME;
const API_KEY_PASSWORD = process.env.BACKEND_API_KEY_PASSWORD;

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess(request);
    if (!access.ok) return access.response;

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

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error('❌ Backend API error (saved-events):', {
        status: response.status,
        statusText: response.statusText,
        email,
        url,
        data,
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch saved events',
          message:
            (data as { message?: string }).message ||
            response.statusText ||
            'Unknown error',
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    const savedEvents = Array.isArray(data) ? data : [];

    return NextResponse.json({
      success: true,
      email,
      savedEvents,
      count: savedEvents.length,
    });
  } catch (error) {
    console.error('❌ Error fetching saved events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch saved events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess(request);
    if (!access.ok) return access.response;

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

    let body: { email?: string; articleId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const email = body.email?.trim();
    const articleId = body.articleId?.trim();

    if (!email || !articleId) {
      return NextResponse.json(
        { error: 'email and articleId are required' },
        { status: 400 }
      );
    }

    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: `article_id=${encodeURIComponent(articleId)}`,
    });

    const text = await response.text();
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error('❌ Backend API error (create saved-event):', {
        status: response.status,
        statusText: response.statusText,
        email,
        articleId,
        url,
        data,
      });

      return NextResponse.json(
        {
          error: 'Failed to create saved event',
          message:
            (data as { message?: string }).message ||
            response.statusText ||
            'Unknown error',
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      email,
      articleId,
      backend: data,
    });
  } catch (error) {
    console.error('❌ Error creating saved event:', error);
    return NextResponse.json(
      {
        error: 'Failed to create saved event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireAdminApiAccess(request);
    if (!access.ok) return access.response;

    if (!API_KEY_USERNAME || !API_KEY_PASSWORD) {
      return NextResponse.json(
        {
          error: 'API key not configured',
          message:
            'BACKEND_API_KEY_USERNAME and BACKEND_API_KEY_PASSWORD must be set in environment variables',
        },
        { status: 500 }
      );
    }

    let body: { email?: string; articleId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const email = body.email?.trim();
    const articleId = body.articleId?.trim();

    if (!email || !articleId) {
      return NextResponse.json(
        { error: 'email and articleId are required' },
        { status: 400 }
      );
    }

    const credentials = Buffer.from(
      `${API_KEY_USERNAME}:${API_KEY_PASSWORD}`
    ).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events/${encodeURIComponent(articleId)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error('❌ Backend API error (delete saved-event):', {
        status: response.status,
        email,
        articleId,
        url,
        data,
      });
      return NextResponse.json(
        {
          error: 'Failed to remove saved event',
          message:
            (data as { message?: string }).message ||
            response.statusText ||
            'Unknown error',
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      email,
      articleId,
      backend: data,
    });
  } catch (error) {
    console.error('❌ Error removing saved event:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove saved event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
