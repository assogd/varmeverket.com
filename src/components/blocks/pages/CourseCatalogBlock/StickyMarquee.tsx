import React from 'react';
import { MarqueeText } from '@/components/ui';

interface StickyMarqueeProps {
  text: string;
  position: 'top' | 'bottom';
}

export const StickyMarquee: React.FC<StickyMarqueeProps> = ({
  text,
  position,
}) => (
  <div
    className={`sticky ${position}-0 w-screen max-w-full z-20 py-1 uppercase overflow-hidden`}
  >
    <MarqueeText text={text} />
  </div>
);
