/**
 * Fallback when Payload REST does not return article.form / formSlug.
 * Map article slug → CMS form slug (Content → Forms → slug field — must match exactly).
 * Remove an entry once the API includes the relationship again.
 *
 * Example: if amphi-test should use the Kickstart form and that form’s slug in CMS is kickstart:
 *   'amphi-test': 'kickstart',
 */
export const ARTICLE_FORM_SLUG_BY_ARTICLE_SLUG: Record<string, string> = {
  // amphi-test was linked to Kickstart in CMS (slug kickstart) — not kontakta-oss
  'amphi-test': 'kickstart',
};

export function getFormSlugForArticle(articleSlug: string): string | null {
  const slug = ARTICLE_FORM_SLUG_BY_ARTICLE_SLUG[articleSlug];
  return typeof slug === 'string' && slug.length > 0 ? slug : null;
}
