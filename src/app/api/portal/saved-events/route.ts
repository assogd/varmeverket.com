import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL, type User } from '@/lib/backendApi';
import { isAdminUser } from '@/lib/adminAuth';
import { PayloadAPI } from '@/lib/api';
import { buildEventHref } from '@/lib/events/buildEventHref';
import { getChildParentSlugMap } from '@/lib/events/childParentSlugMap';
import { fetchServerSession } from '@/lib/serverSession';

type SavedEventRow = {
  article_id: string;
};

type HydratedEvent = {
  id: string;
  title?: string;
  slug?: string | null;
  href?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  isAllDay?: boolean | null;
  featuredImage?: { url: string; alt?: string | null } | null;
  status?: string;
  children?: Array<string | { id?: string | null }>;
};

const DASHBOARD_API_DEBUG = process.env.DASHBOARD_API_DEBUG === 'true';

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim();
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Missing email' },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get('cookie') || '';
    const session = await fetchServerSession(cookieHeader);
    const sessionUser = session?.user as User | undefined;
    const sessionEmail = sessionUser?.email?.trim().toLowerCase();
    const requestedEmail = email.toLowerCase();
    const admin = isAdminUser(sessionUser);
    if (!sessionEmail) {
      return NextResponse.json(
        { success: false, message: 'Login required' },
        { status: 401 }
      );
    }
    if (!admin && sessionEmail !== requestedEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: cannot access saved events for another user',
        },
        { status: 403 }
      );
    }

    const apiKeyUsername = process.env.BACKEND_API_KEY_USERNAME;
    const apiKeyPassword = process.env.BACKEND_API_KEY_PASSWORD;
    if (!apiKeyUsername || !apiKeyPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            'BACKEND_API_KEY_USERNAME and BACKEND_API_KEY_PASSWORD must be set',
        },
        { status: 500 }
      );
    }

    const credentials = Buffer.from(
      `${apiKeyUsername}:${apiKeyPassword}`
    ).toString('base64');
    const authHeader = `Basic ${credentials}`;

    const url = `${BACKEND_API_URL}/v3/users/${encodeURIComponent(
      email
    )}/saved-events`;

    const backendRes = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
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

    const hydratedEvents = await hydrateSavedEvents(ids);
    if (hydratedEvents.length === 0) {
      if (DASHBOARD_API_DEBUG) {
        console.info(
          `[dashboard-api] saved-events ${Date.now() - startedAt}ms`
        );
      }
      return NextResponse.json({
        success: true,
        events: [],
        count: 0,
      });
    }

    const childParentMap = await getChildParentSlugMap();

    const mappedEvents = hydratedEvents.map(event => ({
      ...event,
      href: buildEventHref(event, childParentMap.get(event.id)),
    }));

    if (DASHBOARD_API_DEBUG) {
      console.info(`[dashboard-api] saved-events ${Date.now() - startedAt}ms`);
    }

    return NextResponse.json({
      success: true,
      events: mappedEvents,
      count: mappedEvents.length,
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

async function hydrateSavedEvents(ids: string[]): Promise<HydratedEvent[]> {
  if (ids.length === 0) return [];

  // Prefer one bulk query over N+1 lookups.
  try {
    const result = await PayloadAPI.find<HydratedEvent>({
      collection: 'events',
      depth: 1,
      limit: ids.length,
      where: {
        id: {
          in: ids,
        },
      },
    });

    const byId = new Map(result.docs.map(doc => [String(doc.id), doc]));
    return ids
      .map(id => byId.get(String(id)))
      .filter((doc): doc is HydratedEvent => Boolean(doc))
      .filter(doc => doc.startDateTime)
      .filter(
        doc =>
          process.env.NODE_ENV !== 'production' || doc.status === 'published'
      );
  } catch {
    // Fallback to per-id hydration if backend query operators differ.
  }

  const hydratedEvents: HydratedEvent[] = [];
  await Promise.all(
    ids.map(async id => {
      try {
        const doc = await PayloadAPI.findByID<HydratedEvent>('events', id, 1);
        if (
          process.env.NODE_ENV === 'production' &&
          doc.status !== 'published'
        ) {
          return;
        }
        if (!doc.startDateTime) return;
        hydratedEvents.push(doc);
      } catch {
        // Ignore missing/invalid ids.
      }
    })
  );

  return hydratedEvents;
}
