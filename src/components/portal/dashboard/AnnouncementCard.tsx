import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { spaceConverter } from '@/utils/richTextConverters';
import { Heading } from '@/components/headings';
import clsx from 'clsx';
import type { Announcement } from '@/lib/announcements';

interface AnnouncementCardProps {
  announcement: Announcement;
  className?: string;
}

export function AnnouncementCard({
  announcement,
  className,
}: AnnouncementCardProps) {
  return (
    <div
      className={clsx(
        'grow basis-[28em] text-center flex flex-col justify-center items-center gap-4 border border-text pt-8 pb-10 px-6 sm:px-8 md:px-12 rounded-md',
        className
      )}
    >
      <Heading variant="content-h3" as="h3" size="md">
        {announcement.title}
      </Heading>
      {announcement.content && (
        <RichText
          data={announcement.content as never}
          className="text-md space-y-2"
          converters={spaceConverter}
        />
      )}
    </div>
  );
}
