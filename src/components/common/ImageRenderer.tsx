import Image from 'next/image';
import React from 'react';
import { fixImageUrl } from '@/utils/imageUrl';

interface ImageRendererProps {
  asset: {
    type: 'image';
    image: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
  variant?: 'hero' | 'pageHero' | 'default' | 'compact' | 'gallery';
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  isVisible?: boolean;
  draggable?: boolean;
  assetCount?: number;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({
  asset,
  variant = 'default',
  priority = false,
  quality = 75,
  sizes,
  className,
  isVisible = true,
  draggable = true,
  assetCount = 1,
}) => {
  // Variant-based defaults
  const getVariantDefaults = (variant: string) => {
    switch (variant) {
      case 'hero':
        return {
          className: className || 'object-cover',
          priority: priority ?? true,
          quality: quality || 85,
          sizes: sizes || '100vw',
        };
      case 'pageHero':
        return {
          className: className || 'rounded-xl',
          priority: priority ?? false,
          quality: quality || 85,
          sizes: sizes || '100vw',
        };
      case 'compact':
        return {
          className: className || 'rounded object-cover',
          priority: priority ?? false,
          quality: quality || 75,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
        };
      case 'gallery':
        return {
          className: className || 'rounded object-cover',
          priority: priority ?? false,
          quality: quality || 80,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
        };
      default: // 'default'
        return {
          className: className || 'rounded-lg object-cover',
          priority: priority ?? false,
          quality: quality || 75,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
        };
    }
  };

  const defaults = getVariantDefaults(variant);

  if (asset.type === 'image' && asset.image?.url) {
    // For hero variant, use fill layout for background images
    if (variant === 'hero') {
      return (
        <Image
          src={fixImageUrl(asset.image.url)}
          alt={asset.image.alt || ''}
          fill
          className={defaults.className}
          priority={defaults.priority}
          quality={defaults.quality}
          sizes={defaults.sizes}
          loading={defaults.priority ? undefined : 'lazy'}
          style={{ display: isVisible ? 'block' : 'none' }}
          draggable={draggable}
        />
      );
    }

    // Calculate dimensions if not provided
    let finalWidth = 600;
    let finalHeight = 400;
    let finalClassName = defaults.className;

    // For assets above text (smaller, more dynamic sizing)
    if (assetCount > 1 || 400 < 400) {
      const aspectRatio =
        asset.image.width && asset.image.height
          ? asset.image.width / asset.image.height
          : 1;
      const isLandscape = aspectRatio > 1;
      const shouldBeSquare =
        assetCount > 1 || (assetCount === 1 && isLandscape);

      finalHeight = Math.max(400 - (assetCount - 1) * 40, 120);
      finalWidth = shouldBeSquare
        ? finalHeight
        : Math.round(finalHeight * aspectRatio);
      finalClassName = shouldBeSquare
        ? 'rounded max-w-[50vw] aspect-square object-cover'
        : 'rounded max-w-[50vw]';
    } else {
      // For standard assets (use original dimensions or defaults)
      finalWidth = asset.image.width || 800;
      finalHeight = asset.image.height || 400;
    }

    return (
      <Image
        src={fixImageUrl(asset.image.url)}
        alt={asset.image.alt || ''}
        width={finalWidth}
        height={finalHeight}
        className={finalClassName}
        priority={defaults.priority}
        quality={defaults.quality}
        sizes={defaults.sizes}
        loading={defaults.priority ? undefined : 'lazy'}
        style={{ display: isVisible ? 'block' : 'none' }}
        draggable={draggable}
      />
    );
  }

  return null;
};

export default ImageRenderer;
