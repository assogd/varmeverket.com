import { DynamicContentAPI } from '@/lib/dynamicContent';

/**
 * Process dynamic blocks on the server side to populate content
 * This runs during page generation to fetch and inject dynamic content
 */
export async function processDynamicBlocks(
  layout: Array<{
    blockType: string;
    filterTags?: Array<{
      id?: string;
      _id?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>
): Promise<
  Array<{
    blockType: string;
    filterTags?: Array<{
      id?: string;
      _id?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>
> {
  const processedLayout = await Promise.all(
    layout.map(async block => {
      if (block.blockType === 'highlightGridGenerator') {
        try {
          // Extract tag IDs from the relationship data
          // Payload relationships can be: string ID, { value: string }, { id: string }, or populated object
          const tagIds =
            block.filterTags
              ?.map((tag: unknown) => {
                // If it's already a string, use it directly
                if (typeof tag === 'string') {
                  return tag;
                }
                // If it's an object, check for various Payload relationship formats
                if (tag && typeof tag === 'object') {
                  const tagObj = tag as Record<string, unknown>;
                  // Payload relationship format: { value: 'id' }
                  if (tagObj.value && typeof tagObj.value === 'string') {
                    return tagObj.value;
                  }
                  // Populated relationship format: { id: 'id', name: '...', ... }
                  if (tagObj.id && typeof tagObj.id === 'string') {
                    return tagObj.id;
                  }
                  // MongoDB format: { _id: 'id' }
                  if (tagObj._id && typeof tagObj._id === 'string') {
                    return tagObj._id;
                  }
                }
                return null;
              })
              .filter((id): id is string => Boolean(id)) || [];

          // If no tags are selected, show all content (tagIds can be empty)

          // Ensure contentTypes is an array
          const contentTypes = Array.isArray(block.contentTypes)
            ? block.contentTypes
            : ['articles'];

          // Fetch dynamic content
          const generatedContent = await DynamicContentAPI.getContentByTags(
            tagIds,
            contentTypes,
            {
              limit: typeof block.maxItems === 'number' ? block.maxItems : 6,
              sort:
                typeof block.sortBy === 'string'
                  ? block.sortBy
                  : '-publishedDate',
              depth: 2, // Optimized depth for better performance
            }
          );

          return {
            ...block,
            generatedContent,
          };
        } catch {
          return {
            ...block,
            generatedContent: {
              articles: [],
              showcases: [],
              totalCount: 0,
            },
          };
        }
      }

      // Return other blocks unchanged
      return block;
    })
  );

  return processedLayout;
}

/**
 * Process a single page's layout for dynamic content
 */
export async function processPageLayout(page: {
  layout?: Array<{
    blockType: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}): Promise<{
  layout?: Array<{
    blockType: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}> {
  if (!page.layout) {
    return page;
  }

  const processedLayout = await processDynamicBlocks(page.layout);

  return {
    ...page,
    layout: processedLayout,
  };
}
