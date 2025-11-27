import PayloadAPI from '@/lib/api';
import ListBlock from '@/components/blocks/ListBlock';
import TextBlock from '@/components/blocks/TextBlock';
import SimpleCarouselBlock from '@/components/blocks/SimpleCarouselBlock';
import AssetTextBlock from '@/components/blocks/AssetTextBlock';
import AssetTextContainerBlock from '@/components/blocks/AssetTextContainerBlock';
import { LogotypeWall } from '@/components/blocks/pages/logotypeWall';
import { PartnerCard } from '@/components/blocks/PartnerCard';
import CTABlock from '@/components/blocks/CTABlock';
import HighlightGridBlock from '@/components/blocks/HighlightGridBlock';
import CalendarBlock from '@/components/blocks/CalendarBlock';
import HorizontalMarqueeBlock from '@/components/blocks/HorizontalMarqueeBlock';
import { HighlightGridGeneratorBlock } from '@/components/blocks/HighlightGridGenerator';
import SpotlightBlock from '@/components/blocks/pages/SpotlightBlock';
import CardGridBlock from '@/components/blocks/pages/cardGrid/CardGridBlock';
import RouterBlock from '@/components/blocks/pages/RouterBlock';
import CarouselBlock from '@/components/blocks/pages/CarouselBlock';
import { FAQBlock } from '@/components/blocks/FAQ';
import { SpaceHeader } from '@/components/headers';
import React from 'react';
import { notFound } from 'next/navigation';
import { SpacesPageWrapper } from '@/components/wrappers';
import { processPageLayout } from '@/utils/processDynamicBlocks';

// Define proper types for space data
interface SpaceHeaderData {
  text?: unknown;
  assets?: Array<{
    type: 'image' | 'mux';
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    mux?: string;
  }>;
}

interface SpaceDataForHeader {
  title?: string;
  capacity?: number;
  areaSize?: number;
  heroAsset?: {
    type?: 'image' | 'mux';
    image?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    mux?: string;
  };
}

interface SpaceData {
  id: string;
  title: string;
  slug: string;
  header?: SpaceHeaderData;
  layout?: Array<{
    blockType: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface SpacePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function SpacePage({ params }: SpacePageProps) {
  const { slug } = await params;

  // Fetch the space with REST API
  const space = (await PayloadAPI.findBySlug(
    'spaces',
    slug,
    10
  )) as SpaceData | null;

  // If space doesn't exist, return 404
  if (!space) {
    notFound();
  }

  // Process dynamic blocks on the server side
  const processedSpace = await processPageLayout(space);

  return (
    <SpacesPageWrapper>
      <div data-content-type="space" className="min-h-screen grid gap-24 pb-36">
        {/* Hero Section */}
        <SpaceHeader
          spaceData={processedSpace as SpaceDataForHeader}
          header={processedSpace.header as SpaceHeaderData | undefined}
        />

        {processedSpace?.layout?.map(
          (block: { blockType: string; [key: string]: unknown }, i: number) => {
            const cleanBlock = JSON.parse(JSON.stringify(block));
            switch (block.blockType) {
              case 'assetText':
                return (
                  <AssetTextBlock key={i} {...cleanBlock} pageType="space" />
                );
              case 'assetTextContainer':
                return <AssetTextContainerBlock key={i} {...cleanBlock} />;
              case 'spotlight':
                return <SpotlightBlock key={i} {...cleanBlock} />;
              case 'logotype-wall':
                return <LogotypeWall key={i} {...cleanBlock} />;
              case 'partner-block':
                return <PartnerCard key={i} {...cleanBlock} />;
              case 'list':
                return <ListBlock key={i} {...cleanBlock} />;
              case 'text':
                return <TextBlock key={i} {...cleanBlock} />;
              case 'minimalCarousel':
                return <SimpleCarouselBlock key={i} {...cleanBlock} />;
              case 'cta':
                return <CTABlock key={i} {...cleanBlock} />;
              case 'highlightGrid':
                return <HighlightGridBlock key={i} {...cleanBlock} />;
              case 'calendar':
                return <CalendarBlock key={i} {...cleanBlock} />;
              case 'horizontalMarquee':
                return <HorizontalMarqueeBlock key={i} {...cleanBlock} />;
              case 'highlightGridGenerator':
                return <HighlightGridGeneratorBlock key={i} {...cleanBlock} />;
              case 'card-grid':
                return <CardGridBlock key={i} {...cleanBlock} />;
              case 'router':
                return <RouterBlock key={i} {...cleanBlock} />;
              case 'carousel':
                return <CarouselBlock key={i} {...cleanBlock} />;
              case 'faq':
                return <FAQBlock key={i} {...cleanBlock} />;
              default:
                console.warn(`Unknown block type: ${block.blockType}`);
                return null;
            }
          }
        )}
      </div>
    </SpacesPageWrapper>
  );
}

export default SpacePage;
