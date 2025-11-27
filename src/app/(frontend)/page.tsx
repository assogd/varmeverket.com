import PayloadAPI from '@/lib/api';
import HomepageHeaderBlock from '@/components/blocks/pages/HomepageHeaderBlock';
import SpotlightBlock from '@/components/blocks/pages/SpotlightBlock';
import HorizontalCardBlock from '@/components/blocks/pages/HorizontalCardBlock';
import React from 'react';
import VideoBlock from '@/components/blocks/VideoBlock';
import CardGridBlock from '@/components/blocks/pages/cardGrid/CardGridBlock';
import { LogotypeWall } from '@/components/blocks/pages/logotypeWall';
import { PartnerCard } from '@/components/blocks/PartnerCard';
import RouterBlock from '@/components/blocks/pages/RouterBlock';
import CarouselBlock from '@/components/blocks/pages/CarouselBlock';
import ListBlock from '@/components/blocks/ListBlock';
import CourseCatalogBlock from '@/components/blocks/pages/CourseCatalogBlock';
import TextBlock from '@/components/blocks/TextBlock';
import { FAQBlock } from '@/components/blocks/FAQ';
import SimpleCarouselBlock from '@/components/blocks/SimpleCarouselBlock';
import AssetTextBlock from '@/components/blocks/AssetTextBlock';
import AssetTextContainerBlock from '@/components/blocks/AssetTextContainerBlock';
import CTABlock from '@/components/blocks/CTABlock';
import HighlightGridBlock from '@/components/blocks/HighlightGridBlock';
import CalendarBlock from '@/components/blocks/CalendarBlock';
import HorizontalMarqueeBlock from '@/components/blocks/HorizontalMarqueeBlock';
import { HighlightGridGeneratorBlock } from '@/components/blocks/HighlightGridGenerator';
import Model3DBlock from '@/components/blocks/Model3DBlock';
import ImageBlock from '@/components/blocks/articles/ImageBlock';
import { processPageLayout } from '@/utils/processDynamicBlocks';

// Define proper types for homepage data
interface HomepageData {
  id: string;
  title: string;
  slug: string;
  header?: {
    text?: string;
    assets?: Array<{
      type: string;
      image?: {
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
    }>;
  };
  layout?: Array<{
    blockType: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

// Helper function to render blocks
function renderBlock(
  block: { blockType: string; [key: string]: unknown },
  i: number
) {
  // Remove expensive deep clone - pass block directly
  const cleanBlock = block;
  switch (block.blockType) {
    case 'assetText':
      return <AssetTextBlock key={i} {...cleanBlock} />;
    case 'assetTextContainer':
      return <AssetTextContainerBlock key={i} {...cleanBlock} />;
    case 'spotlight':
      return <SpotlightBlock key={i} {...cleanBlock} />;
    case 'horizontal-card-block':
      return <HorizontalCardBlock key={i} {...cleanBlock} />;
    case 'video':
      return <VideoBlock key={i} {...cleanBlock} />;
    case 'card-grid':
      return <CardGridBlock key={i} {...cleanBlock} />;
    case 'orange-card-grid':
      return <CardGridBlock key={i} {...cleanBlock} backgroundColor="orange" />;
    case 'logotype-wall':
      return <LogotypeWall key={i} {...cleanBlock} />;
    case 'partner-block':
      return <PartnerCard key={i} {...cleanBlock} />;
    case 'router':
      return <RouterBlock key={i} {...cleanBlock} />;
    case 'carousel':
      return <CarouselBlock key={i} {...cleanBlock} />;
    case 'list':
      return <ListBlock key={i} {...cleanBlock} />;
    case 'courseCatalog':
      return <CourseCatalogBlock key={i} {...cleanBlock} />;
    case 'text':
      return <TextBlock key={i} {...cleanBlock} />;
    case 'textBlock':
      return <TextBlock key={i} {...cleanBlock} />;
    case 'faq':
      return <FAQBlock key={i} {...cleanBlock} />;
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
    case '3D':
      return <Model3DBlock key={i} {...cleanBlock} />;
    case 'image':
      return <ImageBlock key={i} {...cleanBlock} />;
    // Add more cases for other block types
    default:
      return null;
  }
}

export default async function HomePage() {
  // Fetch the homepage with REST API using slug
  const page = (await PayloadAPI.findBySlug(
    'pages',
    'hem',
    10
  )) as HomepageData | null;

  if (!page) {
    return <div>Page not found</div>;
  }

  // Process dynamic blocks on the server side
  const processedPage = await processPageLayout(page);
  const blocks = processedPage.layout || [];

  return (
    <div className="homepage">
      {processedPage.header ? (
        <HomepageHeaderBlock
          text={(processedPage as HomepageData).header!.text}
          assets={
            (processedPage as HomepageData).header!.assets as Array<{
              type: 'image' | 'mux';
              placement: 'before' | 'after';
              image?: {
                url: string;
                alt?: string;
                width?: number;
                height?: number;
              };
              mux?: string;
            }>
          }
        >
          {blocks.map(
            (block: { blockType: string; [key: string]: unknown }, i: number) =>
              renderBlock(block, i)
          )}
        </HomepageHeaderBlock>
      ) : (
        blocks.map(
          (block: { blockType: string; [key: string]: unknown }, i: number) =>
            renderBlock(block, i)
        )
      )}
    </div>
  );
}
