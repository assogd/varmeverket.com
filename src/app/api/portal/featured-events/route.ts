import { NextResponse } from 'next/server';
import { PayloadAPI } from '@/lib/api';
import { buildEventHref } from '@/lib/events/buildEventHref';
import { getChildParentSlugMap } from '@/lib/events/childParentSlugMap';

type FeaturedEvent = {
  id: string;
  title?: string;
  slug?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  isAllDay?: boolean | null;
  featured?: boolean | null;
  status?: string | null;
  _status?: string | null;
  children?: Array<string | { id?: string | null }>;
  featuredImage?: { url: string; alt?: string | null } | null;
};

const DASHBOARD_API_DEBUG = process.env.DASHBOARD_API_DEBUG === 'true';

export async function GET() {
  const startedAt = Date.now();
  try {
    const now = new Date();
    const nowMs = now.getTime();

    const result = await PayloadAPI.find<FeaturedEvent>({
      collection: 'events',
      depth: 1,
      limit: 500,
      sort: 'startDateTime',
    });

    const events = (result.docs || [])
      .filter(e => Boolean(e?.startDateTime))
      .filter(
        e =>
          e.featured === true &&
          (e.status === 'published' || e._status === 'published')
      )
      .filter(e => {
        const startsAt = new Date(e.startDateTime as string).getTime();
        const endsAt = e.endDateTime
          ? new Date(e.endDateTime).getTime()
          : startsAt;
        // Include ongoing events as well as upcoming ones.
        return endsAt >= nowMs;
      })
      .sort((a, b) => {
        const aStartsAt = new Date(a.startDateTime as string).getTime();
        const bStartsAt = new Date(b.startDateTime as string).getTime();
        return aStartsAt - bStartsAt;
      })
      .slice(0, 1);

    const childParentMap = await getChildParentSlugMap();

    const mappedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      href: buildEventHref(e, childParentMap.get(e.id)),
      startDateTime: e.startDateTime,
      endDateTime: e.endDateTime,
      isAllDay: Boolean(e.isAllDay),
      featuredImage: e.featuredImage,
    }));

    if (DASHBOARD_API_DEBUG) {
      console.info(
        `[dashboard-api] featured-events ${Date.now() - startedAt}ms`
      );
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
