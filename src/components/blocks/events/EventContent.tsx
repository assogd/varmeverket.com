import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { articleConverter } from '@/utils/richTextConverters/index';
import { DevIndicator } from '@/components/dev/DevIndicator';

interface EventContentProps {
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

export default function EventContent({ content }: EventContentProps) {
  return (
    <main className="relative">
      <DevIndicator componentName="EventContent" />
      <RichText
        data={content as never}
        className="grid gap-3 justify-center"
        converters={articleConverter}
      />
    </main>
  );
}
