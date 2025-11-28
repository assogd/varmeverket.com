'use client';
import React from 'react';
import { AppAction } from '@/components/ui';
import { MediaCard } from '@/components/blocks/MediaCard';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import { useHasHydrated, useResponsiveColumnCount, chunkArray } from './utils';
import type { StackedCardGridProps } from './types';

export const StackedCardGrid: React.FC<StackedCardGridProps> = ({
  headline,
  description,
  cards,
  link,
  variant = 'default',
}) => {
  const hasHydrated = useHasHydrated();
  const columnCount = useResponsiveColumnCount();

  if (!hasHydrated) {
    return (
      <section
        className={`py-24 px-2 sm:px-4 grid gap-4 ${variant === 'orange' ? 'bg-accent' : ''}`}
      >
        <BlockHeader headline={headline} description={description} />
      </section>
    );
  }

  // Handle case where cards might be undefined or empty
  const safeCards = cards || [];

  const rows = chunkArray(safeCards, columnCount);
  const lastRow = rows[rows.length - 1] || [];
  const emptyCount =
    lastRow.length < columnCount ? columnCount - lastRow.length : 0;

  // Check for link existence (support both doc and reference properties)
  const hasLink = link && link.type && (link.url || link.doc || link.reference);

  return (
    <section
      className={`px-2 sm:px-4 grid ${variant === 'orange' ? 'bg-accent pb-24 pt-20' : 'py-8'} relative`}
    >
      <DevIndicator componentName="StackedCardGrid" />
      <BlockHeader headline={headline} description={description} />
      <div className="py-2 mt-2 border-text border-t border-b">
        {rows.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {rowIdx !== 0 && (
              <div className="py-2 w-full">
                <div
                  className="w-full border-t border-text"
                  style={{ height: 0 }}
                />
              </div>
            )}
            <div className="max-w-sm lg:max-w-3xl xl:max-w-6xl mx-auto w-full">
              <div
                className={`grid w-full px-6 lg:px-24 ${columnCount === 1 ? '' : columnCount === 2 ? 'lg:grid-cols-2' : 'xl:grid-cols-3'}`}
              >
                {row.map((card, colIdx) => (
                  <div
                    key={colIdx}
                    className="flex flex-col justify-between border-r first:border-l border-text aspect-window overflow-hidden"
                  >
                    <MediaCard {...card} buttonVariant={'primary'} />
                  </div>
                ))}
                {rowIdx === rows.length - 1 &&
                  emptyCount > 0 &&
                  Array.from({ length: emptyCount }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="border-r border-text aspect-window pointer-events-none"
                      aria-hidden="true"
                    />
                  ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      {hasLink && (
        <div className="mt-8 text-center">
          <AppAction
            link={link}
            className="inline-block px-6 py-3 bg-text text-white rounded font-bold hover:bg-accent transition"
          >
            {link.text || 'See all'}
          </AppAction>
        </div>
      )}
    </section>
  );
};

export default StackedCardGrid;
