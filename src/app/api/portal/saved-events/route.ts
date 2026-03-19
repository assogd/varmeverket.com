import { NextRequest, NextResponse } from 'next/server';
import { fetchServerSession, buildCombinedCookieHeader } from '@/lib/serverSession';
import { BACKEND_API_URL } from '@/lib/backendApi';
import { PayloadAPI } from '@/lib/api';

type SavedEventRow = {
  article_id: string;
};

type HydratedEvent = {
  id: string;
  title?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  featuredImage?: { url: string; alt?: string | null } | null;
  status?: string;
};

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const combinedCookieHeader = buildCombinedCookieHeader(cookieHeader);

    const session = await fetchServerSession(cookieHeader);
    if (!session) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('portal/saved-events: not authenticated', {
          cookieHeaderLength: cookieHeader.length,
          combinedCookieHeaderLength: combinedCookieHeader.length,
        });
      }
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = (session as { user?: { email?: string } }).user?.email;
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const backendRes = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: combinedCookieHeader,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message:
            (data as { message?: string }).message ||
            backendRes.statusText ||
            'Unknown error',
          status: backendRes.status,
          details: data,
        },
        { status: backendRes.status }
      );
    }

    const raw = (await backendRes.json().catch(() => [])) as unknown;
    const savedRows = Array.isArray(raw) ? (raw as SavedEventRow[]) : [];
    const ids = Array.from(
      new Set(savedRows.map(r => String(r.article_id)).filter(Boolean))
    );

    const hydratedEvents: HydratedEvent[] = [];

    // Hydrate each event; keep it simple (typical saved list is small).
    await Promise.all(
      ids.map(async id => {
        try {
          const doc = await PayloadAPI.findByIDFresh<HydratedEvent>(
            'events',
            id,
            1
          );

          // Only show published items in production.
          if (process.env.NODE_ENV === 'production' && doc.status !== 'published') {
            return;
          }

          if (!doc.startDateTime) return;

          hydratedEvents.push(doc);
        } catch {
          // Ignore missing/invalid ids.
        }
      })
    );

    return NextResponse.json({
      success: true,
      events: hydratedEvents,
      count: hydratedEvents.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

