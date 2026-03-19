import React from 'react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';

interface EventMetaProps {
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  format?: 'in_person' | 'online' | 'hybrid';
  locationName?: string;
  space?: { title?: string };
}

export function EventMeta({
  startDateTime,
  endDateTime,
  isAllDay,
  format,
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

  return (
    <div className="font-mono">
      {location && <div className="mb-1">{location}</div>}
      {dateLabel && (
        <div className="inline-flex text-center gap-x-4 gap-y-1 flex-wrap justify-center">
          <span>{dateLabel}</span>
          {timeLabel ? <span> {timeLabel}</span> : ''}
        </div>
      )}
    </div>
  );
}
