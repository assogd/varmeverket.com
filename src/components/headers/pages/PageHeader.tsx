import React from 'react';
import PageHeaderAssetsAbove from './PageHeaderAssetsAbove';
import PageHeaderStandard from './PageHeaderStandard';
import PageHeaderTextOnly from './PageHeaderTextOnly';
import PageHeaderHero from './PageHeaderHero';

interface Asset {
  type: 'image' | 'mux' | 'video';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
  video?: { url: string; alt?: string; width?: number; height?: number };
}

interface PageHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets?: Asset[];
  variant?: 'text-only' | 'assets-before' | 'text-before' | 'gradient';
}

export default function PageHeader({
  text,
  assets = [],
  variant = 'text-only',
}: PageHeaderProps) {
  // Filter assets that actually have content uploaded
  const validAssets = assets.filter(asset => {
    if (asset.type === 'image') {
      return asset.image?.url && asset.image.url.trim() !== '';
    }
    if (asset.type === 'mux') {
      return asset.mux && asset.mux.trim() !== '';
    }
    if (asset.type === 'video') {
      return asset.video?.url && asset.video.url.trim() !== '';
    }
    return false;
  });

  const hasAssets = validAssets.length > 0;

  // If no valid assets, always use text-only regardless of variant
  if (!hasAssets) {
    return <PageHeaderTextOnly text={text} />;
  }

  // Render based on variant
  switch (variant) {
    case 'text-only':
      return <PageHeaderTextOnly text={text} />;

    case 'assets-before':
      return <PageHeaderAssetsAbove text={text} assets={validAssets} />;

    case 'text-before':
      return <PageHeaderStandard text={text} assets={validAssets} />;

    case 'gradient':
      return <PageHeaderHero text={text} assets={validAssets} />;

    default:
      // Fallback to text-only if no variant or invalid variant
      return <PageHeaderTextOnly text={text} />;
  }
}
