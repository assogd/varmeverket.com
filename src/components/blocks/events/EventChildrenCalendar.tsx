'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import { CalendarEventCard } from '@/components/blocks/interactive/calendar';
import type { CalendarEvent } from '@/components/blocks/interactive/calendar/types';

export interface EventChildItem {
  id: string;
  title: string;
  slug: string;
  startDateTime?: string;
  endDateTime?: string;
}

interface EventChildrenCalendarProps {
  children: EventChildItem[];
  parentSlug: string;
  headline?: string;
}

function buildHref(parentSlug: string, child: EventChildItem): string {
  const date = child.startDateTime ? new Date(child.startDateTime) : null;
  if (!date) return `/evenemang/${parentSlug}/${child.slug}`;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `/evenemang/${parentSlug}/${year}/${month}/${day}/${child.slug}`;
}

function toCalendarEvent(child: EventChildItem): CalendarEvent {
  return {
    id: child.id,
    title: child.title,
    startDate: child.startDateTime ?? '',
    endDate: child.endDateTime ?? child.startDateTime ?? '',
  };
}

export function EventChildrenCalendar({
  children,
  parentSlug,
  headline = 'Tillfällen',
}: EventChildrenCalendarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const events = children.map(toCalendarEvent);

  if (events.length === 0) return null;

  let currentColumns = 1; // default for mobile
  if (windowWidth >= 1536) {
    currentColumns = 5; // 2xl
  } else if (windowWidth >= 1280) {
    currentColumns = 4; // xl
  } else if (windowWidth >= 768) {
    currentColumns = 3; // md
  } else if (windowWidth >= 480) {
    currentColumns = 2; // xs
  }

  const remainder = events.length % currentColumns;
  const emptyCardsNeeded = remainder > 0 ? currentColumns - remainder : 0;

  return (
    <section className="relative px-2 mb-24" ref={ref}>
      <BlockHeader headline={headline} />
      <div className="max-w-8xl mx-auto">
        <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
          {events.map((event, index) => {
            const child = children[index];
            const href = child ? buildHref(parentSlug, child) : undefined;
            return (
              <div className="aspect-video w-full" key={event.id}>
                <CalendarEventCard
                  event={event}
                  index={index}
                  onClick={() => {}}
                  isInView={isInView}
                  href={href}
                />
              </div>
            );
          })}
          {Array.from({ length: emptyCardsNeeded }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-video w-full">
              <div className="w-full h-full rounded-md bg-surface-dark opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
