'use client';

import React from 'react';
import clsx from 'clsx';
import { downloadICS, type CalendarEvent } from '@/utils/icsUtils';

const defaultClassName =
  'rounded-sm border border-current leading-4 text-sm px-1 pt-[.1em] pb-[.1em] font-sans uppercase';

export interface IcalDownloadButtonProps {
  event: CalendarEvent;
  /** Override default compact "ICAL" styling */
  className?: string;
  label?: string;
}

/**
 * Compact iCal download control (shared by event cards, event meta, etc.).
 */
export function IcalDownloadButton({
  event,
  className,
  label = 'ICAL',
}: IcalDownloadButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadICS(event)}
      className={clsx(defaultClassName, className)}
    >
      {label}
    </button>
  );
}
