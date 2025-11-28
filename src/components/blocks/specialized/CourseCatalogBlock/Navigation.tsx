import React from 'react';
import { BlinkHover } from '@/components/ui';
import { FadeIn } from '@/components/ui';
import clsx from 'clsx';
import { NavigationItem, NavigationSection } from './types';

interface NavigationProps {
  navigationSections: NavigationSection[];
  allNavigationItems: NavigationItem[];
  activeItemIndex: number;
  isLargeScreen: boolean;
  isViewportCovered: boolean;
  navigationOverflows: boolean;
  isOverviewMode: boolean;
  onItemClick: (index: number) => void;
  onMobileModeSwitch: () => void;
  onSwitchToDetailMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  navigationSections,
  allNavigationItems,
  activeItemIndex,
  isLargeScreen,
  isViewportCovered,
  navigationOverflows,
  isOverviewMode,
  onItemClick,
  onMobileModeSwitch,
  onSwitchToDetailMode,
}) => {
  // Render navigation item
  const renderNavigationItem = (
    item: NavigationItem,
    index: number,
    sectionTitle: string
  ) => {
    const isActive = activeItemIndex === index;
    const showTitle = isLargeScreen || isOverviewMode;

    return (
      <BlinkHover
        key={`nav-${sectionTitle}-${item.title}-${index}`}
        className="cursor-pointer inline-flex justify-self-start gap-[.15em] max-w-[calc(100vw-1em)]"
        onClick={() => {
          // On large screens, always go to item
          // On mobile, only go to item in overview mode
          if (isLargeScreen || isOverviewMode) {
            onItemClick(index);
          }

          // If on mobile and in overview mode, also change to detail mode
          if (!isLargeScreen && isOverviewMode) {
            onSwitchToDetailMode();
          }

          // If on mobile and NOT in overview mode, switch to overview mode
          if (!isLargeScreen && !isOverviewMode) {
            onMobileModeSwitch();
          }
        }}
        interval={100}
        enabled={isLargeScreen}
        target=".title"
      >
        <div
          className={clsx(
            'w-10 h-10 flex items-center justify-center border border-text rounded-sm shrink-0',
            !isLargeScreen && isActive && 'text-transparent'
          )}
        >
          {(index + 1).toString().padStart(2, '0')}
        </div>
        {showTitle && (
          <div
            className={clsx(
              'max-w-[calc(100vw-5em)] lg:max-w-xs h-10 px-3 flex items-center border border-text rounded-sm',
              isLargeScreen && isActive && 'text-transparent'
            )}
          >
            <span className="title whitespace-nowrap truncate text-ellipsis w-full block">
              {item.title}
            </span>
          </div>
        )}
      </BlinkHover>
    );
  };

  // Only show on lg+ screens and when it fits
  if (!isViewportCovered) {
    return null;
  }

  return (
    <div
      className={clsx(
        `fixed inline-block left-0 top-1/2 -translate-y-1/2 px-4 py-8 max-w-[calc(100vw-1em)] overflow-x-hidden`,
        navigationOverflows ? 'invisible' : '',
        !isOverviewMode && ''
      )}
    >
      <FadeIn timing="slow" delay={0.3}>
        {navigationSections.map((section, sectionIndex) => (
          <div
            key={`section-${sectionIndex}-${section.sectionId}`}
            className="mb-5"
          >
            <h3
              className={clsx(
                'mb-2 font-sans uppercase',
                !isOverviewMode && 'opacity-0'
              )}
            >
              {section.sectionTitle}
            </h3>
            <div className="inline-grid gap-[.15em] max-w-[calc(100vw-1em)]">
              {section.navigationItems.map(navItem => {
                const globalIndex = allNavigationItems.findIndex(
                  globalItem => globalItem.title === navItem.title
                );
                return renderNavigationItem(
                  navItem,
                  globalIndex,
                  section.sectionTitle
                );
              })}
            </div>
          </div>
        ))}
      </FadeIn>
    </div>
  );
};
