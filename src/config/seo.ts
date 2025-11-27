/**
 * Global SEO Configuration
 *
 * This file contains the default SEO settings used as fallbacks
 * when pages don't have custom SEO blocks configured.
 *
 * Edit these values to customize your site's default SEO behavior.
 */

export const seoConfig = {
  // Site name used in page titles and social sharing
  siteName: 'Värmeverket',

  // Default title template for pages without custom SEO
  // Use {title} for page title, {siteName} for site name
  defaultTitleTemplate: '{title} | {siteName}',

  // Default meta description for pages without custom SEO
  defaultDescription:
    'Värmeverket - En digital plattform för information och tjänster kopplade till byggnadens infrastruktur.',

  // Default social sharing image (relative to public folder)
  // This should be a 1200x630px image for optimal social sharing
  defaultImage: '/images/default-og-image.jpg',

  // Twitter handle (without @) for Twitter Card meta tags
  twitterHandle: '',

  // Facebook App ID for Open Graph meta tags
  facebookAppId: '',

  // Default Open Graph type
  defaultOgType: 'website',

  // Default Twitter Card type
  defaultTwitterCard: 'summary_large_image',
} as const;

export type SEOConfig = typeof seoConfig;
