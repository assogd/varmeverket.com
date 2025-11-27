import type { Page, Article, Space } from '@/payload-types';
import { seoConfig } from '@/config/seo';

export interface SEOData {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
  siteName: string;
  twitterHandle?: string;
  facebookAppId?: string;
}

/**
 * Get SEO data for a page, article, or space with fallback to config and page data
 */
export function getSEOData(page: Page | Article | Space): SEOData {
  // Get SEO data from sidebar group
  const seoData = (page as Record<string, unknown>).seo as
    | Record<string, unknown>
    | undefined;

  // Get page title with fallback logic
  let title = seoData?.title || page.title || '';

  // Apply title template if no custom SEO title is set
  if (!seoData?.title && page.title) {
    title = seoConfig.defaultTitleTemplate
      .replace('{title}', page.title)
      .replace('{siteName}', seoConfig.siteName);
  }

  // Get description with fallback logic
  let description = seoData?.description || '';
  if (!description && 'excerpt' in page && page.excerpt) {
    description = page.excerpt;
  }
  if (!description) {
    description = seoConfig.defaultDescription;
  }

  // Get image with fallback logic
  let image: string | undefined;
  if (seoData?.image && typeof seoData.image === 'object') {
    image = seoData.image.url;
  } else if (
    'heroAsset' in page &&
    page.heroAsset?.image &&
    typeof page.heroAsset.image === 'object'
  ) {
    image = page.heroAsset.image.url;
  } else {
    image = seoConfig.defaultImage;
  }

  // Get noIndex flag
  const noIndex = seoData?.noIndex || false;

  return {
    title,
    description,
    image,
    noIndex,
    siteName: seoConfig.siteName,
    twitterHandle: seoConfig.twitterHandle || undefined,
    facebookAppId: seoConfig.facebookAppId || undefined,
  };
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(seoData: SEOData, url?: string) {
  const tags: Record<string, string> = {};

  // Basic meta tags
  tags['title'] = seoData.title;
  tags['description'] = seoData.description;

  if (seoData.noIndex) {
    tags['robots'] = 'noindex, nofollow';
  }

  // Open Graph tags
  tags['og:title'] = seoData.title;
  tags['og:description'] = seoData.description;
  tags['og:site_name'] = seoData.siteName;
  tags['og:type'] = seoConfig.defaultOgType;

  if (seoData.image) {
    tags['og:image'] = seoData.image;
    tags['og:image:width'] = '1200';
    tags['og:image:height'] = '630';
  }

  if (url) {
    tags['og:url'] = url;
  }

  if (seoData.facebookAppId) {
    tags['fb:app_id'] = seoData.facebookAppId;
  }

  // Twitter Card tags
  tags['twitter:card'] = seoConfig.defaultTwitterCard;
  tags['twitter:title'] = seoData.title;
  tags['twitter:description'] = seoData.description;

  if (seoData.image) {
    tags['twitter:image'] = seoData.image;
  }

  if (seoData.twitterHandle) {
    tags['twitter:site'] = `@${seoData.twitterHandle}`;
    tags['twitter:creator'] = `@${seoData.twitterHandle}`;
  }

  return tags;
}
