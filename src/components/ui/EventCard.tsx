import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { downloadICS } from '@/utils/icsUtils';

export interface IcalEventData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export interface EventCardProps {
  /** Time string shown in the left column (e.g. "18:00") */
  time: string;
  /** Main title (e.g. event or space name) */
  title: string;
  /** Tags/badges below the title (e.g. <Tag> components) */
  tags?: React.ReactNode;
  /** Optional actions shown next to tags */
  actions?: React.ReactNode;
  /** Show built-in iCal download button; requires icalEvent for data */
  showIcalButton?: boolean;
  /** Event data for iCal download (used when showIcalButton is true) */
  icalEvent?: IcalEventData;
  /** Optional image shown on the right */
  image?: { src: string; alt: string };
  className?: string;
}

export function EventCard({
  time,
  title,
  tags,
  actions,
  showIcalButton = false,
  icalEvent,
  image,
  className,
}: EventCardProps) {
  const icalButton =
    showIcalButton && icalEvent ? (
      <button
        type="button"
        onClick={() => downloadICS(icalEvent)}
        className="rounded-sm border border-current leading-4 text-sm px-1 pt-[.1em] pb-[.1em] font-sans uppercase"
      >
        ICAL
      </button>
    ) : null;
  const hasTagsOrActions =
    tags != null || actions != null || icalButton != null;

  return (
    <div className={clsx('flex items-start gap-4', className)}>
      <div className="flex-shrink-0 w-24 flex items-center font-mono mt-8">
        {time}
      </div>
      <div
        className={clsx(
          'flex-1 min-w-0 flex items-center justify-between gap-4 rounded-xl border border-text px-6 py-5'
        )}
      >
        <div className="flex-1 min-w-0">
          <h4 className="mb-2 text-md">{title}</h4>
          {hasTagsOrActions && (
            <div className="flex flex-wrap items-center gap-1">
              {tags}
              {actions}
              {icalButton}
            </div>
          )}
        </div>
        {image && (
          <div className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-text">
            <Image
              src={image.src}
              alt={image.alt}
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
