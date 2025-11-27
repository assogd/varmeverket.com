'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { MarqueeText } from '@/components/ui';
import { FadeIn } from '@/components/ui/FadeIn';
import { routeLink } from '@/utils/linkRouter';
import { NAV_DIMENSIONS } from './constants';
import { NavigationLink } from './types';

interface HighlightLinkProps {
  link: NavigationLink;
  onClick: () => void;
  isDarkMode: boolean;
  mounted: boolean;
}

const HighlightLink: React.FC<HighlightLinkProps> = ({
  link,
  onClick,
  isDarkMode,
  mounted,
}) => {
  const [isMarqueeing, setIsMarqueeing] = useState(false);
  const linkResult = routeLink(link);
  const href = linkResult.href || '#';

  const highlightLinkClasses = clsx(
    `fixed ${NAV_DIMENSIONS.Z_INDEX.LOW} bottom-2 left-2 right-2 md:right-auto md:bottom-auto md:top-2 md:left-[2.65em] ${NAV_DIMENSIONS.HEIGHT} ${NAV_DIMENSIONS.BORDER_RADIUS}`,
    !mounted && 'mix-blend-multiply bg-text',
    mounted && isDarkMode && 'text-text border border-white',
    mounted && !isDarkMode && 'mix-blend-multiply bg-text text-white'
  );

  return (
    <FadeIn variant="fadeDown" delay={0.4} className={highlightLinkClasses}>
      <Link
        href={href}
        onClick={onClick}
        className={clsx(
          `${NAV_DIMENSIONS.BORDER_RADIUS} cursor-pointer md:max-w-sm`,
          `${NAV_DIMENSIONS.TEXT_SIZE} h-full`,
          'flex items-center justify-center',
          !isMarqueeing && NAV_DIMENSIONS.PADDING.LARGE
        )}
      >
        <MarqueeText
          text={link.text || ''}
          speed={30}
          pauseOnHover={false}
          spacing="mx-2"
          onMarqueeStateChange={setIsMarqueeing}
        />
      </Link>
    </FadeIn>
  );
};

export default HighlightLink;
