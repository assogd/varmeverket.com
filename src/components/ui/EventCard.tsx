import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { IcalDownloadButton } from '@/components/ui/IcalDownloadButton';

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
  /** Optional page link. When set, title and image become links. */
  href?: string;
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
  href,
  className,
}: EventCardProps) {
  const icalButton =
    showIcalButton && icalEvent ? (
      <IcalDownloadButton event={icalEvent} />
    ) : null;
  const hasTagsOrActions =
    tags != null || actions != null || icalButton != null;

  return (
    <div className={clsx('flex items-start gap-4', className)}>
      <div className="flex-shrink-0 w-24 flex items-center font-mono mt-6">
        {time}
      </div>
      <div
        className={clsx(
          'flex-1 min-w-0 flex items-center justify-between gap-4 rounded-xl border border-text px-6 py-5'
        )}
      >
        <div className="flex-1 min-w-0">
          <h4 className="mb-2 text-md">
            {href ? (
              <Link href={href} className="underline-offset-2 hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </h4>
          {hasTagsOrActions && (
            <div className="flex flex-wrap items-center gap-1">
              {tags}
              {actions}
              {icalButton}
            </div>
          )}
        </div>
        {image && (
          <div className="relative flex-shrink-0 w-16 h-16 -m-2 rounded-lg overflow-hidden">
            {href ? (
              <Link href={href} className="block w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </Link>
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="48px"
                className="object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
