import React from 'react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';

interface EventHeaderProps {
  event: {
    title?: string;
    excerpt?: string;
    tags?: Array<{ id: string; name: string }>;
    startDateTime?: string;
    endDateTime?: string;
    format?: 'in_person' | 'online' | 'hybrid';
    locationName?: string;
  };
}

export function EventHeader({ event }: EventHeaderProps) {
  const { startDateTime, endDateTime, format, locationName } = event;

  const hasTime = Boolean(startDateTime);
  const dateLabel =
    startDateTime && (endDateTime || startDateTime)
      ? formatEventDate(startDateTime, endDateTime ?? startDateTime)
      : null;
  const timeLabel =
    startDateTime && (endDateTime || startDateTime)
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

  return (
    <header className="mx-auto w-full max-w-3xl px-4 pt-16 pb-10">
      {hasTime && (
        <p className="font-mono text-sm uppercase mb-2">
          {dateLabel}
          {timeLabel ? ` · ${timeLabel}` : ''}
        </p>
      )}
      {(formatLabel || locationName) && (
        <p className="font-mono text-xs uppercase mb-4">
          {formatLabel}
          {formatLabel && locationName ? ' · ' : ''}
          {locationName}
        </p>
      )}
      {event.title && (
        <h1 className="text-3xl md:text-4xl font-display mb-4">
          {event.title}
        </h1>
      )}
      {event.excerpt && (
        <p className="max-w-2xl text-lg leading-relaxed">{event.excerpt}</p>
      )}
    </header>
  );
}

