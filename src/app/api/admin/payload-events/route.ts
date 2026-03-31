/**
 * Admin API route to list events from Payload CMS.
 *
 * GET /api/admin/payload-events
 *
 * Proxies to the Payload REST API (/api/events) only.
 * We deliberately avoid using the Payload Node API here so that the portal
 * does not depend on a local MongoDB connection.
 */

import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const payloadApiBase =
      process.env.PAYLOAD_API_URL ||
      process.env.NEXT_PUBLIC_PAYLOAD_API_URL ||
      `${request.nextUrl.origin}/api`;
    const baseWithSlash = payloadApiBase.endsWith('/')
      ? payloadApiBase
      : `${payloadApiBase}/`;
    const url = new URL('events', baseWithSlash);
    url.searchParams.set('limit', '200');

    // Proxy to Payload REST API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return NextResponse.json(
        {
          error: 'Failed to load events from Payload',
          message:
            (data as { message?: string }).message ||
            response.statusText ||
            'Unknown error',
          details: data,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: 'Failed to load events from Payload',
          message: `Expected JSON from ${url.toString()} but received ${contentType || 'unknown content-type'}`,
          details: text.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const json = (await response.json()) as { docs?: EventDoc[] };
    const events = normalizeEvents(json.docs || []);

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
      source: 'rest',
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

