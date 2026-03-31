'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatEventDate, formatEventTime } from '@/utils/dateFormatting';
import type { CalendarEventCardProps } from './types';

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  index,
  onClick,
  isInView = false,
  href,
  isActive = false,
}) => {
  // Check if this is an empty placeholder event
  const isEmpty = event.id === 'empty' && !event.title && !event.startDate;

  const isInteractive = !isEmpty && !isActive;

  const content = (
    <>
      {!isEmpty && (
        <>
          <h3 className="font-sans text-md">{event.title}</h3>
          <div className="inline-flex justify-center flex-wrap gap-x-4">
            <div className="font-mono">
              {formatEventDate(event.startDate, event.endDate)}
            </div>
            <div className="font-mono">
              {formatEventTime(event.startDate, event.endDate)}
            </div>
          </div>
        </>
      )}
    </>
  );

  const baseClasses =
    'bg-surface-dark rounded-md py-4 px-6 flex flex-col gap-2 text-center justify-between items-center w-full h-full';
  const stateClasses = isEmpty
    ? 'cursor-default opacity-0'
    : isInteractive
      ? 'cursor-pointer'
      : 'cursor-default opacity-60';
  const className = `${baseClasses} ${stateClasses}`;

  if (href && isInteractive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="w-full h-full"
      >
        <Link href={href} className={`block w-full h-full ${className}`}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={className}
      onClick={() => !isEmpty && onClick(event)}
    >
      {content}
    </motion.div>
  );
};

export default CalendarEventCard;
