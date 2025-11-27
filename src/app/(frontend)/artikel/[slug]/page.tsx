import { PayloadAPI } from '@/lib/api';
import { ArticleHeader } from '@/components/headers';
import ArticleContent from '@/components/blocks/articles/ArticleContent';
import RelatedArticles from '@/components/articles/RelatedArticles';
import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import type { ContentItem } from '@/components/blocks/HighlightGridGenerator/types';

// Define proper types for article data
interface ArticleData {
  id: string;
  title: string;
  slug: string;
  status?: string;
  publishedDate?: string;
  lastModifiedDate?: string;
  author: {
    firstName?: string;
    lastName?: string;
    email: string;
    bylineDescription?: string;
  };
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
  content?: Array<{
    blockType: string;
    [key: string]: unknown;
  }>;
  tags?: Array<{
    id: string;
    name: string;
  }>;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  [key: string]: unknown;
}

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Use the dedicated findBySlug method which handles the query properly
  const article = (await PayloadAPI.findBySlug(
    'articles',
    slug,
    10,
    false
  )) as ArticleData | null;

  // In production, check if article is published
  if (
    process.env.NODE_ENV === 'production' &&
    article &&
    article.status !== 'published'
  ) {
    notFound();
  }

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Cached function to fetch related articles (per article ID)
  const getRelatedArticles = cache(
    async (articleId: string, tagIds: string[]): Promise<ContentItem[]> => {
      if (tagIds.length === 0) return [];

      try {
        // Fetch published articles with matching tags (limit to 20 for performance)
        const allArticles = await PayloadAPI.find<ArticleData>({
          collection: 'articles',
          where: {
            and: [
              {
                or: tagIds.map(tagId => ({
                  'tags.id': { equals: tagId },
                })),
              },
              {
                status: { equals: 'published' },
              },
            ],
          },
          depth: 2,
          limit: 20, // Reduced from 50 - we only need 6, 20 is enough for sorting
          sort: '-publishedDate',
        });

        // Filter out current article and calculate matching tag count
        const articlesWithMatchCount = allArticles.docs
          .filter(relatedArticle => relatedArticle.id !== articleId)
          .map(relatedArticle => {
            const relatedTagIds =
              relatedArticle.tags && Array.isArray(relatedArticle.tags)
                ? relatedArticle.tags.map((tag: { id: string }) => tag.id)
                : [];
            const matchCount = tagIds.filter(id =>
              relatedTagIds.includes(id)
            ).length;
            return {
              article: relatedArticle,
              matchCount,
            };
          });

        // Sort by match count (desc), then by publishedDate (desc)
        articlesWithMatchCount.sort((a, b) => {
          if (a.matchCount !== b.matchCount) {
            return b.matchCount - a.matchCount;
          }
          const dateA = new Date(a.article.publishedDate || 0).getTime();
          const dateB = new Date(b.article.publishedDate || 0).getTime();
          return dateB - dateA;
        });

        // Transform to ContentItem format and limit to 6
        return articlesWithMatchCount
          .slice(0, 6)
          .map(({ article: relatedArticle }) => ({
            id: relatedArticle.id,
            title: relatedArticle.title,
            slug: relatedArticle.slug,
            featuredImage: relatedArticle.featuredImage
              ? {
                  id: relatedArticle.featuredImage.id || '',
                  url: relatedArticle.featuredImage.url || '',
                  alt: relatedArticle.featuredImage.alt,
                  width: relatedArticle.featuredImage.width,
                  height: relatedArticle.featuredImage.height,
                }
              : undefined,
            publishedDate: relatedArticle.publishedDate,
            tags: relatedArticle.tags,
            _contentType: 'article' as const,
          }));
      } catch (error) {
        console.error('Failed to fetch related articles:', error);
        return [];
      }
    }
  );

  // Fetch related articles based on matching tags
  let relatedArticles: ContentItem[] = [];
  if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
    const tagIds = article.tags.map(tag => tag.id).filter(Boolean);
    if (tagIds.length > 0) {
      relatedArticles = await getRelatedArticles(article.id, tagIds);
    }
  }

  return (
    <div data-content-type="article" className="min-h-screen grid gap-24 pb-36">
      {/* Article Header */}
      <ArticleHeader
        articleData={article}
        header={
          article.header as {
            text?: string;
            assets?: Array<{
              type: 'image' | 'mux';
              placement: 'before' | 'after';
              image?: {
                url: string;
                alt?: string;
                width?: number;
                height?: number;
              };
              mux?: string;
            }>;
          }
        }
      />

      {/* Main Content */}
      <ArticleContent
        content={
          article.content as unknown as {
            root: {
              children: Array<{
                type: string;
                children?: Array<{
                  text?: string;
                  type?: string;
                }>;
              }>;
            };
          }
        }
      />

      {/* Footer */}
      <footer className="font-mono mx-auto w-full max-w-2xl px-4 -mt-24">
        ———
        <div>
          Författare: &nbsp;
          {article.author.firstName && article.author.lastName
            ? `${article.author.firstName} ${article.author.lastName}`
            : article.author.email}
        </div>
        <div>Publicerad: {formatDate(article.publishedDate || '')}</div>
        {article.author?.bylineDescription && (
          <div className="mt-4">{article.author.bylineDescription}</div>
        )}
      </footer>

      {/* Related Articles */}
      {relatedArticles.length >= 2 && (
        <RelatedArticles relatedArticles={relatedArticles} />
      )}
    </div>
  );
}

export default ArticlePage;
