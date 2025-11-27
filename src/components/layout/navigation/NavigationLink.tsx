'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { routeLink } from '@/utils/linkRouter';
import { NAV_DIMENSIONS } from './constants';
import { MenuItem } from './types';

interface NavigationLinkProps {
  item: MenuItem;
  onClick: () => void;
  isDarkMode: boolean;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  item,
  onClick,
  isDarkMode,
}) => {
  const linkClasses = clsx(
    `${NAV_DIMENSIONS.BORDER_RADIUS} cursor-pointer`,
    `${NAV_DIMENSIONS.TEXT_SIZE} h-8`,
    'flex items-center justify-center',
    isDarkMode
      ? 'text-text border border-text'
      : 'mix-blend-multiply text-white bg-text'
  );

  const itemText = item.link.text || 'Untitled';
  const linkResult = routeLink(item.link);
  const href = linkResult.href || '#';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(linkClasses, NAV_DIMENSIONS.PADDING.MEDIUM)}
    >
      {itemText}
    </Link>
  );
};

export default NavigationLink;
