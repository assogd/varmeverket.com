'use client';
import { useState, useEffect, useRef } from 'react';

interface UseBlinkHoverOptions {
  interval?: number; // milliseconds for each state (on/off)
  enabled?: boolean; // whether blinking is enabled
}

export function useBlinkHover(options: UseBlinkHoverOptions = {}) {
  const { interval = 100, enabled = true } = options;
  const [isBlinking, setIsBlinking] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBlinking = () => {
    if (!enabled) return;

    setIsBlinking(true);
    setIsVisible(true);

    intervalRef.current = setInterval(() => {
      setIsVisible(prev => !prev);
    }, interval);
  };

  const stopBlinking = () => {
    setIsBlinking(false);
    setIsVisible(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isBlinking,
    isVisible,
    startBlinking,
    stopBlinking,
    blinkProps: {
      onMouseEnter: startBlinking,
      onMouseLeave: stopBlinking,
      style: {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0ms', // Hard cuts, no smooth transition
      },
    },
  };
}
