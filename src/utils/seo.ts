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
  const seoTitle = typeof seoData?.title === 'string' ? seoData.title : '';
  const seoDescription =
    typeof seoData?.description === 'string' ? seoData.description : '';
  const seoNoIndex =
    typeof seoData?.noIndex === 'boolean' ? seoData.noIndex : false;

  // Get page title with fallback logic
  let title = seoTitle || page.title || '';

  // Apply title template if no custom SEO title is set
  if (!seoTitle && page.title) {
    title = seoConfig.defaultTitleTemplate
      .replace('{title}', page.title)
      .replace('{siteName}', seoConfig.siteName);
  }

  // Get description with fallback logic
  let description = seoDescription || '';
  const excerptValue =
    'excerpt' in page && typeof page.excerpt === 'string' ? page.excerpt : '';
  if (!description && excerptValue) {
    description = excerptValue;
  }
  if (!description) {
    description = seoConfig.defaultDescription;
  }

  // Get image with fallback logic
  let image: string | undefined;
  const seoImage =
    seoData && typeof seoData.image === 'object'
      ? (seoData.image as { url?: string })
      : null;
  if (seoImage?.url) {
    image = seoImage.url;
  } else if ('heroAsset' in page && page.heroAsset) {
    const heroAsset = page.heroAsset as Record<string, unknown>;
    const heroImage =
      heroAsset.image && typeof heroAsset.image === 'object'
        ? (heroAsset.image as { url?: string })
        : null;
    if (heroImage?.url) {
      image = heroImage.url;
    }
  } else {
    image = seoConfig.defaultImage;
  }

  // Get noIndex flag
  const noIndex = seoNoIndex;

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
