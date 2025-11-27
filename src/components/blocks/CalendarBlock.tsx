'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, useInView } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import {
  CalendarEventCard,
  CalendarEventOverlay,
} from '@/components/blocks/calendar';
import type { CalendarBlockProps, CalendarEvent } from '@/types/calendar';

const CalendarBlock: React.FC<CalendarBlockProps> = ({
  headline,
  description,
  events,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [windowWidth, setWindowWidth] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Track window width changes
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!events || events.length === 0) return null;

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseOverlay = () => {
    setSelectedEvent(null);
  };

  // Calculate empty EventCards needed for even rows based on current screen size
  const getEmptyEventCards = () => {
    const emptyCards = [];

    // Determine current number of columns based on window width
    let currentColumns = 1; // default for mobile
    if (windowWidth >= 1536) {
      currentColumns = 5; // 2xl
    } else if (windowWidth >= 1280) {
      currentColumns = 4; // xl
    } else if (windowWidth >= 768) {
      currentColumns = 3; // md
    } else if (windowWidth >= 480) {
      currentColumns = 2; // xs
    }

    // Calculate how many empty cards are needed for the current screen size
    const remainder = events.length % currentColumns;
    const emptyCardsNeeded = remainder > 0 ? currentColumns - remainder : 0;

    // Create empty event object for placeholder cards
    const emptyEvent: CalendarEvent = {
      id: 'empty',
      title: '',
      startDate: '',
      endDate: '',
    };

    for (let i = 0; i < emptyCardsNeeded; i++) {
      emptyCards.push(
        <div key={`empty-${i}`} className="aspect-video">
          <CalendarEventCard
            event={emptyEvent}
            index={events.length + i}
            onClick={() => {}} // No-op for empty cards
            isInView={isInView}
          />
        </div>
      );
    }

    return emptyCards;
  };

  return (
    <div className="relative px-2" ref={ref}>
      <DevIndicator componentName="CalendarBlock" />
      <BlockHeader headline={headline} description={description} />

      {/* Events Grid */}
      <div className="max-w-8xl mx-auto">
        <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
          {events.map((event, index) => (
            <div className="aspect-video w-full" key={event.id || index}>
              <CalendarEventCard
                event={event}
                index={index}
                onClick={handleEventClick}
                isInView={isInView}
              />
            </div>
          ))}
          {getEmptyEventCards()}
        </div>
      </div>

      {/* Event Detail Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <CalendarEventOverlay
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarBlock;
