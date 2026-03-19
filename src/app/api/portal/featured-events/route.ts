import { NextRequest, NextResponse } from 'next/server';
import { fetchServerSession } from '@/lib/serverSession';
import { PayloadAPI } from '@/lib/api';

type FeaturedEvent = {
  id: string;
  title?: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  featuredImage?: { url: string; alt?: string | null } | null;
};

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const session = await fetchServerSession(cookieHeader);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const nowISO = new Date().toISOString();

    const result = await PayloadAPI.find<FeaturedEvent>({
      collection: 'events',
      depth: 1,
      limit: 200,
      sort: 'startDateTime',
      where: {
        and: [
          { featured: { equals: true } },
          {
            or: [
              { status: { equals: 'published' } },
              { _status: { equals: 'published' } },
            ],
          },
          {
            startDateTime: {
              greater_than_equal: nowISO,
            },
          },
        ],
      } as unknown as Record<string, unknown>,
    });

    const events = (result.docs || [])
      .filter(e => Boolean(e?.startDateTime))
      .map(e => ({
        id: e.id,
        title: e.title,
        startDateTime: e.startDateTime,
        endDateTime: e.endDateTime,
        featuredImage: e.featuredImage,
      }));

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
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

