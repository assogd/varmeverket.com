'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  snapType?: 'mandatory' | 'proximity' | 'none';
  justifyWhenOverflowing?: 'start' | 'center' | 'end';
  justifyWhenNotOverflowing?: 'start' | 'center' | 'end';
  enableOverflowDetection?: boolean;
  showBorders?: boolean;
  leftSpacer?: string | number;
  rightSpacer?: string | number;
  style?: React.CSSProperties;
}

export const HorizontalScrollContainer: React.FC<
  HorizontalScrollContainerProps
> = ({
  children,
  className = '',
  snapType = 'mandatory',
  justifyWhenOverflowing = 'start',
  justifyWhenNotOverflowing = 'center',
  enableOverflowDetection = true,
  showBorders = false,
  leftSpacer = '10%',
  rightSpacer = '10%',
  style = {},
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (!enableOverflowDetection) return;

    function checkOverflow() {
      const currentEl = scrollRef.current;
      if (!currentEl) return;
      setIsOverflowing(currentEl.scrollWidth > currentEl.clientWidth);
    }

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [enableOverflowDetection]);

  const justifyClass = enableOverflowDetection
    ? isOverflowing
      ? `justify-${justifyWhenOverflowing}`
      : `justify-${justifyWhenNotOverflowing}`
    : `justify-${justifyWhenNotOverflowing}`;

  const snapClasses = clsx({
    'snap-x': snapType !== 'none',
    'snap-mandatory': snapType === 'mandatory',
    'snap-proximity': snapType === 'proximity',
  });

  const containerClasses = clsx(
    'flex w-screen scrollbar-none scroll-smooth select-none',
    snapClasses,
    justifyClass,
    {
      'overflow-x-auto': enableOverflowDetection ? isOverflowing : true,
      'overflow-x-hidden': enableOverflowDetection && !isOverflowing,
    },
    className
  );

  const spacerClasses = clsx('snap-none grow-0 shrink-0');

  const spacerStyle = {
    width: `${leftSpacer}`,
  };

  const rightSpacerStyle = {
    width: `${rightSpacer}`,
  };

  const combinedStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitOverflowScrolling: 'touch' as const,
    ...style,
  };

  return (
    <div ref={scrollRef} className={containerClasses} style={combinedStyle}>
      <div
        className={clsx(spacerClasses, showBorders && 'border-r border-text')}
        style={spacerStyle}
      />
      {children}
      <div className={clsx(spacerClasses, '')} style={rightSpacerStyle} />
    </div>
  );
};

export default HorizontalScrollContainer;
