'use client';

import React from 'react';
import clsx from 'clsx';

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'outline' | 'background' | 'bullet';
  size?: 'sm' | 'md' | 'lg';
}

const ListItem: React.FC<ListItemProps> = ({
  children,
  className,
  variant = 'outline',
  size = 'md',
}) => {
  const baseClasses = '';

  const sizeClasses = {
    sm: 'rounded-md px-4 py-4 text-sm',
    md: 'rounded-md px-6 py-7 text-base',
    lg: 'rounded-lg px-6 py-10 text-lg',
  };

  const variantClasses = {
    outline: 'border border-text text-center list-none',
    background: 'bg-surface text-center',
    bullet: 'font-mono list-disc list-outside ml-8 pl-3 pb-1 last:pb-0',
  };

  const hoverClasses = 'hover:rounded-none transition-all duration-300';

  // Only apply size classes to outline and background variants
  const shouldApplySizeClasses =
    variant === 'outline' || variant === 'background';

  return (
    <li
      className={clsx(
        baseClasses,
        shouldApplySizeClasses && sizeClasses[size],
        shouldApplySizeClasses && hoverClasses,
        variantClasses[variant],
        className
      )}
    >
      {children}
    </li>
  );
};

export default ListItem;
