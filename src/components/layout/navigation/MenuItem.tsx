'use client';

import React from 'react';

import NavigationLink from './NavigationLink';
import { NAV_DIMENSIONS } from './constants';
import { MenuItem as MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
  level?: number;
  onLinkClick: () => void;
  isDarkMode: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  level = 0,
  onLinkClick,
  isDarkMode,
}) => {
  const itemText = item.link.text || 'Untitled';
  const hasSubmenu = Boolean(item.children && item.children.length > 0);

  return (
    <div key={`${itemText}-${level}`} className="text-md">
      <div className="inline-block">
        <NavigationLink
          item={item}
          onClick={onLinkClick}
          isDarkMode={isDarkMode}
        />
      </div>
      {hasSubmenu && (
        <div
          className={`${NAV_DIMENSIONS.SPACING.MARGIN_LEFT_LARGE} grid ${NAV_DIMENSIONS.SPACING.GAP} mt-[.12em]`}
        >
          {item.children!.map(child => (
            <MenuItem
              key={`${child.link.text}-${level + 1}`}
              item={child}
              level={level + 1}
              onLinkClick={onLinkClick}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;
