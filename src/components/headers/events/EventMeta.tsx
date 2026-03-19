// Client component: we trigger a browser download when clicking ICAL.
'use client';

import React, { useEffect, useState } from 'react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
import { downloadICS } from '@/utils/icsUtils';
import { useSession } from '@/hooks/useSession';
import { useNotification } from '@/hooks/useNotification';

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
  eventId,
  hasForm,
}: EventMetaProps) {
  const { user, loading: sessionLoading } = useSession();
  const { showError, showSuccess } = useNotification();

  const [savedState, setSavedState] = useState<
    'unknown' | 'saved' | 'not_saved'
  >('unknown');
  const [saving, setSaving] = useState(false);

  const canShowSparaButton = Boolean(user?.email && eventId && !hasForm);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!canShowSparaButton) {
        setSavedState('unknown');
        return;
      }
      setSavedState('unknown');

      try {
        const res = await fetch(
          `/api/backend/saved-events?article_id=${encodeURIComponent(
            eventId as string
          )}`,
          { method: 'GET' }
        );

        if (!res.ok) {
          return;
        }

        const data = (await res.json().catch(() => ({}))) as
          | { savedEvents?: unknown[] }
          | unknown;

        const savedEventsValue = (data as { savedEvents?: unknown[] })
          .savedEvents;
        const savedEvents = Array.isArray(savedEventsValue)
          ? savedEventsValue
          : [];

        if (cancelled) return;
        setSavedState(savedEvents.length > 0 ? 'saved' : 'not_saved');
      } catch {
        if (!cancelled) setSavedState('not_saved');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [canShowSparaButton, eventId]);

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

  const sparaButton =
    canShowSparaButton && savedState !== 'saved' ? (
      <button
        type="button"
        disabled={sessionLoading || saving}
        onClick={async () => {
          if (!eventId) return;
          setSaving(true);
          try {
            const res = await fetch('/api/backend/saved-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ articleId: eventId }),
            });

            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as
                | { message?: string }
                | unknown;
              throw new Error(
                (data as { message?: string }).message || 'Failed to save event'
              );
            }

            setSavedState('saved');
            showSuccess('Event sparad i din kalender.');
          } catch (e) {
            const message =
              e instanceof Error ? e.message : 'Failed to save event';
            setSavedState('not_saved');
            showError(message);
          } finally {
            setSaving(false);
          }
        }}
        className="rounded-sm border border-current leading-4 text-sm px-1 pt-[.1em] pb-[.1em] font-sans uppercase"
      >
        Spara
      </button>
    ) : canShowSparaButton && savedState === 'saved' ? (
      <button
        type="button"
        disabled
        className="rounded-sm border border-current leading-4 text-sm px-1 pt-[.1em] pb-[.1em] font-sans uppercase opacity-80"
      >
        Sparad
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
      <div className="mt-1 flex flex-wrap gap-2 items-center justify-center">
        {icalButton}
        {sparaButton}
      </div>
    </div>
  );
}
