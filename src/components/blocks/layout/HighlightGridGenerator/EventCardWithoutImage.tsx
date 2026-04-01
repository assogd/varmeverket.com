import React from 'react';
import { AppAction } from '@/components/ui';
import { TagList } from '@/components/ui';
import clsx from 'clsx';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings';
import { formatDateForTags } from './utils';
import type { CardProps } from './types';
import { buildEventUrl } from '@/utils/eventUrl';

export default function EventCardWithoutImage({
  item,
}: Omit<CardProps, 'isHovered' | 'onHoverStart' | 'onHoverEnd' | 'onClick'>) {
  const tags = [];
  if (item.startDateTime) {
    const { year, month } = formatDateForTags(item.startDateTime);
    if (year) tags.push({ id: year, name: year });
    if (month) tags.push({ id: month, name: month });
  }

  const href = buildEventUrl({
    slug: item.slug,
    startDateTime: item.startDateTime,
    parentSlug: item.parentSlug,
    href: item.href,
  });

  return (
    <div
      className={clsx(
        'flex flex-col aspect-[4/6] bg-surface rounded-lg',
        'px-5 relative',
        'h-full justify-between pb-4 pt-10',
        'self-start basis-64 sm:basis-72 grow-0 shrink-0 w-full max-w-80 snap-center'
      )}
    >
      <DevIndicator componentName="EventCardWithoutImage" />
      <div className="grid gap-6 mb-4 sm:px-2 text-center hyphens-auto">
        <header className="px-2 grid gap-3">
          <TagList tags={tags} size="md" />
          <Heading variant="card-title" as="h3">
            {item.title}
          </Heading>
        </header>
      </div>
      <div className="absolute bottom-0 inset-x-0 px-3 py-3">
        <AppAction href={href} variant="secondary" className="mx-auto mt-2 w-full">
          Läs mer
        </AppAction>
      </div>
    </div>
  );
}

