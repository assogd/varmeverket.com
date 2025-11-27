import React from 'react';
import Marquee from 'react-fast-marquee';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import UserCardBlock from '@/components/blocks/UserCardBlock';

interface HorizontalMarqueeBlockProps {
  headline?: string;
  description?: Record<string, unknown>;
  speed: number;
  userCards: Array<{
    blockType: 'userCard';
    variant: 'textOnly' | 'compactCard' | 'mediumCard' | 'largeCard';
    user: Record<string, unknown> | string;
  }>;
}

export default function HorizontalMarqueeBlock({
  headline,
  description,
  speed,
  userCards,
}: HorizontalMarqueeBlockProps) {
  // Try different speed calculations to see which one works
  const speedValue = Number(speed);

  // react-fast-marquee typically expects speed in pixels per second
  // Let's try mapping CMS values (10-50) to reasonable pixel speeds (20-200)
  const minCmsSpeed = 10;
  const maxCmsSpeed = 30;
  const minPixelSpeed = 20;
  const maxPixelSpeed = 100;

  const normalizedSpeed =
    (speedValue - minCmsSpeed) / (maxCmsSpeed - minCmsSpeed);
  const pixelSpeed =
    minPixelSpeed + normalizedSpeed * (maxPixelSpeed - minPixelSpeed);

  if (!userCards || userCards.length === 0) {
    return null;
  }

  // Calculate how many times to repeat each card to get at least 8 total cards
  const minCards = 8;
  const repeatCount = Math.ceil(minCards / userCards.length);

  // Create array with repeated cards
  const repeatedCards = [];
  for (let i = 0; i < repeatCount; i++) {
    userCards.forEach((userCard, index) => {
      repeatedCards.push({
        ...userCard,
        key: `${i}-${index}`,
      });
    });
  }

  return (
    <div className="py-24">
      <DevIndicator componentName="HorizontalMarqueeBlock" />
      <BlockHeader headline={headline} description={description} />

      <div className="w-screen overflow-hidden mt-8">
        <Marquee speed={pixelSpeed} direction="left" gradient={false}>
          <div className="flex items-center gap-4 ml-2">
            {repeatedCards.map((userCard, index) => (
              <div key={userCard.key} className="flex-shrink-0">
                <UserCardBlock
                  variant={userCard.variant}
                  user={userCard.user}
                />
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </div>
  );
}
