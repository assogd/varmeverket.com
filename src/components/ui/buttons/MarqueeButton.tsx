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
  size?: 'default' | 'lg';
}

export const MarqueeButton: React.FC<MarqueeButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  speed = 50,
  size = 'default',
}) => {
  const isDark = useIsDark();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full px-0 uppercase border border-text rounded-sm inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap select-none transition-transform duration-75 ease-out active:scale-[0.99]',
        size === 'lg' ? 'h-[2.75em]' : 'h-[2.333em]',
        isDark
          ? 'border border-text'
          : className
            ? 'bg-text'
            : 'bg-text text-bg mix-blend-multiply',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90',
        className
      )}
    >
      <Marquee speed={speed}>{createMarqueeText(String(children))}</Marquee>
    </button>
  );
};
