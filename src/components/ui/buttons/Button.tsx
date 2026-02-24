'use client';

import React from 'react';
import { useIsDark } from '@/hooks/useTheme';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  /** Force black bg + white text and isolate from mix-blend (e.g. on orange theme). */
  solidContrast?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary',
  solidContrast = false,
}) => {
  const isDark = useIsDark();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return isDark
          ? 'uppercase border border-text text-text rounded-md inline-block max-w-full text-center overflow-hidden text-ellipsis whitespace-nowrap select-none'
          : 'uppercase bg-text text-bg mix-blend-multiply rounded-md block text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-none';
      case 'secondary':
        return 'uppercase bg-accent rounded-md block text-center max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-none';
      case 'outline':
        return 'uppercase border border-text text-text rounded-md inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-none';
      default:
        return '';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        getVariantStyles(),
        'px-4 py-3.5 transition-transform duration-75 ease-out active:scale-[0.99]',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90',
        solidContrast && '!bg-black !text-[#e68456] isolate hover:!bg-black/90',
        className
      )}
    >
      {children}
    </button>
  );
};
