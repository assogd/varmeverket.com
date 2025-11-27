import { getContentByTagsCore } from './contentByTags';

export interface DynamicContentOptions {
  limit?: number;
  sort?: string;
  status?: string;
  depth?: number;
}

export interface DynamicContentResult {
  articles: Record<string, unknown>[];
  showcases: Record<string, unknown>[];
  totalCount: number;
}

/**
 * API class for fetching dynamic content based on tags
 * Uses the shared core function for efficient server-side filtering
 */
export class DynamicContentAPI {
  /**
   * Get content by tags from multiple collections
   * Uses the shared core function for efficient server-side filtering
   */
  static async getContentByTags(
    tagIds: string[],
    contentTypes: string[],
    options: DynamicContentOptions = {}
  ): Promise<DynamicContentResult> {
    const {
      limit = 10,
      sort = '-publishedDate',
      status = 'published',
    } = options;

    try {
      const result = await getContentByTagsCore({
        tagIds,
        contentTypes,
        limit,
        sort,
        status,
      });

      return {
        articles: result.articles as Record<string, unknown>[],
        showcases: result.showcases as Record<string, unknown>[],
        totalCount: result.totalCount,
      };
    } catch (error) {
      console.error('Error fetching content by tags:', error);
      // Return empty result on error
      return {
        articles: [],
        showcases: [],
        totalCount: 0,
      };
    }
  }

  /**
   * Get articles by tags
   */
  static async getArticlesByTags(
    tagIds: string[],
    options: DynamicContentOptions = {}
  ) {
    const result = await this.getContentByTags(tagIds, ['articles'], options);
    return result.articles;
  }

  /**
   * Get showcases by tags
   */
  static async getShowcasesByTags(
    tagIds: string[],
    options: DynamicContentOptions = {}
  ) {
    const result = await this.getContentByTags(tagIds, ['showcases'], options);
    return result.showcases;
  }

  /**
   * Get mixed content by tags (articles and showcases)
   */
  static async getMixedContentByTags(
    tagIds: string[],
    options: DynamicContentOptions = {}
  ) {
    return this.getContentByTags(tagIds, ['articles', 'showcases'], options);
  }

  /**
   * Get content by a single tag
   */
  static async getContentByTag(
    tagId: string,
    contentTypes: string[],
    options: DynamicContentOptions = {}
  ) {
    return this.getContentByTags([tagId], contentTypes, options);
  }
}
