import React from 'react';

/**
 * Creates an array of repeated text elements for marquee animations
 * @param text - The text to repeat
 * @param count - Number of times to repeat the text (default: 10)
 * @param className - Additional CSS classes for each span (default: "mx-4")
 * @returns Array of React elements
 */
export const createMarqueeText = (
  text: string,
  count: number = 10,
  className: string = 'mx-4'
): React.ReactElement[] => {
  return Array(count)
    .fill(null)
    .map((_, i) => (
      <span key={i} className={className}>
        {text}
      </span>
    ));
};
