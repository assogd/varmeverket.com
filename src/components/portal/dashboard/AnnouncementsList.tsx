import React from 'react';
import { AnnouncementCard } from './AnnouncementCard';
import type { Announcement } from '@/lib/announcements';
import clsx from 'clsx';

interface AnnouncementsListProps {
  announcements: Announcement[];
  className?: string;
}

export function AnnouncementsList({
  announcements,
  className,
}: AnnouncementsListProps) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className={clsx('flex gap-2 flex-wrap', className)}>
      {announcements.map(announcement => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}
