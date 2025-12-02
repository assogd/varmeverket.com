import PayloadAPI from '@/lib/api';
import { SpaceHeader } from '@/components/headers';
import { renderBlocks } from '@/utils/blockRenderer';
import PageLayout from '@/components/layout/PageLayout';
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
  const layout = (processedSpace?.layout as Array<{ blockType: string; [key: string]: unknown }>) || [];
  const lastBlock = layout[layout.length - 1];
  const lastBlockIsMatch =
    lastBlock?.blockType === 'highlightGridGenerator' ||
    lastBlock?.blockType === 'router';

  return (
    <SpacesPageWrapper>
      <PageLayout
        contentType="space"
        paddingBottom={!lastBlockIsMatch}
      >
        {/* Hero Section */}
        <SpaceHeader
          spaceData={processedSpace as SpaceDataForHeader}
          header={processedSpace.header as SpaceHeaderData | undefined}
        />

        {renderBlocks(processedSpace?.layout, { pageType: 'space' })}
      </PageLayout>
    </SpacesPageWrapper>
  );
}

export default SpacePage;
