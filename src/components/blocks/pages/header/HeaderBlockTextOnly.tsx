import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp } from '@/components/ui/FadeIn';
import { jsxConverter } from '@/utils/richTextConverters/index';

interface HeaderBlockTextOnlyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
}

export default function HeaderBlockTextOnly({
  text,
}: HeaderBlockTextOnlyProps) {
  return (
    <div className="px-4 text-center relative pt-36">
      <DevIndicator componentName="HeaderBlockTextOnly" position="top-right" />
      <FadeInUp as="div" timing="fast">
        <RichText
          data={text}
          className="grid gap-3 justify-center max-w-7xl"
          converters={jsxConverter}
        />
      </FadeInUp>
    </div>
  );
}
