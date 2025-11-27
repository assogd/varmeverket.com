/**
 * GraphQL queries for fetching data with proper relationship population
 */

const GRAPHQL_ENDPOINT = '/api/graphql';

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
  }>;
}

/**
 * Fetch data using GraphQL
 */
async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GraphQL query to fetch a page by slug with all nested relationships
 */
export const GET_PAGE_BY_SLUG = `
  query GetPageBySlug($slug: String!) {
    Pages(where: { slug: { equals: $slug } }) {
      docs {
        id
        title
        slug
        layout {
          ... on HorizontalMarqueeBlock {
            blockType
            headline
            description
            speed
            userCards {
              ... on UserCard {
                blockType
                variant
                user {
                  id
                  firstName
                  lastName
                  email
                  bylineDescription
                  profilePicture {
                    id
                    url
                    alt
                    width
                    height
                  }
                  references {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query to fetch a space by slug with all nested relationships
 */
export const GET_SPACE_BY_SLUG = `
  query GetSpaceBySlug($slug: String!) {
    Spaces(where: { slug: { equals: $slug } }) {
      docs {
        id
        title
        slug
        layout {
          ... on HorizontalMarqueeBlock {
            blockType
            headline
            description
            speed
            userCards {
              ... on UserCard {
                blockType
                variant
                user {
                  id
                  firstName
                  lastName
                  email
                  bylineDescription
                  profilePicture {
                    id
                    url
                    alt
                    width
                    height
                  }
                  references {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL query to fetch an article by slug with all nested relationships
 */
export const GET_ARTICLE_BY_SLUG = `
  query GetArticleBySlug($slug: String!) {
    Articles(where: { slug: { equals: $slug } }) {
      docs {
        id
        title
        slug
        layout {
          ... on HorizontalMarqueeBlock {
            blockType
            headline
            description
            speed
            userCards {
              ... on UserCard {
                blockType
                variant
                user {
                  id
                  firstName
                  lastName
                  email
                  bylineDescription
                  profilePicture {
                    id
                    url
                    alt
                    width
                    height
                  }
                  references {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL API class
 */
export class GraphQLAPI {
  /**
   * Find a page by slug using GraphQL
   */
  static async findPageBySlug(slug: string) {
    const response = await graphqlRequest<{
      Pages: {
        docs: Array<{
          id: string;
          title: string;
          slug: string;
          layout: Array<{
            blockType: string;
            [key: string]: unknown;
          }>;
        }>;
      };
    }>(GET_PAGE_BY_SLUG, { slug });

    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      throw new Error(`GraphQL query failed: ${response.errors[0].message}`);
    }

    return response.data.Pages.docs[0] || null;
  }

  /**
   * Find a space by slug using GraphQL
   */
  static async findSpaceBySlug(slug: string) {
    const response = await graphqlRequest<{
      Spaces: {
        docs: Array<{
          id: string;
          title: string;
          slug: string;
          layout: Array<{
            blockType: string;
            [key: string]: unknown;
          }>;
        }>;
      };
    }>(GET_SPACE_BY_SLUG, { slug });

    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      throw new Error(`GraphQL query failed: ${response.errors[0].message}`);
    }

    return response.data.Spaces.docs[0] || null;
  }

  /**
   * Find an article by slug using GraphQL
   */
  static async findArticleBySlug(slug: string) {
    const response = await graphqlRequest<{
      Articles: {
        docs: Array<{
          id: string;
          title: string;
          slug: string;
          layout: Array<{
            blockType: string;
            [key: string]: unknown;
          }>;
        }>;
      };
    }>(GET_ARTICLE_BY_SLUG, { slug });

    if (response.errors) {
      console.error('GraphQL errors:', response.errors);
      throw new Error(`GraphQL query failed: ${response.errors[0].message}`);
    }

    return response.data.Articles.docs[0] || null;
  }
}

export default GraphQLAPI;
