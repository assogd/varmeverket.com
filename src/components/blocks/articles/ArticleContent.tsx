import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { articleConverter } from '@/utils/richTextConverters/index';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface ArticleContentProps {
  content: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <main className="relative">
      <DevIndicator componentName="ArticleContent" />
      <RichText
        data={content as never}
        className="grid gap-3 justify-center pb-8"
        converters={articleConverter}
      />
    </main>
  );
}
