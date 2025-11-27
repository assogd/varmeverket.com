'use client';

import React from 'react';
import clsx from 'clsx';

import { OpenNavIcon, CloseNavIcon } from '@/components/icons';
import { FadeIn } from '@/components/ui/FadeIn';
import { NAV_DIMENSIONS } from './constants';

interface NavigationButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  mounted: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  isOpen,
  onToggle,
  isDarkMode,
  mounted,
}) => {
  const navButtonClasses = clsx(
    `fixed top-4 left-4 sm:top-2 sm:left-2 ${NAV_DIMENSIONS.Z_INDEX.HIGH} ${NAV_DIMENSIONS.BORDER_RADIUS}`,
    `cursor-pointer text-white ${NAV_DIMENSIONS.WIDTH} ${NAV_DIMENSIONS.HEIGHT}`,
    'flex items-center justify-center',
    'border-text',
    !mounted && 'mix-blend-multiply bg-text',
    mounted && isDarkMode && 'border',
    mounted && !isDarkMode && 'mix-blend-multiply bg-text'
  );

  return (
    <FadeIn
      variant="fadeDown"
      timing="normal"
      delay={0.4}
      as="button"
      onClick={onToggle}
      className={navButtonClasses}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
    >
      {isOpen ? (
        <CloseNavIcon className={NAV_DIMENSIONS.ICON_SIZE} />
      ) : (
        <OpenNavIcon className={NAV_DIMENSIONS.ICON_SIZE} />
      )}
    </FadeIn>
  );
};

export default NavigationButton;
