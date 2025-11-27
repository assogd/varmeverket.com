'use client';

import React, { useState } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { AppAction } from '@/components/ui';
import { Heading } from '@/components/headings';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';
import { useIsDark } from '@/hooks/useTheme';
import { isRichTextEmpty } from '@/utils/richTextUtils';
import clsx from 'clsx';

interface CTABlockProps {
  headline: string;
  ctaType: 'default' | 'rotating';
  description?: {
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
  link: LinkGroup;
}

const CTABlock: React.FC<CTABlockProps> = ({
  headline,
  ctaType,
  description,
  link,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDark = useIsDark();

  const renderLink = () => {
    return (
      <AppAction
        link={link}
        variant={isDark ? 'outline' : 'primary'}
        className="block w-full min-w-0 hover:bg-text hover:text-bg transition-colors duration-100 max-w-md mx-auto"
      >
        {(link.text || '').toUpperCase()}
      </AppAction>
    );
  };

  if (ctaType === 'rotating') {
    return (
      <div className="mt-32 mb-24 px-2">
        <DevIndicator componentName="CTABlock (Rotating)" />

        <div className="max-w-4xl mx-auto text-center">
          <Heading variant="section" as="h2" center className="mb-8">
            {headline}
          </Heading>

          <div className="flex justify-center">
            <div
              className={`w-auto aspect-square border border-white rounded-full flex items-center justify-center animate-spin cursor-pointer ${
                isHovered
                  ? '[animation-play-state:paused]'
                  : '[animation-play-state:running]'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                const linkResult = routeLink(link);
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
        </div>
      </div>
    );
  }

  // Default type
  return (
    <div
      className={clsx(
        'w-full px-2 py-8 text-center relative',
        isDark ? 'max-w-5xl mx-auto' : ''
      )}
    >
      <DevIndicator componentName="CTABlock (Default)" />
      <div
        className={clsx(
          'px-8 sm:px-12 py-8 rounded-xl grid gap-6',
          isDark ? 'border border-text' : ''
        )}
      >
        <Heading variant="section" as="h2" center>
          {headline}
        </Heading>
        {description && !isRichTextEmpty(description as never) && (
          <RichText data={description as never} className="font-mono" />
        )}
        {renderLink()}
      </div>
    </div>
  );
};

export default CTABlock;
