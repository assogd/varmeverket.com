import { notFound } from 'next/navigation';
import { PayloadAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import FormBlock from '@/components/blocks/interactive/FormBlock';
import { EventHeader } from '@/components/headers/events/EventHeader';
import { resolveFormDoc } from '@/utils/resolveFormDoc';

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

  let parent = (await PayloadAPI.findBySlug(
    'events',
    parentSlug,
    10,
    false
  )) as {
    id: string;
    title?: string;
    slug: string;
    status?: string;
    children?: EventDocument[];
  } | null;

  if (!parent && process.env.NODE_ENV === 'development') {
    parent = (await PayloadAPI.findBySlug('events', parentSlug, 10, true)) as {
      id: string;
      title?: string;
      slug: string;
      status?: string;
      children?: EventDocument[];
    } | null;
  }

  if (!parent) {
    notFound();
  }

  if (process.env.NODE_ENV === 'production' && parent.status !== 'published') {
    notFound();
  }

  const children = Array.isArray(parent.children) ? parent.children : [];
  const childFromParent = children.find(e => e.slug === childSlug);

  if (!childFromParent || !childFromParent.startDateTime) {
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
    const fullChild = await PayloadAPI.findByID<EventDocument>(
      'events',
      childFromParent.id,
      10
    );
    child = fullChild as EventDocument;
  } catch {
    child = childFromParent as EventDocument;
  }

  const childFormDoc = child.form ? await resolveFormDoc(child.form) : null;

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
      />

      {child.content && <EventContent content={child.content} />}
      {childFormDoc && <FormBlock form={childFormDoc} />}
    </PageLayout>
  );
}
