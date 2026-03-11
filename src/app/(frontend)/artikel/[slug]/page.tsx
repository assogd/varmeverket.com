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
 * Article `form` is a relationship. The REST embed is often truncated (defaultPopulate)
 * or missing `content` blocks — same form works on Pages because layout is loaded differently.
 * Always load the full form doc like form-test: PayloadAPI.find by slug or id, depth 5.
 */
async function resolveArticleFormDoc(
  form: unknown
): Promise<Record<string, unknown> | null> {
  if (form == null) return null;

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
      // #region agent log
      {
        const contentArr = (doc as Record<string, unknown> | undefined)
          ?.content;
        const contentLen = Array.isArray(contentArr) ? contentArr.length : -1;
        const docId =
          doc && typeof doc === 'object' ? (doc as { id?: string }).id : null;
        fetch(
          'http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '95ada4',
            },
            body: JSON.stringify({
              sessionId: '95ada4',
              hypothesisId: 'B',
              location: 'artikel/page.tsx:fetchForm',
              message: 'forms find result',
              data: {
                whereKeys: Object.keys(where),
                docsLength: result.docs?.length ?? 0,
                docId,
                contentLen,
              },
              timestamp: Date.now(),
            }),
          }
        ).catch(() => {});
      }
      // #endregion
      return doc && typeof doc === 'object' ? doc : null;
    } catch (e) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '95ada4',
          },
          body: JSON.stringify({
            sessionId: '95ada4',
            hypothesisId: 'C',
            location: 'artikel/page.tsx:fetchForm catch',
            message: 'forms find threw',
            data: {
              whereKeys: Object.keys(where),
              err: e instanceof Error ? e.message : String(e),
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion
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

  // Stale Next fetch cache can return article without `form` while CMS has it — refresh once
  let articleForForm: ArticleData = article;
  if (!('form' in (article as object))) {
    try {
      const fresh = await PayloadAPI.findBySlugFresh<ArticleData>(
        'articles',
        slug,
        10,
        false
      );
      // #region agent log
      const freshKeys =
        fresh && typeof fresh === 'object'
          ? Object.keys(fresh as object).slice(0, 25)
          : [];
      fetch(
        'http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '95ada4',
          },
          body: JSON.stringify({
            sessionId: '95ada4',
            hypothesisId: 'F',
            location: 'artikel/page.tsx:findBySlugFresh result',
            message: 'fresh article keys',
            data: {
              freshNull: fresh == null,
              freshHasForm: fresh != null && 'form' in (fresh as object),
              freshKeys,
            },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion
      if (fresh && 'form' in fresh && fresh.form != null) {
        articleForForm = fresh;
      }
    } catch (e) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '95ada4',
          },
          body: JSON.stringify({
            sessionId: '95ada4',
            hypothesisId: 'G',
            location: 'artikel/page.tsx:findBySlugFresh catch',
            message: 'fresh fetch threw',
            data: { err: e instanceof Error ? e.message : String(e) },
            timestamp: Date.now(),
          }),
        }
      ).catch(() => {});
      // #endregion
    }
  }

  // #region agent log
  {
    const form = (articleForForm as Record<string, unknown>)['form'];
    const formObj =
      form && typeof form === 'object' && !Array.isArray(form)
        ? (form as Record<string, unknown>)
        : null;
    fetch('http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '95ada4',
      },
      body: JSON.stringify({
        sessionId: '95ada4',
        hypothesisId: 'A',
        location: 'artikel/page.tsx:after findBySlug',
        message: 'article.form snapshot',
        data: {
          articleSlug: article.slug,
          hasFormKey: 'form' in (articleForForm as object),
          usedFresh: articleForForm !== article,
          formType:
            form === null
              ? 'null'
              : form === undefined
                ? 'undefined'
                : typeof form,
          formSlug:
            formObj && typeof formObj.slug === 'string' ? formObj.slug : null,
          formId:
            formObj && typeof formObj.id === 'string'
              ? formObj.id
              : typeof form === 'string'
                ? form
                : null,
          formValue:
            formObj && formObj.value != null ? typeof formObj.value : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

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

  // Form relationship — API often omits `form`; formSlug is set on save in CMS (Articles hook)
  const formRef =
    articleForForm.form ??
    (typeof (articleForForm as Record<string, unknown>).formSlug === 'string' &&
    ((articleForForm as Record<string, unknown>).formSlug as string).length > 0
      ? { slug: (articleForForm as Record<string, unknown>).formSlug as string }
      : null);
  const articleFormDoc = formRef ? await resolveArticleFormDoc(formRef) : null;

  // #region agent log
  {
    const d = articleFormDoc as Record<string, unknown> | null;
    const contentLen = d && Array.isArray(d.content) ? d.content.length : -1;
    fetch('http://127.0.0.1:7245/ingest/a564f963-db4d-48ea-9945-48b3920d8b64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '95ada4',
      },
      body: JSON.stringify({
        sessionId: '95ada4',
        hypothesisId: 'D',
        location: 'artikel/page.tsx:after resolveArticleFormDoc',
        message: 'resolved form doc',
        data: {
          hasDoc: !!articleFormDoc,
          docSlug: d && typeof d.slug === 'string' ? d.slug : null,
          contentLen,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

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
