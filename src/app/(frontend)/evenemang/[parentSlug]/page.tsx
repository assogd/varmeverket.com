import { PayloadAPI } from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import EventContent from '@/components/blocks/events/EventContent';
import { notFound } from 'next/navigation';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
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
  format?: 'in_person' | 'online' | 'hybrid';
  locationName?: string;
  children?: EventDocument[];
}

interface ParentEventPageProps {
  params: Promise<{
    parentSlug: string;
  }>;
}

function buildEventMeta(event: EventDocument) {
  const { startDateTime, endDateTime } = event;

  if (!startDateTime) {
    return null;
  }

  const end = endDateTime ?? startDateTime;

  return {
    date: formatEventDate(startDateTime, end),
    time: formatEventTime(startDateTime, end),
  };
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
      <EventHeader event={event} />

      {event.content && <EventContent content={event.content} />}

      {children.length > 0 && (
        <section className="mx-auto w-full max-w-3xl px-4 mt-16 mb-24">
          <h2 className="font-mono uppercase mb-6">Kommande tillfällen</h2>
          <ul className="space-y-4">
            {children.map(child => {
              const date = child.startDateTime
                ? new Date(child.startDateTime)
                : null;
              const year = date ? date.getFullYear() : null;
              const month = date
                ? String(date.getMonth() + 1).padStart(2, '0')
                : null;
              const day = date ? String(date.getDate()).padStart(2, '0') : null;

              const href =
                date && year && month && day
                  ? `/evenemang/${parentSlug}/${year}/${month}/${day}/${child.slug}`
                  : `/evenemang/${parentSlug}/${child.slug}`;

              const childMeta = buildEventMeta(child);

              return (
                <li key={child.id} className="border-b border-text pb-4">
                  <Link href={href} className="block">
                    <p className="font-mono text-xs uppercase mb-1">
                      {childMeta?.date}
                    </p>
                    <p className="text-lg">{child.title}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </PageLayout>
  );
}
