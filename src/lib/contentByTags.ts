import { PayloadAPI } from './api';
import { buildEventUrl } from '@/utils/eventUrl';

export interface ContentByTagsOptions {
  tagIds: string[];
  contentTypes: string[];
  limit: number;
  sort: string;
  status: string;
}

export interface ContentByTagsResult {
  articles: unknown[];
  showcases: unknown[];
  events: unknown[];
  totalCount: number;
}

/**
 * Core logic for fetching and filtering content by tags
 * This can be used both in API routes and server components
 */
export async function getContentByTagsCore(
  options: ContentByTagsOptions
): Promise<ContentByTagsResult> {
  const { tagIds, contentTypes, limit, sort, status } = options;

  const results: ContentByTagsResult = {
    articles: [],
    showcases: [],
    events: [],
    totalCount: 0,
  };

  // Fetch articles if requested
  if (contentTypes.includes('articles')) {
    const MAX_FETCH_LIMIT = 500;
    let allArticles: unknown[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = tagIds.length > 0 ? 50 : 100;

    // Fetch in pages until we have enough filtered results
    while (hasMore && allArticles.length < MAX_FETCH_LIMIT) {
      const articlesResult = await PayloadAPI.find({
        collection: 'articles',
        where: {
          status: { equals: status },
        },
        limit: pageSize,
        page,
        sort,
        depth: 2,
      });

      allArticles = [...allArticles, ...articlesResult.docs];
      hasMore = articlesResult.hasNextPage || false;
      page++;

      // If filtering by tags, check if we have enough filtered results
      if (tagIds.length > 0) {
        const filteredSoFar = allArticles.filter((article: unknown) => {
          const articleObj = article as {
            tags?: Array<{
              id?: string;
              _id?: string;
              [key: string]: unknown;
            }>;
            [key: string]: unknown;
          };
          const articleTags = articleObj?.tags || [];
          return articleTags.some(
            (tag: { id?: string; _id?: string; [key: string]: unknown }) => {
              const tagId = tag.id || tag._id;
              return tagId && tagIds.includes(String(tagId));
            }
          );
        });

        if (filteredSoFar.length >= limit) {
          hasMore = false;
        }
      } else {
        // No tag filtering, stop when we have enough
        if (allArticles.length >= limit) {
          hasMore = false;
        }
      }
    }

    // Filter by tags if needed
    let filteredArticles = allArticles;
    if (tagIds.length > 0) {
      filteredArticles = allArticles.filter((article: unknown) => {
        const articleObj = article as {
          tags?: Array<{
            id?: string;
            _id?: string;
            [key: string]: unknown;
          }>;
          [key: string]: unknown;
        };
        const articleTags = articleObj?.tags || [];
        return articleTags.some(
          (tag: { id?: string; _id?: string; [key: string]: unknown }) => {
            const tagId = tag.id || tag._id;
            return tagId && tagIds.includes(String(tagId));
          }
        );
      });
    }

    results.articles = filteredArticles.slice(0, limit);
  }

  // Fetch showcases if requested
  if (contentTypes.includes('showcases')) {
    const MAX_FETCH_LIMIT = 500;
    let allShowcases: unknown[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = tagIds.length > 0 ? 50 : 100;
    const showcaseSort =
      sort === '-publishedDate' || sort === 'publishedDate'
        ? '-createdAt'
        : sort;

    // Fetch in pages until we have enough filtered results
    while (hasMore && allShowcases.length < MAX_FETCH_LIMIT) {
      const showcasesResult = await PayloadAPI.find({
        collection: 'showcases',
        where: {},
        limit: pageSize,
        page,
        sort: showcaseSort,
        depth: 2,
      });

      allShowcases = [...allShowcases, ...showcasesResult.docs];
      hasMore = showcasesResult.hasNextPage || false;
      page++;

      // If filtering by tags, check if we have enough filtered results
      if (tagIds.length > 0) {
        const filteredSoFar = allShowcases.filter((showcase: unknown) => {
          const showcaseObj = showcase as {
            tags?: Array<{
              id?: string;
              _id?: string;
              [key: string]: unknown;
            }>;
            [key: string]: unknown;
          };
          const showcaseTags = showcaseObj?.tags || [];
          return showcaseTags.some(
            (tag: { id?: string; _id?: string; [key: string]: unknown }) => {
              const tagId = tag.id || tag._id;
              return tagId && tagIds.includes(String(tagId));
            }
          );
        });

        if (filteredSoFar.length >= limit) {
          hasMore = false;
        }
      } else {
        // No tag filtering, stop when we have enough
        if (allShowcases.length >= limit) {
          hasMore = false;
        }
      }
    }

    // Filter by tags if needed
    let filteredShowcases = allShowcases;
    if (tagIds.length > 0) {
      filteredShowcases = allShowcases.filter((showcase: unknown) => {
        const showcaseObj = showcase as {
          tags?: Array<{
            id?: string;
            _id?: string;
            [key: string]: unknown;
          }>;
          [key: string]: unknown;
        };
        const showcaseTags = showcaseObj?.tags || [];
        return showcaseTags.some(
          (tag: { id?: string; _id?: string; [key: string]: unknown }) => {
            const tagId = tag.id || tag._id;
            return tagId && tagIds.includes(String(tagId));
          }
        );
      });
    }

    results.showcases = filteredShowcases.slice(0, limit);
  }

  // Fetch events if requested
  if (contentTypes.includes('events')) {
    const MAX_FETCH_LIMIT = 500;
    let allEvents: unknown[] = [];
    let page = 1;
    let hasMore = true;
    const pageSize = tagIds.length > 0 ? 50 : 100;
    const eventSort =
      sort === '-publishedDate' || sort === 'publishedDate'
        ? 'startDateTime'
        : sort;

    while (hasMore && allEvents.length < MAX_FETCH_LIMIT) {
      const eventsResult = await PayloadAPI.find({
        collection: 'events',
        where: {
          or: [
            { status: { equals: status } },
            { _status: { equals: status } },
          ],
        },
        limit: pageSize,
        page,
        sort: eventSort,
        depth: 2,
      });

      allEvents = [...allEvents, ...eventsResult.docs];
      hasMore = eventsResult.hasNextPage || false;
      page++;

      if (tagIds.length > 0) {
        const filteredSoFar = allEvents.filter((event: unknown) => {
          const eventObj = event as {
            tags?: Array<{ id?: string; _id?: string }>;
          };
          const eventTags = eventObj?.tags || [];
          return eventTags.some(tag => {
            const tagId = tag.id || tag._id;
            return tagId && tagIds.includes(String(tagId));
          });
        });
        if (filteredSoFar.length >= limit) {
          hasMore = false;
        }
      } else if (allEvents.length >= limit) {
        hasMore = false;
      }
    }

    let filteredEvents = allEvents;
    if (tagIds.length > 0) {
      filteredEvents = allEvents.filter((event: unknown) => {
        const eventObj = event as {
          tags?: Array<{ id?: string; _id?: string }>;
        };
        const eventTags = eventObj?.tags || [];
        return eventTags.some(tag => {
          const tagId = tag.id || tag._id;
          return tagId && tagIds.includes(String(tagId));
        });
      });
    }

    const childParentMap = new Map<string, string>();
    const eventsWithChildren = filteredEvents.filter((event: unknown) => {
      const eventObj = event as { slug?: string; children?: Array<{ id?: string }> };
      return Boolean(eventObj.slug && Array.isArray(eventObj.children));
    });

    for (const parent of eventsWithChildren) {
      const parentObj = parent as { slug?: string; children?: Array<{ id?: string }> };
      const parentSlug = parentObj.slug;
      if (!parentSlug || !Array.isArray(parentObj.children)) continue;
      for (const child of parentObj.children) {
        const childId = child?.id;
        if (childId) childParentMap.set(String(childId), parentSlug);
      }
    }

    results.events = filteredEvents.slice(0, limit).map((event: unknown) => {
      const eventObj = event as {
        id?: string;
        slug?: string;
        startDateTime?: string;
        href?: string;
      };
      const id = String(eventObj.id || '');
      const parentSlug = childParentMap.get(id);
      return {
        ...(event as Record<string, unknown>),
        href: buildEventUrl({
          slug: eventObj.slug ?? '',
          startDateTime: eventObj.startDateTime,
          parentSlug,
          href: eventObj.href,
        }),
        parentSlug,
      };
    });
  }

  // If both content types, combine and sort
  if (contentTypes.length > 1) {
    const combined = [
      ...results.articles.map((item: unknown) => ({
        ...(item as Record<string, unknown>),
        _contentType: 'article',
      })),
      ...results.showcases.map((item: unknown) => ({
        ...(item as Record<string, unknown>),
        _contentType: 'showcase',
      })),
      ...results.events.map((item: unknown) => ({
        ...(item as Record<string, unknown>),
        _contentType: 'event',
      })),
    ];

    // Sort combined results
    combined.sort((a, b) => {
      if (sort === '-publishedDate' || sort === '-createdAt') {
        const dateA =
          (a.publishedDate as string) ||
          (a.createdAt as string) ||
          (a.startDateTime as string);
        const dateB =
          (b.publishedDate as string) ||
          (b.createdAt as string) ||
          (b.startDateTime as string);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      } else if (sort === 'publishedDate' || sort === 'createdAt') {
        const dateA =
          (a.publishedDate as string) ||
          (a.createdAt as string) ||
          (a.startDateTime as string);
        const dateB =
          (b.publishedDate as string) ||
          (b.createdAt as string) ||
          (b.startDateTime as string);
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      } else if (sort === 'title') {
        return (a.title as string).localeCompare(b.title as string);
      } else if (sort === '-title') {
        return (b.title as string).localeCompare(a.title as string);
      } else if (sort === 'year' || sort === '-year') {
        const yearA = (a.year as number) || 0;
        const yearB = (b.year as number) || 0;
        return sort === 'year' ? yearA - yearB : yearB - yearA;
      }
      return 0;
    });

    // Limit combined results
    const limited = combined.slice(0, limit);

    // Split back into articles and showcases
    results.articles = limited
      .filter(item => item._contentType === 'article')
      .map(item => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _contentType, ...rest } = item;
        return rest;
      });
    results.showcases = limited
      .filter(item => item._contentType === 'showcase')
      .map(item => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _contentType, ...rest } = item;
        return rest;
      });
    results.events = limited
      .filter(item => item._contentType === 'event')
      .map(item => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _contentType, ...rest } = item;
        return rest;
      });
  }

  results.totalCount =
    results.articles.length + results.showcases.length + results.events.length;

  return results;
}

