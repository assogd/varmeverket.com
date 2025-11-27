'use client';
import React, { useState } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { AppAction } from '@/components/ui';
import { SectionHeading } from '@/components/headings';
import Marquee from 'react-fast-marquee';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';
import { createMarqueeText } from '@/utils/marquee';

interface ArticleCTABlockProps {
  headline: string;
  ctaType?: 'default' | 'rotating' | 'marquee';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any; // Lexical RichText type
  link?: LinkGroup;
}

export default function ArticleCTABlock({
  headline,
  ctaType = 'default',
  description,
  link,
}: ArticleCTABlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Use the link router to resolve the link
  const linkResult = link
    ? routeLink(link)
    : {
        href: undefined,
        isExternal: false,
        isCopy: false,
        shouldRenderAsButton: false,
      };

  if (ctaType === 'rotating') {
    return (
      <div className="mt-32 mb-24 px-2">
        <DevIndicator componentName="ArticleCTABlock (Rotating)" />

        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading className="mb-8">{headline}</SectionHeading>

          {description && (
            <div className="mb-8">
              <RichText data={description} className="font-mono" />
            </div>
          )}

          {link && (
            <div className="flex justify-center">
              <div
                className={`w-auto aspect-square border border-text rounded-full flex items-center justify-center animate-spin cursor-pointer ${
                  isHovered
                    ? '[animation-play-state:paused]'
                    : '[animation-play-state:running]'
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => {
                  if (linkResult.isCopy) {
                    navigator.clipboard.writeText(link.text || '');
                  } else {
                    window.location.href = linkResult.href || '#';
                  }
                }}
              >
                <div className="text-lg transform -rotate-90 p-24">
                  {link.text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (ctaType === 'marquee') {
    return (
      <div className="relative max-w-3xl my-8 w-full mx-auto">
        <DevIndicator componentName="ArticleCTABlock (Marquee)" />
        <div className="text-center grid gap-8 py-12 px-16 bg-accent rounded-lg">
          <div className="grid gap-4">
            <SectionHeading>{headline}</SectionHeading>
            {description && (
              <RichText data={description} className="font-mono" />
            )}
          </div>
          {linkResult.href &&
            typeof linkResult.href === 'string' &&
            link?.text && (
              <AppAction
                link={link}
                variant="primary"
                className="h-[2.333em] px-0"
              >
                <Marquee speed={50}>{createMarqueeText(link.text)}</Marquee>
              </AppAction>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[65ch] mx-auto px-4 grid gap-4 py-8 overflow-hidden">
      <DevIndicator componentName="ArticleCTABlock" />
      <div className="text-center overflow-hidden">
        <SectionHeading className="mb-4">{headline}</SectionHeading>
        {description && <RichText data={description} className="grid gap-3" />}
        {linkResult.href &&
          typeof linkResult.href === 'string' &&
          link?.text && (
            <div className="overflow-hidden w-full">
              <AppAction
                link={link}
                variant="secondary"
                className="w-full min-w-0"
              >
                <Marquee speed={30}>{createMarqueeText(link.text)}</Marquee>
              </AppAction>
            </div>
          )}
      </div>
    </div>
  );
}
