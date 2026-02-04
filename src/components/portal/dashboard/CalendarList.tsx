import React from 'react';
import clsx from 'clsx';
import type { CalendarDayGroup, CalendarItem } from '@/lib/calendar';
import { formatSingleTime } from '@/utils/dateFormatting';
import { EventCard, Tag } from '@/components/ui';

interface CalendarListProps {
  dayGroups: CalendarDayGroup[];
  className?: string;
  /** When false, empty list is not shown (avoids flash before load). Default true. */
  emptyStateKnown?: boolean;
}

export function CalendarList({
  dayGroups,
  className,
  emptyStateKnown = true,
}: CalendarListProps) {
  if (dayGroups.length === 0) {
    if (!emptyStateKnown) return null;
    return (
      <div className={clsx('text-center font-mono', className)}>
        Inga kommande bokningar eller evenemang.
      </div>
    );
  }

  return (
    <div className={clsx('space-y-8 px-2', className)}>
      {dayGroups.map(dayGroup => (
        <CalendarDaySection
          key={dayGroup.date.toISOString()}
          dayGroup={dayGroup}
        />
      ))}
    </div>
  );
}

interface CalendarDaySectionProps {
  dayGroup: CalendarDayGroup;
}

function CalendarDaySection({ dayGroup }: CalendarDaySectionProps) {
  return (
    <div className="space-y-4 pt-4 first:pt-0">
      <h3 className="font-mono uppercase">
        {dayGroup.label.split('\n').map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </h3>
      <div className="space-y-2">
        {dayGroup.items.map(item => (
          <CalendarItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface CalendarItemCardProps {
  item: CalendarItem;
}

const ICAL_LOCATION = 'Värmeverket, Bredängsvägen 203, 127 34 Skärholmen';

function CalendarItemCard({ item }: CalendarItemCardProps) {
  const time = formatSingleTime(item.startsAt.toISOString());
  const tags = (
    <>{item.type && <Tag name={getTypeLabel(item.type)} size="md" />}</>
  );

  return (
    <EventCard
      time={time}
      title={item.title}
      tags={tags}
      showIcalButton
      icalEvent={{
        id: item.id,
        title: item.title,
        startDate: item.startsAt.toISOString(),
        endDate: item.endsAt.toISOString(),
        location: ICAL_LOCATION,
      }}
      image={item.image ? { src: item.image, alt: item.title } : undefined}
    />
  );
}

function getTypeLabel(type: CalendarItem['type']): string {
  switch (type) {
    case 'booking':
      return 'Bokning';
    case 'event':
      return 'Evenemang';
    case 'course':
      return 'Kurs';
    default:
      return '';
  }
}

function getStatusLabel(status: CalendarItem['status']): string {
  switch (status) {
    case 'booked':
      return 'Bokad';
    case 'saved':
      return 'Sparad';
    case 'registered':
      return 'Anmäld';
    default:
      return '';
  }
}
