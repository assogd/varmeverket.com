import PayloadAPI from '@/lib/api';
import { PageHeader } from '@/components/headers';
import { renderBlocks } from '@/utils/blockRenderer';
import PageLayout from '@/components/layout/PageLayout';
import { notFound } from 'next/navigation';
import { getPreviewData, isPreviewFromSearchParams } from '@/utils/preview';
import { processPageLayout } from '@/utils/processDynamicBlocks';

// Define proper types for page data
interface PageData {
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

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;

  // Check if this is a preview request
  const previewData = await getPreviewData();
  const isPreview =
    previewData.isPreview ||
    isPreviewFromSearchParams(
      new URLSearchParams(search as Record<string, string>)
    );

  // Fetch the page with REST API (draft if in preview mode)
  const page = (await PayloadAPI.findBySlug(
    'pages',
    slug,
    10,
    isPreview
  )) as PageData | null;

  // If page doesn't exist, return 404
  if (!page) {
    notFound();
  }

  // Process dynamic blocks on the server side
  const processedPage = await processPageLayout(page);
  const layout = (processedPage as PageData).layout || [];
  const lastBlock = layout[layout.length - 1];
  const lastBlockIsMatch =
    lastBlock?.blockType === 'highlightGridGenerator' ||
    lastBlock?.blockType === 'router';

  return (
    <PageLayout
      contentType="page"
      paddingBottom={!lastBlockIsMatch}
    >
      {(processedPage as PageData).header && (
        <PageHeader
          text={(processedPage as PageData).header!.text}
          assets={
            (processedPage as PageData).header!.assets as Array<{
              type: 'image' | 'mux' | 'video';
              placement: 'before' | 'after';
              image?: {
                url: string;
                alt?: string;
                width?: number;
                height?: number;
              };
              mux?: string;
              video?: {
                url: string;
                alt?: string;
                width?: number;
                height?: number;
              };
            }>
          }
          variant={(processedPage as PageData).header!.variant}
        />
      )}

      {renderBlocks((processedPage as PageData).layout)}
    </PageLayout>
  );
}
