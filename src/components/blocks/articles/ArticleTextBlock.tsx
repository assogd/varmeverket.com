import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface ArticleTextBlockProps {
  content: Record<string, unknown>;
}

export default function ArticleTextBlock({ content }: ArticleTextBlockProps) {
  return (
    <div className="relative max-w-xl mx-auto px-4 col-start-1 col-end-13 pt-3 first:pt-0">
      <DevIndicator componentName="ArticleTextBlock" />
      <RichText data={content as never} className="grid gap-3" />
    </div>
  );
}
