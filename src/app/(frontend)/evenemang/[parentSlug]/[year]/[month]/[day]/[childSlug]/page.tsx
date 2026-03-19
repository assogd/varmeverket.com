import { notFound } from 'next/navigation';
import { PayloadAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import Link from 'next/link';
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

function dateMatchesParams(dateString: string, year: string, month: string, day: string) {
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
    slug: string;
    status?: string;
    children?: EventDocument[];
  } | null;

  if (!parent && process.env.NODE_ENV === 'development') {
    parent = (await PayloadAPI.findBySlug('events', parentSlug, 10, true)) as {
      id: string;
      slug: string;
      status?: string;
      children?: EventDocument[];
    } | null;
  }

  if (!parent) {
    notFound();
  }

  if (
    process.env.NODE_ENV === 'production' &&
    parent.status !== 'published'
  ) {
    notFound();
  }

  const children = Array.isArray(parent.children) ? parent.children : [];
  const child = children.find(e => e.slug === childSlug);

  if (!child || !child.startDateTime) {
    notFound();
  }

  if (!dateMatchesParams(child.startDateTime, year, month, day)) {
    notFound();
  }

  if (
    process.env.NODE_ENV === 'production' &&
    child.status !== 'published'
  ) {
    notFound();
  }

  return (
    <PageLayout contentType="article">
      <EventHeader
        eventData={{
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
      <p className="mx-auto w-full max-w-3xl px-4 text-sm mb-4">
        <Link href={`/evenemang/${parentSlug}`} className="underline">
          Del av serien {parent.slug}
        </Link>
      </p>

      {child.content && <EventContent content={child.content} />}
    </PageLayout>
  );
}

