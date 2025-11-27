import React from 'react';
import ArticleHeaderAssetsAbove from './ArticleHeaderAssetsAbove';
import ArticleHeaderStandard from './ArticleHeaderStandard';
import ArticleHeaderTextOnly from './ArticleHeaderTextOnly';

interface Asset {
  type: 'image' | 'mux';
  placement: 'before' | 'after';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface ArticleHeaderProps {
  articleData: {
    title?: string;
    excerpt?: string;
    tags?: Array<{ id: string; name: string }>;
    author?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      bylineDescription?: string;
    };
    publishedDate?: string;
    lastModifiedDate?: string;
  };
  header?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    text?: any;
    assets?: Asset[];
  };
}

export default function ArticleHeader({
  articleData,
  header,
}: ArticleHeaderProps) {
  // Filter assets that actually have content uploaded
  const validAssets = (header?.assets || []).filter(asset => {
    if (asset.type === 'image') {
      return asset.image?.url && asset.image.url.trim() !== '';
    }
    if (asset.type === 'mux') {
      return asset.mux && asset.mux.trim() !== '';
    }
    return false;
  });

  const beforeAssets = validAssets.filter(
    asset => asset.placement === 'before'
  );
  const afterAssets = validAssets.filter(asset => asset.placement === 'after');
  const hasAssets = validAssets.length > 0;

  // If no assets, render text-only version
  if (!hasAssets) {
    return (
      <ArticleHeaderTextOnly articleData={articleData} text={header?.text} />
    );
  }

  // If has assets above text, use assets above variant
  if (beforeAssets.length > 0) {
    return (
      <ArticleHeaderAssetsAbove
        articleData={articleData}
        text={header?.text}
        assets={beforeAssets}
      />
    );
  }

  // If has assets below text, use standard variant
  if (afterAssets.length > 0) {
    return (
      <ArticleHeaderStandard
        articleData={articleData}
        text={header?.text}
        assets={afterAssets}
      />
    );
  }

  // Fallback (shouldn't reach here)
  return null;
}
