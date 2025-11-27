'use client';

import React from 'react';
import clsx from 'clsx';

import Overlay from '@/components/ui/Overlay';
import { NAV_DIMENSIONS } from './constants';
import { MenuItem } from './types';
import MenuItemComponent from './MenuItem';
import Logo from './Logo';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  isDarkMode: boolean;
  onLinkClick: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  menuItems,
  isDarkMode,
  onLinkClick,
}) => {
  const overlayBackgroundClasses = clsx(
    isDarkMode ? 'bg-bg/80 backdrop-blur-lg' : 'bg-accent'
  );

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      backgroundClassName={overlayBackgroundClasses}
      componentName="Navigation"
      closeOnOutsideClick={true}
      zIndex={30}
    >
      <div className="h-full overflow-y-auto mix-blend-multiply relative">
        <div className="absolute top-4 right-4 sm:top-2 sm:right-2 z-10">
          <Logo />
        </div>
        <ul
          className={`grid ${NAV_DIMENSIONS.SPACING.GAP} ${NAV_DIMENSIONS.SPACING.MARGIN_LEFT} ${NAV_DIMENSIONS.SPACING.MARGIN_TOP} place-content-start pb-16`}
        >
          {menuItems.map((item, index) => (
            <li key={index}>
              <MenuItemComponent
                item={item}
                onLinkClick={onLinkClick}
                isDarkMode={isDarkMode}
              />
            </li>
          ))}
        </ul>
      </div>
    </Overlay>
  );
};

export default MenuOverlay;
