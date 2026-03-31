import { notFound } from 'next/navigation';
import { PayloadAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import { EventChildrenCalendar } from '@/components/blocks/events/EventChildrenCalendar';
import FormBlock from '@/components/blocks/interactive/FormBlock';
import { EventHeader } from '@/components/headers/events/EventHeader';
import { resolveFormDoc } from '@/utils/resolveFormDoc';
import { headers } from 'next/headers';
import {
  loadEventBySlugForPage,
  type EventForPage,
} from '@/lib/events/loadEventBySlugForPage';
import { EventSavedActionBar } from '@/components/headers/events/EventSavedActionBar';

export const dynamic = 'force-dynamic';

interface EventDocument extends EventForPage {
  id: string;
  title: string;
  slug: string;
  status?: string;
  eventAccess?: 'public' | 'members_only';
  featured?: boolean;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  excerpt?: string;
  tags?: Array<{ id: string; name: string }>;
  introduction?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  content?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  format?: 'in_person' | 'online' | 'hybrid';
  locationName?: string;
  space?: { title?: string };
  header?: {
    text?: unknown;
    assets?: Array<{
      type: 'image' | 'mux' | 'video';
      placement: 'before' | 'after';
      image?: { url: string; alt?: string; width?: number; height?: number };
      mux?: string;
      video?: { url: string; alt?: string; width?: number; height?: number };
    }>;
  };
  form?: unknown;
}

interface ChildEventPageParams {
  parentSlug: string;
  year: string;
  month: string;
  day: string;
  childSlug: string;
}

interface ChildEventPageProps {
  params: Promise<ChildEventPageParams>;
}

function dateMatchesParams(
  dateString: string,
  year: string,
  month: string,
  day: string
) {
  const date = new Date(dateString);
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return y === year && m === month && d === day;
}

export default async function ChildEventPage({ params }: ChildEventPageProps) {
  const { parentSlug, year, month, day, childSlug } = await params;

  const cookieHeader = (await headers()).get('cookie') ?? undefined;
  const { event: parent, isPortalLoggedIn } =
    await loadEventBySlugForPage<EventDocument>({
      slug: parentSlug,
      cookieHeader,
      depth: 10,
    });

  if (!parent) notFound();

  let children = Array.isArray(parent.children) ? parent.children : [];
  if (!isPortalLoggedIn) {
    // Prevent anonymous users from seeing members-only children in the calendar/list.
    children = children.filter(
      c => (c.eventAccess ?? 'public') !== 'members_only'
    );
  }

  const childFromParent = children.find(e => e.slug === childSlug);

  if (!childFromParent || !childFromParent.startDateTime) {
    notFound();
  }

  // Enforce members-only access for the child itself.
  const childAccess = (childFromParent.eventAccess ?? 'public') as
    | 'public'
    | 'members_only';
  if (childAccess === 'members_only' && !isPortalLoggedIn) {
    notFound();
  }

  if (!dateMatchesParams(childFromParent.startDateTime, year, month, day)) {
    notFound();
  }

  if (
    process.env.NODE_ENV === 'production' &&
    childFromParent.status !== 'published'
  ) {
    notFound();
  }

  // Fetch child as full document so header and featuredImage are populated (same as parent events)
  let child: EventDocument;
  try {
    const fullChild = await PayloadAPI.findByIDFresh<EventDocument>(
      'events',
      childFromParent.id,
      10
    );
    child = fullChild as EventDocument;
  } catch {
    child = childFromParent as EventDocument;
  }

  const fullChildAccess = (child.eventAccess ?? 'public') as
    | 'public'
    | 'members_only';
  if (fullChildAccess === 'members_only' && !isPortalLoggedIn) {
    notFound();
  }

  // `child.form` may be missing if the full child fetch doesn't include the relationship value.
  // Fall back to the smaller `childFromParent.form` payload from the parent query.
  const rawChildFormRef =
    child.form ?? (childFromParent as { form?: unknown }).form;
  const childFormDoc = rawChildFormRef
    ? await resolveFormDoc(rawChildFormRef)
    : null;
  const hasForm = Boolean(childFormDoc);

  return (
    <PageLayout contentType="article">
      <EventHeader
        eventData={{
          parentTitle: parent.title,
          parentSlug,
          title: child.title,
          excerpt: child.excerpt,
          tags: child.tags,
          startDateTime: child.startDateTime,
          endDateTime: child.endDateTime,
          isAllDay: child.isAllDay,
          format: child.format,
          locationName: child.locationName,
          space: child.space,
        }}
        header={child.header}
        featuredImage={child.featuredImage}
        eventId={child.id}
        hasForm={hasForm}
      />

      {child.content && <EventContent content={child.content} />}
      {childFormDoc && <FormBlock form={childFormDoc} />}

      {children.length > 0 && (
        <EventChildrenCalendar
          children={children.map(c => ({
            id: c.id,
            title: c.title ?? '',
            slug: c.slug,
            startDateTime: c.startDateTime,
            endDateTime: c.endDateTime,
          }))}
          parentSlug={parentSlug}
          activeChildSlug={childSlug}
        />
      )}

      <EventSavedActionBar eventId={child.id} hasForm={hasForm} />
    </PageLayout>
  );
}
