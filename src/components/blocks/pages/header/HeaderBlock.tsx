import React from 'react';
import HeaderBlockAssetsAbove from './HeaderBlockAssetsAbove';
import HeaderBlockStandard from './HeaderBlockStandard';
import HeaderBlockTextOnly from './HeaderBlockTextOnly';

interface Asset {
  type: 'image' | 'mux';
  placement: 'before' | 'after';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface HeaderBlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets?: Asset[];
  // Hero variant props
  heroAsset?: {
    type?: 'image' | 'mux';
    image?: { url: string; alt?: string; width?: number; height?: number };
    mux?: string;
  };
  title?: string;
  attributes?: Array<{
    type: 'custom' | 'capacity' | 'area';
    value: string | number;
    unit?: string;
  }>;
  variant?: 'text-only' | 'assets-before' | 'text-before' | 'gradient';
}

export default function HeaderBlock({
  text,
  assets = [],
  variant = 'text-only',
}: HeaderBlockProps) {
  // Handle gradient variant
  if (variant === 'gradient') {
    return null;
  }

  // Handle text-only variant
  if (variant === 'text-only') {
    return <HeaderBlockTextOnly text={text} />;
  }

  // Filter assets that actually have content uploaded
  const validAssets = assets.filter(asset => {
    if (asset.type === 'image') {
      const hasValidImage = asset.image?.url && asset.image.url.trim() !== '';
      return hasValidImage;
    }
    if (asset.type === 'mux') {
      const hasValidMux = asset.mux && asset.mux.trim() !== '';
      return hasValidMux;
    }
    return false;
  });

  // Handle assets-before variant
  if (variant === 'assets-before' && validAssets.length > 0) {
    return <HeaderBlockAssetsAbove text={text} assets={validAssets} />;
  }

  // Handle text-before variant
  if (variant === 'text-before' && validAssets.length > 0) {
    return <HeaderBlockStandard text={text} assets={validAssets} />;
  }

  // Fallback to text-only if no valid assets
  return <HeaderBlockTextOnly text={text} />;
}
