'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';
import { createMarqueeText } from '@/utils/marquee';
import { useIsDark } from '@/hooks/useTheme';
import clsx from 'clsx';

interface MarqueeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  speed?: number;
}

export const MarqueeButton: React.FC<MarqueeButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  speed = 50,
}) => {
  const isDark = useIsDark();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full h-[2.333em] px-0 uppercase border border-text rounded-md inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap select-none transition-transform duration-75 ease-out active:scale-[0.99]',
        isDark ? 'border border-text' : 'bg-text text-bg mix-blend-multiply',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90',
        className
      )}
    >
      <Marquee speed={speed}>{createMarqueeText(String(children))}</Marquee>
    </button>
  );
};
