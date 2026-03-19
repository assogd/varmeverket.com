import { NextRequest, NextResponse } from 'next/server';
import { fetchServerSession, buildCombinedCookieHeader } from '@/lib/serverSession';
import { BACKEND_API_URL } from '@/lib/backendApi';

type SavedEvent = {
  id: number | string;
  user_id?: number | string;
  article_id: string;
  created_at?: string;
};

async function requirePortalUser(request: NextRequest): Promise<{
  email: string;
  cookieHeader: string;
  combinedCookieHeader: string;
}> {
  const cookieHeader = request.headers.get('cookie') || '';
  const combinedCookieHeader = buildCombinedCookieHeader(cookieHeader);

  const session = await fetchServerSession(cookieHeader);
  if (!session) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('saved-events: not authenticated', {
        cookieHeaderLength: cookieHeader.length,
        combinedCookieHeaderLength: combinedCookieHeader.length,
      });
    }
    throw new Error('Not authenticated');
  }

  const email = (session as { user?: { email?: string } }).user?.email;
  if (!email) {
    throw new Error('Not authenticated');
  }

  return { email, cookieHeader, combinedCookieHeader };
}

export async function GET(request: NextRequest) {
  try {
    const { email, combinedCookieHeader } = await requirePortalUser(
      request
    );

    const articleId = request.nextUrl.searchParams.get('article_id') ?? null;

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: combinedCookieHeader,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
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

    const data = (await response.json().catch(() => [])) as unknown;
    const savedEvents = Array.isArray(data) ? (data as SavedEvent[]) : [];

    const filtered = articleId
      ? savedEvents.filter(se => se.article_id === articleId)
      : savedEvents;

    return NextResponse.json({
      success: true,
      email,
      savedEvents: filtered,
      count: filtered.length,
      saved: filtered.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, combinedCookieHeader } = await requirePortalUser(
      request
    );

    let body: { articleId?: string; article_id?: string };
    try {
      body = (await request.json()) as {
        articleId?: string;
        article_id?: string;
      };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const articleId = body.articleId?.trim() ?? body.article_id?.trim();
    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId (or article_id) is required' },
        { status: 400 }
      );
    }

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Cookie: combinedCookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: `article_id=${encodeURIComponent(articleId)}`,
      cache: 'no-store',
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create saved event',
          message:
            (data as { message?: string })?.message ||
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
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
    );
  }
}

// Optional: not used by the current UI yet, but implemented for completeness.
export async function DELETE(request: NextRequest) {
  try {
    const { email, combinedCookieHeader } = await requirePortalUser(
      request
    );

    const articleId =
      request.nextUrl.searchParams.get('article_id')?.trim() ?? '';

    if (!articleId) {
      return NextResponse.json(
        { error: 'article_id query param is required' },
        { status: 400 }
      );
    }

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events/${encodeURIComponent(articleId)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Cookie: combinedCookieHeader,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
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
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 401 }
    );
  }
}

