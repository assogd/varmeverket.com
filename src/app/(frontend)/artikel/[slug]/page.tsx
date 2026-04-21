import { PayloadAPI } from '@/lib/api';
import { ArticleHeader } from '@/components/headers';
import ArticleContent from '@/components/blocks/articles/ArticleContent';
import FormBlock from '@/components/blocks/interactive/FormBlock';
import RelatedArticles from '@/components/articles/RelatedArticles';
import PageLayout from '@/components/layout/PageLayout';
import {
  getAuthorDisplayName,
  getAuthorBylineDescription,
} from '@/utils/authorDisplay';
import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import type { ContentItem } from '@/components/blocks/layout/HighlightGridGenerator/types';

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

/**
 * Article `form` may arrive fully populated from REST (depth) — use as-is.
 * Only fetch when the payload is a bare id / { value } / empty content.
 */
async function resolveArticleFormDoc(
  form: unknown
): Promise<Record<string, unknown> | null> {
  if (form == null) return null;

  // API already returned the full form (e.g. Kontakta oss + content blocks) — do not refetch
  if (typeof form === 'object' && form !== null) {
    const o = form as Record<string, unknown>;
    const content = o.content;
    const hasBlocks = Array.isArray(content) && content.length > 0;
    const hasLegacy =
      (Array.isArray(o.fields) && o.fields.length > 0) ||
      (Array.isArray(o.sections) && o.sections.length > 0);
    if (typeof o.id === 'string' && (hasBlocks || hasLegacy)) {
      return o;
    }
  }

  const asString = (v: unknown): string | null =>
    v == null ? null : typeof v === 'string' ? v : String(v);

  let slug: string | null = null;
  let id: string | null = null;

  if (typeof form === 'string' || typeof form === 'number') {
    id = asString(form);
  } else if (typeof form === 'object' && form !== null) {
    const o = form as Record<string, unknown>;
    if (typeof o.slug === 'string' && o.slug.length > 0) {
      slug = o.slug;
    }
    const rawId =
      asString(o.value) ??
      asString(o.id) ??
      (typeof o._id === 'string' ? o._id : null);
    if (rawId) {
      id = rawId;
    }
  }

  const fetchForm = async (
    where: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    try {
      const result = await PayloadAPI.find<Record<string, unknown>>({
        collection: 'forms',
        where,
        limit: 1,
        depth: 5,
      });
      const doc = result.docs?.[0];
      return doc && typeof doc === 'object' ? doc : null;
    } catch {
      return null;
    }
  };

  // Prefer slug (matches form-test and backend POST /v3/forms/<slug>)
  if (slug) {
    const doc = await fetchForm({ slug: { equals: slug } });
    if (doc) return doc;
  }
  if (id) {
    const doc = await fetchForm({ id: { equals: id } });
    if (doc) return doc;
    // findByID as fallback (direct path)
    try {
      return await PayloadAPI.findByID<Record<string, unknown>>('forms', id, 5);
    } catch {
      return null;
    }
  }

  return null;
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

  // When published JSON omits `form`, try fresh then draft read once (versions/cache).
  let articleForForm: ArticleData = article;
  const formVal = (a: object) => (a as Record<string, unknown>).form;
  const hasFormRef = (a: object) => {
    const f = formVal(a);
    return f != null && f !== '';
  };

  if (!hasFormRef(article as object)) {
    try {
      const fresh = await PayloadAPI.findBySlugFresh<ArticleData>(
        'articles',
        slug,
        10,
        false
      );
      if (fresh && hasFormRef(fresh as object)) articleForForm = fresh;
    } catch {
      /* keep article */
    }
  }
  if (!hasFormRef(articleForForm as object)) {
    try {
      const draftResult = await PayloadAPI.find<ArticleData>({
        collection: 'articles',
        where: { slug: { equals: slug } },
        draft: true,
        limit: 1,
        depth: 10,
      });
      const draftDoc = draftResult.docs?.[0];
      if (draftDoc && hasFormRef(draftDoc as object)) articleForForm = draftDoc;
    } catch {
      /* draft 403 etc. */
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const authorBylineDesc = getAuthorBylineDescription(article.author);

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

  // Article Form field only — embedded object passed through; ref-only resolved by find
  const rawForm = (articleForForm as Record<string, unknown>).form;
  const formSlugFromCms = (articleForForm as Record<string, unknown>).formSlug;
  const formRef =
    rawForm ??
    (typeof formSlugFromCms === 'string' && formSlugFromCms.length > 0
      ? { slug: formSlugFromCms }
      : null);
  // Pass embedded form straight to FormBlock when already complete; otherwise resolve
  const articleFormDoc = formRef ? await resolveArticleFormDoc(formRef) : null;

  // Fetch related articles based on matching tags
  let relatedArticles: ContentItem[] = [];
  if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
    const tagIds = article.tags.map(tag => tag.id).filter(Boolean);
    if (tagIds.length > 0) {
      relatedArticles = await getRelatedArticles(article.id, tagIds);
    }
  }

  return (
    <PageLayout contentType="article">
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

      {/* Form — Article collection relationship field; resolved server-side when ref-only */}
      {articleFormDoc && <FormBlock form={articleFormDoc} />}

      {/* Footer */}
      <footer className="font-mono mx-auto w-full max-w-2xl px-4 -mt-24">
        ———
        <div>
          Författare: &nbsp;
          {getAuthorDisplayName(article.author) || '—'}
        </div>
        <div>Publicerad: {formatDate(article.publishedDate || '')}</div>
        {authorBylineDesc && <div className="mt-4">{authorBylineDesc}</div>}
      </footer>

      {/* Related Articles */}
      {relatedArticles.length >= 2 && (
        <RelatedArticles relatedArticles={relatedArticles} />
      )}
    </PageLayout>
  );
}

export default ArticlePage;
