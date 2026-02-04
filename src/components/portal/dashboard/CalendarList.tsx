import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import type { CalendarDayGroup, CalendarItem } from '@/lib/calendar';
import { formatSingleTime } from '@/utils/dateFormatting';
import { Tag } from '@/components/ui';

interface CalendarListProps {
  dayGroups: CalendarDayGroup[];
  className?: string;
}

export function CalendarList({ dayGroups, className }: CalendarListProps) {
  if (dayGroups.length === 0) {
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

function CalendarItemCard({ item }: CalendarItemCardProps) {
  const time = formatSingleTime(item.startsAt.toISOString());

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-24 flex items-center font-mono mt-6">
        {time}
      </div>
      <div
        className={clsx(
          'flex-1 min-w-0 flex items-center justify-between gap-4 rounded-lg border border-text p-5'
        )}
      >
        <div className="flex-1 min-w-0">
          <h4 className="mb-3 text-md">{item.title}</h4>
          <div className="flex flex-wrap gap-2">
            {item.type && <Tag name={getTypeLabel(item.type)} size="md" />}
            {item.status && (
              <Tag name={getStatusLabel(item.status)} size="md" />
            )}
          </div>
        </div>
        {item.image && (
          <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-text">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
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
