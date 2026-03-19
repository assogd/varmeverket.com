import { PayloadAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import { EventChildrenCalendar } from '@/components/blocks/events/EventChildrenCalendar';
import { notFound } from 'next/navigation';
import { EventHeader } from '@/components/headers/events/EventHeader';

interface EventDocument {
  id: string;
  title: string;
  slug: string;
  status?: string;
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

  let event = (await PayloadAPI.findBySlug(
    'events',
    parentSlug,
    10,
    false
  )) as EventDocument | null;

  if (!event && process.env.NODE_ENV === 'development') {
    event = (await PayloadAPI.findBySlug(
      'events',
      parentSlug,
      10,
      true
    )) as EventDocument | null;
  }

  if (
    process.env.NODE_ENV === 'production' &&
    event &&
    event.status !== 'published'
  ) {
    notFound();
  }

  if (!event) {
    notFound();
  }

  const children = Array.isArray(event.children) ? event.children : [];

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
    </PageLayout>
  );
}
