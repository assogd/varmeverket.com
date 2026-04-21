// Client component: we trigger a browser download when clicking ICAL.
'use client';

import React from 'react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
import { PlusIcon } from '@/components/icons';
import { downloadICS } from '@/utils/icsUtils';

interface EventMetaProps {
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  format?: 'in_person' | 'online' | 'hybrid';
  title?: string;
  locationName?: string;
  space?: { title?: string };
  eventId?: string;
  hasForm?: boolean;
}

export function EventMeta({
  startDateTime,
  endDateTime,
  isAllDay,
  format,
  title,
  locationName,
  space,
}: EventMetaProps) {
  const hasTime = Boolean(startDateTime);
  const dateLabel =
    startDateTime && (endDateTime || startDateTime)
      ? formatEventDate(startDateTime, endDateTime ?? startDateTime)
      : null;
  const timeLabel =
    !isAllDay && startDateTime && (endDateTime || startDateTime)
      ? formatEventTime(startDateTime, endDateTime ?? startDateTime)
      : null;

  const formatLabel =
    format === 'online'
      ? 'Online'
      : format === 'hybrid'
        ? 'Hybrid'
        : format === 'in_person'
          ? 'På plats'
          : null;

  const location = locationName || space?.title;
  const hasMeta = hasTime || formatLabel || location;

  if (!hasMeta) return null;

  const icalEvent =
    title && startDateTime
      ? {
          id: title,
          title,
          startDate: startDateTime,
          endDate: endDateTime ?? startDateTime,
          location,
        }
      : null;

  const icalButton = icalEvent ? (
    <button
      type="button"
      onClick={() => downloadICS(icalEvent)}
      className="inline-flex items-center justify-center gap-2"
    >
      <PlusIcon
        size={10}
        className="flex-shrink-0 no-underline translate-y-[-0.025em]"
      />
      <span>Importera till kalender</span>
    </button>
  ) : null;

  return (
    <div className="font-mono grid gap-1">
      {location && <div className="">{location}</div>}
      {dateLabel && (
        <div className="inline-flex text-center gap-x-4 gap-y-1 flex-wrap justify-center items-center">
          <span>
            {dateLabel}
            {timeLabel ? ` ${timeLabel}` : ''}
          </span>
        </div>
      )}
      <div className="mt-2">{icalButton}</div>
    </div>
  );
}
