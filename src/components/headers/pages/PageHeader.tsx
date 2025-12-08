import React from 'react';
import PageHeaderAssetsAbove from './PageHeaderAssetsAbove';
import PageHeaderStandard from './PageHeaderStandard';
import PageHeaderTextOnly from './PageHeaderTextOnly';
import PageHeaderHero from './PageHeaderHero';
import type { LinkGroup } from '@/utils/linkRouter';

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
  label?: string;
  link?: LinkGroup;
}

export default function PageHeader({
  text,
  assets = [],
  variant = 'text-only',
  label,
  link,
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
    return <PageHeaderTextOnly text={text} label={label} link={link} />;
  }

  // Render based on variant
  switch (variant) {
    case 'text-only':
      return <PageHeaderTextOnly text={text} label={label} link={link} />;

    case 'assets-before':
      return (
        <PageHeaderAssetsAbove
          text={text}
          assets={validAssets}
          label={label}
          link={link}
        />
      );

    case 'text-before':
      return (
        <PageHeaderStandard
          text={text}
          assets={validAssets}
          label={label}
          link={link}
        />
      );

    case 'gradient':
      return (
        <PageHeaderHero
          text={text}
          assets={validAssets}
          label={label}
          link={link}
        />
      );

    default:
      // Fallback to text-only if no variant or invalid variant
      return <PageHeaderTextOnly text={text} label={label} link={link} />;
  }
}
