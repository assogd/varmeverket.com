'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { StickyMarquee } from './StickyMarquee';
import { ViewportItem } from './ViewportItem';
import { Navigation } from './Navigation';
import { CourseCatalogProps } from './types';
import clsx from 'clsx';

export default function CourseCatalogBlock({
  headline,
  navigationSections,
}: CourseCatalogProps) {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isOverviewMode, setIsOverviewMode] = useState(true);
  const [navigationOverflows, setNavigationOverflows] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  // Get all navigation items flattened
  const allNavigationItems = navigationSections.flatMap(section =>
    section.navigationItems.map(item => ({
      ...item,
      sectionId: section.sectionId,
      sectionTitle: section.sectionTitle,
    }))
  );

  // Handle navigation item click
  const handleItemClick = (index: number) => {
    setActiveItemIndex(index);
    const targetElement = containerRef.current?.querySelector(
      `[data-item-index="${index}"]`
    );
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle when an item comes into view - just update to the latest one
  const handleItemInView = (index: number) => {
    setActiveItemIndex(index);
  };

  // Handle mobile mode switching
  const handleMobileModeSwitch = () => {
    if (!isOverviewMode) {
      // Return to overview mode
      setIsOverviewMode(true);
    }
  };

  // Handle switching to detail mode
  const handleSwitchToDetailMode = () => {
    setIsOverviewMode(false);
  };

  // Track when the accent container covers the entire viewport
  const [isViewportCovered, setIsViewportCovered] = useState(false);

  // Check if navigation overflows its container
  useEffect(() => {
    const checkNavigationOverflow = () => {
      if (navigationRef.current && isLargeScreen) {
        const navRect = navigationRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - 64; // Account for bottom marquee (16px * 4)

        setNavigationOverflows(navRect.height > availableHeight);
      }
    };

    checkNavigationOverflow();
    window.addEventListener('resize', checkNavigationOverflow);

    return () => window.removeEventListener('resize', checkNavigationOverflow);
  }, [isLargeScreen, navigationSections]);

  // Check screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show ViewportItem only when accent container covers at least 75% of viewport
      const isFullyCovered =
        containerRect.top <= 0 && containerRect.bottom >= viewportHeight * 1;

      setIsViewportCovered(isFullyCovered);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="relative bg-accent z-40 my-8" ref={containerRef}>
      <DevIndicator componentName="CourseCatalogBlock" />

      {/* Top Marquee */}
      <StickyMarquee text={headline} position="top" />

      {/* Main Container - No separate scroll */}
      <div
        className={clsx(
          'transition-transform duration-300',
          !isOverviewMode || isLargeScreen ? 'opacity-100' : 'opacity-0'
        )}
      >
        {allNavigationItems.map((item, index) => (
          <div key={`viewport-${index}`} data-item-index={index}>
            <ViewportItem
              item={item}
              index={index}
              isActive={activeItemIndex === index}
              isViewportCovered={isViewportCovered}
              onInView={handleItemInView}
            />
          </div>
        ))}
      </div>

      {/* Fixed Navigation Menu */}
      <Navigation
        navigationSections={navigationSections}
        allNavigationItems={allNavigationItems}
        activeItemIndex={activeItemIndex}
        isLargeScreen={isLargeScreen}
        isViewportCovered={isViewportCovered}
        navigationOverflows={navigationOverflows}
        isOverviewMode={isOverviewMode}
        onItemClick={handleItemClick}
        onMobileModeSwitch={handleMobileModeSwitch}
        onSwitchToDetailMode={handleSwitchToDetailMode}
      />

      {isLargeScreen && <StickyMarquee text={headline} position="bottom" />}
    </div>
  );
}
