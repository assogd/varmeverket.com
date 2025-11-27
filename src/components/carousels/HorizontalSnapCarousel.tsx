'use client';
import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  ReactNode,
} from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import clsx from 'clsx';

export interface HorizontalSnapCarouselProps {
  children: ReactNode[];
  className?: string;
  cardClassName?: string;
  showDevIndicator?: boolean;
  getItemTitle?: (index: number) => string; // Function to get title for accessibility
}

const HorizontalSnapCarousel: React.FC<HorizontalSnapCarouselProps> = ({
  children,
  className = '',
  showDevIndicator = false,
  getItemTitle = index => `Item ${index + 1}`,
}) => {
  // Refs for keyboard navigation
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Helper to calculate showDots and isScrollable
  const calcLayout = () => {
    if (!scrollContainerRef.current || !cardRefs.current[0])
      return { showDots: false, isScrollable: false };

    const container = scrollContainerRef.current;
    const card = cardRefs.current[0];
    const containerWidth = container.offsetWidth;
    const cardWidth = card.offsetWidth;
    const totalContentWidth = container.scrollWidth;
    const visibleWidth = container.clientWidth;

    // Add some tolerance for rounding errors
    const tolerance = 2;
    const isScrollable = totalContentWidth > visibleWidth + tolerance;

    // 24px = space-x-6 (1.5rem)
    return {
      showDots: containerWidth < cardWidth * 2 + 24,
      isScrollable,
    };
  };

  // Initial state: best guess (no SSR window, so fallback to false)
  const [showDots, setShowDots] = useState(false);
  const [isScrollable, setIsScrollable] = useState(true);
  const [hasMeasured, setHasMeasured] = useState(false);

  // useLayoutEffect to avoid flicker
  useLayoutEffect(() => {
    const handleResize = () => {
      const { showDots, isScrollable } = calcLayout();
      setShowDots(showDots);
      setIsScrollable(isScrollable);
      setHasMeasured(true);
    };

    // Add a small delay to ensure all cards are rendered
    const timeoutId = setTimeout(handleResize, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [children.length]);

  // Track which card is centered in the viewport (can stay in useEffect)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      let minDiff = Infinity;
      let active = 0;
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        // Center of card vs center of container
        const diff = Math.abs(
          (cardRect.left + cardRect.right) / 2 -
            (containerRect.left + containerRect.right) / 2
        );
        if (diff < minDiff) {
          minDiff = diff;
          active = idx;
        }
      });
      setActiveIdx(active);
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [children.length]);

  // Keyboard navigation handler
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = cardRefs.current[idx + 1];
      if (next) next.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = cardRefs.current[idx - 1];
      if (prev) prev.focus();
    }
  };

  return (
    <div
      className={clsx(
        'relative',
        isScrollable ? 'w-screen overflow-hidden' : '',
        className
      )}
    >
      {showDevIndicator && (
        <DevIndicator componentName="HorizontalSnapCarousel" />
      )}
      <div
        ref={scrollContainerRef}
        className={
          `flex overflow-x-auto space-x-2 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full max-w-full ` +
          (isScrollable ? 'px-6' : 'justify-center') +
          ` transition-opacity duration-100` +
          (hasMeasured ? ' opacity-100' : ' opacity-0')
        }
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        role="list"
        tabIndex={0}
        aria-label="Carousel items"
      >
        {children.map((child, idx) => (
          <div
            key={idx}
            role="listitem"
            tabIndex={0}
            ref={el => {
              cardRefs.current[idx] = el;
            }}
            className={`snap-center flex-shrink-0 focus:outline-none max-w-full`}
            onKeyDown={e => handleKeyDown(e, idx)}
            aria-label={getItemTitle(idx)}
          >
            {child}
          </div>
        ))}
      </div>
      {/* Pagination dots: only show if only one card is visible in the viewport */}
      {showDots && children.length > 1 && (
        <div className="flex justify-center space-x-2">
          {children.map((_, idx) => (
            <span
              key={idx}
              className={`inline-block w-1.5 h-1.5 rounded-full transition-all duration-200 ${activeIdx === idx ? 'bg-text' : 'border'}`}
              aria-label={activeIdx === idx ? 'Current card' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizontalSnapCarousel;
