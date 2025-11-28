import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { articleConverter } from '@/utils/richTextConverters/index';

interface TextBlockProps {
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
  variant?: 'default' | 'article';
}

export default function TextBlock({
  content,
  variant = 'default',
}: TextBlockProps) {
  const containerClasses =
    variant === 'article' ? 'relative' : 'relative px-4 lg:px-8 text-center';

  const richTextClasses =
    variant === 'article'
      ? 'grid gap-4 justify-center pb-8'
      : 'grid gap-3 justify-center';

  const WrapperComponent = variant === 'article' ? 'article' : 'section';

  return (
    <WrapperComponent className={containerClasses}>
      <DevIndicator componentName="TextBlock" />

      <RichText
        data={content as never}
        className={richTextClasses}
        converters={articleConverter}
      />
    </WrapperComponent>
  );
}
