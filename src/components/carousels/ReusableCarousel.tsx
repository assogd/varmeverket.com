'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { MuteIcon, UnmuteIcon } from '@/components/icons';

export interface CarouselItem {
  id: string;
  [key: string]: unknown; // Allow any additional properties
}

export interface ReusableCarouselProps {
  items: CarouselItem[];
  onCurrentItemChange?: (
    currentIndex: number,
    currentItem: CarouselItem
  ) => void;
  showIndicators?: boolean;
  showNavigationArrows?: boolean;
  autoFocus?: boolean;
  className?: string;
  itemClassName?: string;
  indicatorClassName?: string;
  arrowClassName?: string;
  enableKeyboardNavigation?: boolean;
  enableTouchSwipe?: boolean;
  enableClickNavigation?: boolean;
  swipeThreshold?: number;
  debugMode?: boolean;
  muteControl?: {
    onMuteChange?: (isMuted: boolean) => void;
    showOnItem?: (item: CarouselItem, index: number) => boolean;
  };
  children: (
    item: CarouselItem,
    index: number,
    isActive: boolean
  ) => React.ReactNode;
}

const ReusableCarousel: React.FC<ReusableCarouselProps> = ({
  items,
  onCurrentItemChange,
  showIndicators = true,
  showNavigationArrows = false,
  autoFocus = true,
  className = '',
  itemClassName = '',
  indicatorClassName = '',
  arrowClassName = '',
  enableKeyboardNavigation = true,
  enableTouchSwipe = true,
  enableClickNavigation = true,
  swipeThreshold = 50,
  debugMode = false,
  muteControl,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we have multiple items for navigation
  const hasMultipleItems = items && items.length > 1;
  const isNavigationEnabled =
    hasMultipleItems &&
    (enableKeyboardNavigation || enableTouchSwipe || enableClickNavigation);

  // Debug logging
  if (debugMode) {
    console.log('ReusableCarousel received items:', items);
  }

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (debugMode) {
      console.log(
        'nextSlide called, current index:',
        currentIndex,
        'total items:',
        items.length
      );
    }
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % items.length;
      if (debugMode) {
        console.log('Setting new index:', newIndex);
      }
      return newIndex;
    });
  }, [items.length, currentIndex, debugMode]);

  const prevSlide = useCallback(() => {
    if (debugMode) {
      console.log(
        'prevSlide called, current index:',
        currentIndex,
        'total items:',
        items.length
      );
    }
    setCurrentIndex(prev => {
      const newIndex = (prev - 1 + items.length) % items.length;
      if (debugMode) {
        console.log('Setting new index:', newIndex);
      }
      return newIndex;
    });
  }, [items.length, currentIndex, debugMode]);

  const goToSlide = useCallback(
    (index: number) => {
      if (debugMode) {
        console.log('goToSlide called, going to index:', index);
      }
      setCurrentIndex(index);
    },
    [debugMode]
  );

  // Call callback when current item changes
  useEffect(() => {
    if (onCurrentItemChange && items && items.length > 0) {
      onCurrentItemChange(currentIndex, items[currentIndex]);
    }
  }, [currentIndex, items, onCurrentItemChange]);

  // Call callback when mute state changes
  useEffect(() => {
    if (muteControl?.onMuteChange) {
      muteControl.onMuteChange(isMuted);
    }
  }, [isMuted, muteControl]);

  // Toggle mute state
  const toggleMute = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent carousel navigation
    setIsMuted(prev => !prev);
  }, []);

  // Auto-focus the carousel when it mounts
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation || !hasMultipleItems) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (debugMode) {
        console.log('Key pressed:', event.key);
        console.log('Active element:', document.activeElement);
        console.log('Container ref:', containerRef.current);
      }

      // Always handle arrow keys and space, regardless of focus
      switch (event.key) {
        case 'ArrowLeft':
          if (debugMode)
            console.log('Left arrow pressed - going to previous slide');
          event.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          if (debugMode)
            console.log('Right arrow pressed - going to next slide');
          event.preventDefault();
          nextSlide();
          break;
        case ' ':
          if (debugMode) console.log('Space pressed - going to next slide');
          event.preventDefault();
          nextSlide();
          break;
        case 'Enter':
          if (debugMode) console.log('Enter pressed - going to next slide');
          event.preventDefault();
          nextSlide();
          break;
        case 'Escape':
          // Let the parent handle escape
          break;
        default:
          // Don't prevent other keys
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    nextSlide,
    prevSlide,
    enableKeyboardNavigation,
    debugMode,
    hasMultipleItems,
  ]);

  // Touch swipe functionality
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enableTouchSwipe || !hasMultipleItems) return;
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    },
    [enableTouchSwipe, hasMultipleItems]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enableTouchSwipe || !hasMultipleItems) return;
      setTouchEnd(e.targetTouches[0].clientX);
    },
    [enableTouchSwipe, hasMultipleItems]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enableTouchSwipe || !hasMultipleItems || !touchStart || !touchEnd)
      return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > swipeThreshold;
    const isRightSwipe = distance < -swipeThreshold;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }, [
    enableTouchSwipe,
    hasMultipleItems,
    touchStart,
    touchEnd,
    swipeThreshold,
    nextSlide,
    prevSlide,
  ]);

  // Click navigation
  const handleCarouselClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enableClickNavigation || !hasMultipleItems) return;

      // Focus the carousel for keyboard navigation
      if (containerRef.current) {
        containerRef.current.focus();
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const carouselWidth = rect.width;
      const clickPosition = clickX / carouselWidth;

      // If at first slide, any click goes to next
      if (currentIndex === 0) {
        nextSlide();
        return;
      }

      // If at last slide, any click goes to previous
      if (currentIndex === items.length - 1) {
        prevSlide();
        return;
      }

      // Otherwise, left 50% = previous, right 50% = next
      if (clickPosition < 0.5) {
        prevSlide();
      } else {
        nextSlide();
      }
    },
    [
      enableClickNavigation,
      hasMultipleItems,
      currentIndex,
      items.length,
      nextSlide,
      prevSlide,
    ]
  );

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className={`w-full h-full ${className}`}>
      <DevIndicator componentName="ReusableCarousel" position="bottom-left" />

      {/* Carousel Container */}
      <div
        className={`relative select-none w-full h-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${itemClassName}`}
        onClick={handleCarouselClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        tabIndex={autoFocus && hasMultipleItems ? 0 : -1}
        role={hasMultipleItems ? 'button' : undefined}
        aria-label={
          hasMultipleItems
            ? 'Carousel navigation - use arrow keys, space, or click to navigate'
            : undefined
        }
        style={{
          cursor: isNavigationEnabled ? 'pointer' : 'default',
        }}
        ref={containerRef}
      >
        {/* Left navigation area */}
        {enableClickNavigation && hasMultipleItems && (
          <div
            className="absolute left-0 top-0 w-1/2 h-full z-10"
            style={{ cursor: 'w-resize' }}
            onClick={e => {
              e.stopPropagation();
              prevSlide();
            }}
          />
        )}

        {/* Right navigation area - avoid top-right corner where close button might be */}
        {enableClickNavigation && hasMultipleItems && (
          <div
            className="absolute right-0 top-0 w-1/2 h-full z-10"
            style={{
              cursor: 'e-resize',
              marginTop: '60px',
              height: 'calc(100% - 60px)',
            }}
            onClick={e => {
              e.stopPropagation();
              nextSlide();
            }}
          />
        )}

        {/* Render current item */}
        {children(currentItem, currentIndex, true)}
      </div>

      {/* Slide Indicators */}
      {showIndicators && items.length > 1 && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 ${indicatorClassName}`}
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-white'
                  : 'border border-white hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {showNavigationArrows && items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors ${arrowClassName}`}
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors ${arrowClassName}`}
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Mute Control Button */}
      {muteControl &&
        items.length > 0 &&
        (() => {
          const shouldShow = muteControl.showOnItem
            ? muteControl.showOnItem(items[currentIndex], currentIndex)
            : true;
          return shouldShow ? (
            <button
              onClick={toggleMute}
              className="absolute bottom-0 right-0 z-20 p-2 text-white cursor-pointer"
              style={{ cursor: 'pointer' }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
          ) : null;
        })()}
    </div>
  );
};

export default ReusableCarousel;
