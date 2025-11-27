'use client';
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MediaCard } from '@/components/blocks/MediaCard';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import { AppAction } from '@/components/ui';
import { HorizontalSnapCarousel } from '@/components/carousels';
import {
  InfoOverlay,
  OverlayCard as OverlayCardComponent,
} from '@/components/blocks/overlay';
import { routeLink, LinkGroup } from '@/utils/linkRouter';

interface Card {
  blockType?: 'common-card';
  tags?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  title: string;
  body?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  image?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  link?: LinkGroup;
}

interface OverlayCard {
  headline: string;
  heroImage?: {
    url?: string;
    alt?: string;
  };
  layout?: unknown[];
  link?: unknown;
}

interface HorizontalCardBlockProps {
  headline: string;
  cardType: 'common' | 'overlay';
  cards?: Card[];
  overlayCards?: OverlayCard[];
  link?: LinkGroup;
}

const HorizontalCardBlock: React.FC<HorizontalCardBlockProps> = ({
  headline,
  cardType,
  cards,
  overlayCards,
  link,
}) => {
  // Use the global router to resolve the link
  const linkResult = link ? routeLink(link) : null;

  // State for overlay management
  const [selectedOverlay, setSelectedOverlay] = useState<OverlayCard | null>(
    null
  );

  // Render Common Cards (traditional cards with CTA)
  const renderCommonCards = () => {
    if (!cards || cards.length === 0) return null;

    return (
      <HorizontalSnapCarousel
        showDevIndicator={false}
        getItemTitle={index => cards[index]?.title || `Card ${index + 1}`}
      >
        {cards.map((card, index) => (
          <MediaCard
            key={index}
            {...card}
            buttonVariant="primary"
            inCarousel={true}
          />
        ))}
      </HorizontalSnapCarousel>
    );
  };

  // Render Overlay Cards (cards that open overlays)
  const renderOverlayCards = () => {
    if (!overlayCards || overlayCards.length === 0) return null;

    return (
      <HorizontalSnapCarousel
        showDevIndicator={false}
        getItemTitle={index =>
          overlayCards[index]?.headline || `Overlay Card ${index + 1}`
        }
      >
        {overlayCards.map((overlayCard, index) => (
          <OverlayCardComponent
            key={index}
            overlay={overlayCard}
            index={index}
            onClick={(overlay: unknown) =>
              setSelectedOverlay(overlay as OverlayCard)
            }
            isInView={true}
          />
        ))}
      </HorizontalSnapCarousel>
    );
  };

  // Handle overlay close
  const handleCloseOverlay = () => {
    setSelectedOverlay(null);
  };

  return (
    <section className="py-12 relative" role="region" aria-label={headline}>
      <DevIndicator componentName="HorizontalCardBlock" />
      <BlockHeader headline={headline} />

      {cardType === 'common' ? renderCommonCards() : renderOverlayCards()}

      {linkResult?.href && link?.text && (
        <div className="flex justify-center mt-8">
          <AppAction
            link={link}
            variant="minimal"
            className="font-mono uppercase underline"
          >
            {link.text}
          </AppAction>
        </div>
      )}

      {/* Info Overlay */}
      <AnimatePresence>
        {selectedOverlay && (
          <InfoOverlay
            overlay={selectedOverlay}
            isOpen={!!selectedOverlay}
            onClose={handleCloseOverlay}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default HorizontalCardBlock;
