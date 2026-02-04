'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export interface RoundButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  /** Apply spin animation (pauses on hover). Default false. */
  spin?: boolean;
  className?: string;
  /** Class for the inner text (e.g. rotation). Default -rotate-45. */
  contentClassName?: string;
  /** Size of the circle (width/height). Default 8rem. */
  size?: string;
}

export function RoundButton({
  children,
  href,
  onClick,
  spin = false,
  className,
  contentClassName,
  size = '8rem',
}: RoundButtonProps) {
  const circleClasses = clsx(
    'aspect-square rounded-full border flex items-center justify-center cursor-pointer transition-colors',
    spin && 'animate-spin hover:[animation-play-state:paused]',
    className
  );
  const style = { width: size, minWidth: size, maxWidth: size };
  const content = (
    <span
      className={clsx(
        'whitespace-nowrap',
        contentClassName ?? '-rotate-45'
      )}
    >
      {children}
    </span>
  );

  if (href) {
    const isExternal = href.startsWith('http');
    return isExternal ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={circleClasses}
        style={style}
      >
        {content}
      </a>
    ) : (
      <Link href={href} className={circleClasses} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={circleClasses}
      style={style}
    >
      {content}
    </button>
  );
}
