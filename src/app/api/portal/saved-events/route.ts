import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_API_URL } from '@/lib/backendApi';
import { PayloadAPI } from '@/lib/api';

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

function buildEventHref(
  event: Pick<HydratedEvent, 'slug' | 'startDateTime'>,
  parentSlug?: string
): string | undefined {
  if (!event.slug) return undefined;
  if (!parentSlug || !event.startDateTime) return `/evenemang/${event.slug}`;

  const date = new Date(event.startDateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `/evenemang/${parentSlug}/${year}/${month}/${day}/${event.slug}`;
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')?.trim();
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Missing email' },
        { status: 400 }
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

    // Build a child->parent slug map to generate child event hrefs.
    const parentsResult = await PayloadAPI.findFresh<HydratedEvent>({
      collection: 'events',
      depth: 1,
      limit: 500,
    });
    const childParentMap = new Map<string, string>();
    for (const parent of parentsResult.docs || []) {
      const parentSlug = parent.slug || undefined;
      if (!parentSlug || !Array.isArray(parent.children)) continue;

      for (const child of parent.children) {
        const childId =
          typeof child === 'string' ? child : child?.id ? String(child.id) : '';
        if (!childId) continue;
        childParentMap.set(childId, parentSlug);
      }
    }

    const mappedEvents = hydratedEvents.map(event => ({
      ...event,
      href: buildEventHref(event, childParentMap.get(event.id)),
    }));

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

