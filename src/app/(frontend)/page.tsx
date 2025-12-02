import PayloadAPI from '@/lib/api';
import HomepageHeaderBlock from '@/components/blocks/pages/HomepageHeaderBlock';
import { renderBlocks } from '@/utils/blockRenderer';
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
  const lastBlock = blocks[blocks.length - 1];
  const lastBlockIsMatch =
    lastBlock?.blockType === 'highlightGridGenerator' ||
    lastBlock?.blockType === 'router';

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
          paddingBottom={!lastBlockIsMatch}
        >
          {renderBlocks(blocks)}
        </HomepageHeaderBlock>
      ) : (
        renderBlocks(blocks)
      )}
    </div>
  );
}
