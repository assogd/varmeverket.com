import PayloadAPI from '@/lib/api';
import { SpaceHeader } from '@/components/headers';
import { renderBlocks } from '@/utils/blockRenderer';
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

        {renderBlocks(processedSpace?.layout, { pageType: 'space' })}
      </div>
    </SpacesPageWrapper>
  );
}

export default SpacePage;
