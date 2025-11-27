'use client';

import React, { useRef, useEffect, useState } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
import { downloadICS } from '@/utils/icsUtils';
import { AppAction, Overlay } from '@/components/ui';
import type { CalendarEventOverlayProps } from '@/types/calendar';

const CalendarEventOverlay: React.FC<CalendarEventOverlayProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const headerRef = useRef<HTMLElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleDownloadICS = (eventData: typeof event) => {
    downloadICS(eventData);
  };

  // Check if header is scrollable
  useEffect(() => {
    if (!isOpen) return;

    const checkScrollable = () => {
      if (headerRef.current) {
        const { scrollHeight, clientHeight } = headerRef.current;
        const hasScroll = scrollHeight > clientHeight + 1; // Add small buffer for precision
        setIsScrollable(hasScroll);
      }
    };

    // Multiple checks with increasing delays to ensure layout is stable
    const timeouts = [
      setTimeout(checkScrollable, 50),
      setTimeout(checkScrollable, 200),
      setTimeout(checkScrollable, 500),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [event.description, isOpen]);

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      componentName="CalendarEventOverlay"
      closeOnOutsideClick={true}
      className="flex items-center justify-center p-2"
      backgroundClassName="bg-black/80 backdrop-blur-xl"
    >
      <div
        className="w-full max-w-sm max-h-[calc(100vh-1rem)] flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        <header
          ref={headerRef}
          className="relative bg-bg w-full grid gap-y-4 rounded-md px-5 py-6 overflow-y-auto flex-1 min-h-0"
        >
          <h3 className="font-sans text-md">{event.title}</h3>
          <div className="inline-flex flex-wrap gap-x-4">
            <div className="font-mono">
              {formatEventDate(event.startDate, event.endDate)}
            </div>
            <div className="font-mono">
              {formatEventTime(event.startDate, event.endDate)}
            </div>
          </div>
          {event.description && (
            <div className="">
              <RichText
                data={event.description as never}
                className="font-mono"
              />
            </div>
          )}
          {isScrollable && (
            <div className="absolute bottom-0 left-4 right-4 h-16 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
          )}
        </header>
        <button
          onClick={() => handleDownloadICS(event)}
          className="flex items-center shrink-0 justify-center gap-2 bg-bg w-full rounded-md p-4 hover:bg-surface-dark transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="translate-y-[.1em]">Ladda ner kalenderfil</span>
        </button>

        {/* Event Link */}
        {event.link && (
          <AppAction
            link={event.link}
            variant="minimal"
            className="flex items-center justify-center shrink-0 gap-2 w-full rounded-md p-4 uppercase bg-accent"
          >
            <span className="translate-y-[.1em]">
              {event.link.text || 'Läs mer'}
            </span>
          </AppAction>
        )}

        <button
          onClick={onClose}
          className="absolute right-0 top-0 p-3 uppercase text-sm"
        >
          Esc
        </button>
      </div>
    </Overlay>
  );
};

export default CalendarEventOverlay;
