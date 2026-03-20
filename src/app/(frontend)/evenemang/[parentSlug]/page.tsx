import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import { EventChildrenCalendar } from '@/components/blocks/events/EventChildrenCalendar';
import FormBlock from '@/components/blocks/interactive/FormBlock';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { EventHeader } from '@/components/headers/events/EventHeader';
import { resolveFormDoc } from '@/utils/resolveFormDoc';
import { EventSavedActionBar } from '@/components/headers/events/EventSavedActionBar';
import {
  loadEventBySlugForPage,
  type EventForPage,
} from '@/lib/events/loadEventBySlugForPage';

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
  tags?: Array<{
    id: string;
    name: string;
  }>;
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
  children?: EventDocument[];
}

interface ParentEventPageProps {
  params: Promise<{
    parentSlug: string;
  }>;
}

export default async function ParentEventPage({
  params,
}: ParentEventPageProps) {
  const { parentSlug } = await params;

  const cookieHeader = (await headers()).get('cookie') ?? undefined;
  const { event, isPortalLoggedIn } = await loadEventBySlugForPage<EventDocument>(
    {
      slug: parentSlug,
      cookieHeader,
      depth: 10,
    }
  );

  if (!event) notFound();

  let children = Array.isArray(event.children) ? event.children : [];
  if (!isPortalLoggedIn) {
    // Prevent anonymous users from even seeing members-only children in the list.
    children = children.filter(
      c => (c.eventAccess ?? 'public') !== 'members_only'
    );
  }

  const eventFormDoc = event.form ? await resolveFormDoc(event.form) : null;
  const hasForm = Boolean(eventFormDoc);

  return (
    <PageLayout contentType="article">
      <EventHeader
        eventData={{
          title: event.title,
          excerpt: event.excerpt,
          tags: event.tags,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          isAllDay: event.isAllDay,
          format: event.format,
          locationName: event.locationName,
          space: event.space,
        }}
        header={event.header}
        featuredImage={event.featuredImage}
        eventId={event.id}
        hasForm={hasForm}
      />

      {event.content && <EventContent content={event.content} />}

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
        />
      )}

      {eventFormDoc && <FormBlock form={eventFormDoc} />}

      <EventSavedActionBar eventId={event.id} hasForm={hasForm} />
    </PageLayout>
  );
}
