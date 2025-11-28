import React from 'react';
import type { ComponentType } from 'react';

// Block component imports
import AssetTextBlock from '@/components/blocks/composite/AssetTextBlock';
import AssetTextContainerBlock from '@/components/blocks/composite/AssetTextContainerBlock';
import SpotlightBlock from '@/components/blocks/interactive/SpotlightBlock';
import HorizontalCardBlock from '@/components/blocks/layout/HorizontalCardBlock';
import VideoBlock from '@/components/blocks/media/VideoBlock';
import CardGridBlock from '@/components/blocks/layout/cardGrid/CardGridBlock';
import { LogotypeWall } from '@/components/blocks/brand/logotypeWall';
import { PartnerCard } from '@/components/blocks/brand/PartnerCard';
import RouterBlock from '@/components/blocks/layout/RouterBlock';
import CarouselBlock from '@/components/blocks/layout/CarouselBlock';
import ListBlock from '@/components/blocks/layout/ListBlock';
import CourseCatalogBlock from '@/components/blocks/specialized/CourseCatalogBlock';
import TextBlock from '@/components/blocks/content/TextBlock';
import { FAQBlock } from '@/components/blocks/interactive/FAQ';
import MinimalCarousel from '@/components/blocks/layout/MinimalCarousel';
import CTABlock from '@/components/blocks/interactive/CTABlock';
import HighlightGridBlock from '@/components/blocks/layout/HighlightGridBlock';
import CalendarBlock from '@/components/blocks/interactive/CalendarBlock';
import HorizontalMarqueeBlock from '@/components/blocks/interactive/HorizontalMarqueeBlock';
import { HighlightGridGeneratorBlock } from '@/components/blocks/layout/HighlightGridGenerator';
import Model3DBlock from '@/components/blocks/media/Model3DBlock';
import ImageBlock from '@/components/blocks/media/ImageBlock';

export interface Block {
  blockType: string;
  [key: string]: unknown;
}

type BlockRenderer = (
  block: Block,
  index: number,
  options?: { pageType?: 'space' | 'page' }
) => React.ReactElement | null;

// Block registry mapping blockType to component
const blockRegistry: Record<
  string,
  ComponentType<any> | ((props: any) => React.ReactElement | null)
> = {
  assetText: AssetTextBlock,
  assetTextContainer: AssetTextContainerBlock,
  spotlight: SpotlightBlock,
  'horizontal-card-block': HorizontalCardBlock,
  video: VideoBlock,
  'card-grid': CardGridBlock,
  'logotype-wall': LogotypeWall,
  'partner-block': PartnerCard,
  router: RouterBlock,
  carousel: CarouselBlock,
  list: ListBlock,
  courseCatalog: CourseCatalogBlock,
  text: TextBlock,
  textBlock: TextBlock, // Alias for text
  faq: FAQBlock,
  minimalCarousel: MinimalCarousel,
  cta: CTABlock,
  highlightGrid: HighlightGridBlock,
  calendar: CalendarBlock,
  horizontalMarquee: HorizontalMarqueeBlock,
  highlightGridGenerator: HighlightGridGeneratorBlock,
  '3D': Model3DBlock,
  image: ImageBlock,
};

/**
 * Renders a block component based on its blockType
 */
export const renderBlock: BlockRenderer = (block, index, options = {}) => {
  const { blockType, ...blockProps } = block;

  // Handle special cases
  if (blockType === 'orange-card-grid') {
    return (
      <CardGridBlock key={index} {...blockProps} backgroundColor="orange" />
    );
  }

  // Get component from registry
  const Component = blockRegistry[blockType];

  if (!Component) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unknown block type: ${blockType}`);
    }
    return null;
  }

  // Handle components that need special props
  if (blockType === 'assetText' && options.pageType) {
    return (
      <Component key={index} {...blockProps} pageType={options.pageType} />
    );
  }

  return <Component key={index} {...blockProps} />;
};

/**
 * Renders an array of blocks
 */
export const renderBlocks = (
  blocks: Block[] | undefined,
  options?: { pageType?: 'space' | 'page' }
): React.ReactElement[] => {
  if (!blocks) return [];

  return blocks.map((block, index) => renderBlock(block, index, options));
};
