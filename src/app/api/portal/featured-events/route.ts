import { NextResponse } from 'next/server';
import { PayloadAPI } from '@/lib/api';

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

function buildEventHref(
  event: Pick<FeaturedEvent, 'slug' | 'startDateTime'>,
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

export async function GET() {
  try {
    const now = new Date();
    const nowMs = now.getTime();

    const result = await PayloadAPI.findFresh<FeaturedEvent>({
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

    // Build a child->parent slug map to generate child event hrefs.
    const parentsResult = await PayloadAPI.findFresh<FeaturedEvent>({
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

    const mappedEvents = events
      .map(e => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        href: buildEventHref(e, childParentMap.get(e.id)),
        startDateTime: e.startDateTime,
        endDateTime: e.endDateTime,
        isAllDay: Boolean(e.isAllDay),
        featuredImage: e.featuredImage,
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

