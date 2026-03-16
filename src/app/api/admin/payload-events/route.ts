/**
 * Admin API route to list events from Payload CMS.
 *
 * GET /api/admin/payload-events
 *
 * 1. Tries Payload REST API (/api/events).
 * 2. On failure or empty, falls back to Payload Node API (same local DB).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

type EventDoc = {
  id?: string;
  slug?: string;
  title?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
};

function normalizeEvents(docs: EventDoc[]): Array<{
  id: string;
  slug: string;
  title: string;
  startDateTime: string | null;
  endDateTime: string | null;
}> {
  return docs
    .filter(e => e && (e.id || e.slug))
    .map(e => ({
      id: e.id ?? '',
      slug: e.slug ?? '',
      title: e.title ?? e.slug ?? e.id ?? '',
      startDateTime: e.startDateTime ?? null,
      endDateTime: e.endDateTime ?? null,
    }));
}

/** Fetch events via Payload Node API (local DB). */
async function fetchEventsFromLocalDB(): Promise<
  Array<{ id: string; slug: string; title: string; startDateTime: string | null; endDateTime: string | null }>
> {
  const payloadConfig = await Promise.resolve(config);
  const payload = await getPayload({ config: payloadConfig });
  const { docs } = await payload.find({
    collection: 'events',
    limit: 200,
    depth: 0,
  });
  return normalizeEvents(docs as EventDoc[]);
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const url = new URL('/api/events', origin);
    url.searchParams.set('limit', '200');

    // 1. Try Payload REST API first
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const json = (await response.json()) as { docs?: EventDoc[] };
      const events = normalizeEvents(json.docs || []);
      if (events.length > 0) {
        return NextResponse.json({
          success: true,
          count: events.length,
          events,
          source: 'rest',
        });
      }
    }

    // 2. Fallback: local DB via Payload Node API
    const events = await fetchEventsFromLocalDB();
    return NextResponse.json({
      success: true,
      count: events.length,
      events,
      source: 'local',
    });
  } catch (error) {
    console.error('❌ Error fetching Payload events:', error);
    return NextResponse.json(
      {
        error: 'Failed to load events from Payload',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

