import React from 'react';
import { AppAction } from '@/components/ui';
import { TagList } from '@/components/ui';
import { RichText } from '@payloadcms/richtext-lexical/react';
import clsx from 'clsx';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings';
import { cardConverter } from '@/utils/richTextConverters/index';
import { formatDateForTags, getArticleContent } from './utils';
import type { CardProps } from './types';

export default function ArticleCardWithoutImage({
  item,
  index,
}: Omit<CardProps, 'isHovered' | 'onHoverStart' | 'onHoverEnd' | 'onClick'>) {
  const articleContent = getArticleContent(item);

  // Create tags array from published date
  const tags = [];
  if (item.publishedDate) {
    const { year, month } = formatDateForTags(item.publishedDate);
    if (year) tags.push({ id: year, name: year });
    if (month) tags.push({ id: month, name: month });
  }

  // Create body content for RichText
  const body = articleContent
    ? {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: articleContent,
                },
              ],
            },
          ],
        },
      }
    : undefined;

  return (
    <div
      className={clsx(
        'flex flex-col aspect-[4/6] bg-surface rounded-lg',
        'px-5 relative',
        'h-full justify-between pb-4 pt-10',
        'self-start basis-64 sm:basis-72 grow-0 shrink-0 w-full max-w-80 snap-center'
      )}
    >
      <DevIndicator componentName="ArticleCardWithoutImage" />
      <div className="grid gap-6 mb-4 sm:px-2 text-center hyphens-auto">
        <header className="px-2 grid gap-3">
          <TagList tags={tags} size="md" />
          <Heading variant="card-title" as="h3">
            {item.title}
          </Heading>
        </header>
        {body && (
          <RichText
            data={body}
            className="text-center font-mono grid gap-3"
            converters={cardConverter}
          />
        )}
      </div>
      <div className="absolute bottom-0 inset-x-0 px-3 py-3">
        <AppAction
          href={`/artikel/${item.slug}`}
          variant="secondary"
          className="mx-auto mt-2 w-full"
        >
          Läs mer
        </AppAction>
      </div>
    </div>
  );
}
