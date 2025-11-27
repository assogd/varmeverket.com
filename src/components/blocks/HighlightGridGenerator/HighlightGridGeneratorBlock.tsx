'use client';

import React, { useState } from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { ContentOverlay } from '@/components/ui/overlays';
import { HorizontalScrollContainer } from '@/components/ui/HorizontalScrollContainer';
import {
  ShowcaseCard,
  ArticleCardWithImage,
  ArticleCardWithoutImage,
  findImageInAssets,
  type ContentItem,
} from './index';

interface HighlightGridGeneratorProps {
  headline: string;
  contentTypes: string[];
  filterTags?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  maxItems: number;
  sortBy: string;
  isHomepage?: boolean;
  // Server-side populated content
  generatedContent: {
    articles: Record<string, unknown>[];
    showcases: Record<string, unknown>[];
    totalCount: number;
  };
}

export default function HighlightGridGeneratorBlock({
  headline,
  generatedContent,
}: HighlightGridGeneratorProps) {
  const [selectedHighlight, setSelectedHighlight] =
    useState<ContentItem | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { articles, showcases } = generatedContent;

  // Combine content for display (API already handles sorting and limiting)
  const allContent: ContentItem[] = [
    ...articles.map(
      item => ({ ...item, _contentType: 'article' as const }) as ContentItem
    ),
    ...showcases.map(
      item => ({ ...item, _contentType: 'showcase' as const }) as ContentItem
    ),
  ];

  // Use the pre-sorted and limited content from the API
  const displayContent = allContent;

  const handleHighlightClick = (highlightData: ContentItem) => {
    // For showcases, open the overlay
    setSelectedHighlight(highlightData);
  };

  const handleClose = () => {
    setSelectedHighlight(null);
  };

  if (displayContent.length === 0) {
    return null;
  }

  return (
    <div className="my-8 relative">
      <DevIndicator componentName="HighlightGridGeneratorBlock" />

      <div className="relative">
        <hr className="mx-2 my-2" />
        <div className="absolute left-1/2 top-2 bottom-2 border-l border-text transform -translate-x-1/2"></div>

        {/* Headline */}
        <h2 className="text-center font-mono uppercase py-0.5 mb-24 mt-28 relative bg-bg">
          {headline}
        </h2>

        {/* Content Grid */}
        <HorizontalScrollContainer
          className="bg-bg mb-28 relative gap-2 pt-2 pb-2"
          enableOverflowDetection={false}
          leftSpacer="1px"
          rightSpacer="1px"
        >
          {displayContent.map((item, index) => {
            if (!item) {
              return null;
            }

            const cardId = `${item._contentType}-${item.id}-${index}`;
            const isHovered = hoveredCard === cardId;

            // Determine if item has an image
            let hasImage = false;
            if (item.featuredImage) {
              hasImage = true;
            } else if (item._contentType === 'showcase' && item.assets) {
              hasImage = !!findImageInAssets(item.assets);
            }

            // Render appropriate card component
            if (item._contentType === 'showcase' && hasImage) {
              return (
                <ShowcaseCard
                  key={cardId}
                  item={item}
                  index={index}
                  isHovered={isHovered}
                  onHoverStart={() => setHoveredCard(cardId)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => handleHighlightClick(item)}
                />
              );
            } else if (item._contentType === 'article' && hasImage) {
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
            } else if (item._contentType === 'article' && !hasImage) {
              return (
                <ArticleCardWithoutImage
                  key={cardId}
                  item={item}
                  index={index}
                  onClick={() => {}} // No-op since Link handles navigation
                />
              );
            }

            // Fallback for showcases without images (shouldn't happen)
            return null;
          })}
        </HorizontalScrollContainer>
        <hr className="mx-2 my-2" />
      </div>

      {/* Content Overlay */}
      <ContentOverlay
        selectedContent={selectedHighlight}
        onClose={handleClose}
      />
    </div>
  );
}
