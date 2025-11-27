'use client';
import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import Marquee from 'react-fast-marquee';

interface MarqueeTextProps {
  text: string;
  className?: string;
  marqueeClassName?: string;
  speed?: number;
  pauseOnHover?: boolean;
  spacing?: string;
  children?: React.ReactNode;
  onMarqueeStateChange?: (isMarqueeing: boolean) => void;
}

// Custom hook to detect text overflow
const useOverflow = (text: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasDeterminedMarquee = useRef(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (
        containerRef.current &&
        textRef.current &&
        !hasDeterminedMarquee.current
      ) {
        // Get the actual available width for the text
        const containerRect = containerRef.current.getBoundingClientRect();
        const textRect = textRef.current.getBoundingClientRect();

        // Check if text is close to overflowing (90% of container width)
        const shouldOverflow = textRect.width > containerRect.width * 0.9;

        setShouldMarquee(shouldOverflow);
        setIsInitialized(true);
        hasDeterminedMarquee.current = true;
      }
    };

    // Wait for DOM to be fully rendered
    const timeoutId = setTimeout(checkOverflow, 200);

    // Only listen to window resize, not other layout changes
    const handleResize = () => {
      if (!hasDeterminedMarquee.current) {
        checkOverflow();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [text]);

  return { containerRef, textRef, shouldMarquee, isInitialized };
};

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  className = '',
  marqueeClassName = '',
  speed = 30,
  pauseOnHover = false,
  spacing = 'mx-4',
  children,
  onMarqueeStateChange,
}) => {
  const { containerRef, textRef, shouldMarquee, isInitialized } =
    useOverflow(text);

  // Notify parent component when marquee state changes
  React.useEffect(() => {
    onMarqueeStateChange?.(shouldMarquee);
  }, [shouldMarquee, onMarqueeStateChange]);

  // Don't render anything until we've determined if marquee is needed
  if (!isInitialized) {
    return (
      <div
        ref={containerRef}
        className={clsx(
          'relative inline-flex items-center justify-center overflow-hidden select-none',
          className
        )}
      >
        {/* Hidden text for measurement */}
        <span
          ref={textRef}
          className="whitespace-nowrap absolute opacity-0 pointer-events-none"
          style={{ visibility: 'hidden' }}
        >
          {children || text}
        </span>
        {/* Invisible placeholder to maintain layout */}
        <span className="whitespace-nowrap text-center opacity-0">
          {children || text}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative inline-flex items-center justify-center overflow-hidden select-none',
        className
      )}
    >
      {/* Hidden text for measurement */}
      <span
        ref={textRef}
        className="whitespace-nowrap absolute opacity-0 pointer-events-none"
        style={{ visibility: 'hidden' }}
      >
        {children || text}
      </span>

      {/* Visible content */}
      {shouldMarquee ? (
        <Marquee
          speed={speed}
          gradient={false}
          pauseOnHover={pauseOnHover}
          className={marqueeClassName}
        >
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
          <span className={spacing}>{children || text}</span>
        </Marquee>
      ) : (
        <span className="whitespace-nowrap text-center">
          {children || text}
        </span>
      )}
    </div>
  );
};
