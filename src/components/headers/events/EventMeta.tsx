// Client component: we trigger a browser download when clicking ICAL.
'use client';

import React from 'react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
import { downloadICS } from '@/utils/icsUtils';

interface EventMetaProps {
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  format?: 'in_person' | 'online' | 'hybrid';
  title?: string;
  locationName?: string;
  space?: { title?: string };
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
      className="rounded-sm border border-current leading-4 text-sm px-1 pt-[.1em] pb-[.1em] font-sans uppercase"
    >
      ICAL
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
      <div className="mt-1">{icalButton}</div>
    </div>
  );
}
