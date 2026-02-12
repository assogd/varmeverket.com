'use client';

import React from 'react';
import clsx from 'clsx';

export interface NativeEmojiProps {
  /** Emoji character(s), e.g. "🌟" or "⭐" */
  emoji: string;
  /** Rendered size in pixels. Default 24. */
  size?: number;
  className?: string;
}

/**
 * Renders emoji as the Unicode character so it uses the device’s native style
 * (e.g. Apple on iOS/macOS, Google on Android). Size is controlled via font-size.
 */
export function NativeEmoji({
  emoji,
  size = 24,
  className,
}: NativeEmojiProps) {
  return (
    <span
      role="img"
      aria-label={emoji}
      className={clsx('inline-block align-middle', className)}
      style={{ fontSize: size }}
    >
      {emoji}
    </span>
  );
}
