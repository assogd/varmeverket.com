/**
 * Fallback when Payload REST does not return article.form / formSlug.
 * Map article slug → CMS form slug (Content → Forms → slug).
 * Remove an entry once the API includes the relationship again.
 */
export const ARTICLE_FORM_SLUG_BY_ARTICLE_SLUG: Record<string, string> = {
  'amphi-test': 'kontakta-oss',
};

export function getFormSlugForArticle(articleSlug: string): string | null {
  const slug = ARTICLE_FORM_SLUG_BY_ARTICLE_SLUG[articleSlug];
  return typeof slug === 'string' && slug.length > 0 ? slug : null;
}
