import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp } from '@/components/ui';
import { AppAction } from '@/components/ui';
import { PageHeaderLabel } from '@/components/headings';
import { jsxConverter } from '@/utils/richTextConverters/index';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';

interface PageHeaderTextOnlyProps {
  /** When set, renders a simple h1 instead of RichText. Use for plain string titles. */
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text?: any;
  label?: string;
  link?: LinkGroup;
}

export default function PageHeaderTextOnly({
  title,
  text,
  label,
  link,
}: PageHeaderTextOnlyProps) {
  const linkResult = link ? routeLink(link) : null;

  return (
    <div className="px-4 text-center relative pt-36">
      <DevIndicator componentName="PageHeaderTextOnly" position="top-right" />
      <FadeInUp as="div" timing="fast" className="grid gap-6">
        {label && <PageHeaderLabel>{label}</PageHeaderLabel>}
        {title ? (
          <h1 className="font-display uppercase text-2xl leading-[0.95em] tracking-[-0.01em] px-4 flex flex-col gap-3 justify-center items-center">
            {title}
          </h1>
        ) : text != null ? (
          <RichText
            data={text}
            className="flex flex-col gap-3 justify-center items-center"
            converters={jsxConverter}
          />
        ) : null}
        {linkResult?.href && link?.text && (
          <div className="">
            <AppAction href={linkResult.href} variant="outline">
              {link.text}
            </AppAction>
          </div>
        )}
      </FadeInUp>
    </div>
  );
}
