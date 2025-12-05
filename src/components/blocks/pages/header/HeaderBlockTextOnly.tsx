import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp } from '@/components/ui/FadeIn';
import { AppAction } from '@/components/ui';
import { PageHeaderLabel } from '@/components/headings';
import { jsxConverter } from '@/utils/richTextConverters/index';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';

interface HeaderBlockTextOnlyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  label?: string;
  link?: LinkGroup;
}

export default function HeaderBlockTextOnly({
  text,
  label,
  link,
}: HeaderBlockTextOnlyProps) {
  const linkResult = link ? routeLink(link) : null;

  return (
    <div className="px-4 text-center relative pt-36">
      <DevIndicator componentName="HeaderBlockTextOnly" position="top-right" />
      <FadeInUp as="div" timing="fast" className="grid gap-3">
        {label && <PageHeaderLabel>{label}</PageHeaderLabel>}
        <RichText
          data={text}
          className="grid gap-3 justify-center max-w-7xl"
          converters={jsxConverter}
        />
        {linkResult?.href && link?.text && (
          <div className="mt-4">
            <AppAction href={linkResult.href} variant="outline">
              {link.text}
            </AppAction>
          </div>
        )}
      </FadeInUp>
    </div>
  );
}
