'use client';

import React, { useState } from 'react';
import { HorizontalScrollContainer } from '@/components/ui/HorizontalScrollContainer';
import {
  ArticleCardWithImage,
  ArticleCardWithoutImage,
} from '@/components/blocks/HighlightGridGenerator';
import type { ContentItem } from '@/components/blocks/HighlightGridGenerator/types';

interface RelatedArticlesProps {
  relatedArticles: ContentItem[];
}

export default function RelatedArticles({
  relatedArticles,
}: RelatedArticlesProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Only render if we have at least 2 related articles
  if (relatedArticles.length < 2) {
    return null;
  }

  return (
    <div className="my-8 relative">
      <div className="relative">
        <hr className="mx-2 my-2" />
        <div className="absolute left-1/2 top-2 bottom-2 border-l border-text transform -translate-x-1/2"></div>

        {/* Headline */}
        <h2 className="text-center font-mono uppercase py-0.5 mb-24 mt-28 relative bg-bg">
          Relaterade artiklar
        </h2>

        {/* Content Grid */}
        <HorizontalScrollContainer
          className="bg-bg mb-28 relative gap-2 pt-2 pb-2"
          enableOverflowDetection={false}
          leftSpacer="1px"
          rightSpacer="1px"
        >
          {relatedArticles.map((item, index) => {
            if (!item) {
              return null;
            }

            const cardId = `article-${item.id}-${index}`;
            const isHovered = hoveredCard === cardId;

            // Determine if item has an image
            const hasImage = !!item.featuredImage;

            // Render appropriate card component
            if (hasImage) {
              return (
                <ArticleCardWithImage
                  key={cardId}
                  item={item}
                  index={index}
                  isHovered={isHovered}
                  onHoverStart={() => setHoveredCard(cardId)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => {}} // No-op since Link handles navigation
                />
              );
            } else {
              return (
                <ArticleCardWithoutImage
                  key={cardId}
                  item={item}
                  index={index}
                  onClick={() => {}} // No-op since Link handles navigation
                />
              );
            }
          })}
        </HorizontalScrollContainer>
        <hr className="mx-2 my-2" />
      </div>
    </div>
  );
}

