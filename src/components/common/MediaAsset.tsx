import React from 'react';
import ImageRenderer from '@/components/common/ImageRenderer';
import VideoPlayer from '@/components/common/VideoPlayer';

interface Asset {
  type: 'image' | 'mux' | 'video';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
  video?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    filename?: string;
    mimeType?: string;
  };
}

// Raw media data from Payload CMS
interface MediaData {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

type MediaAssetVariant =
  | 'default'
  | 'hero'
  | 'pageHero'
  | 'compact'
  | 'gallery';

interface MediaAssetProps {
  asset: Asset | MediaData;
  variant?: MediaAssetVariant;
  assetCount?: number;
  height?: number;
  width?: number;
  className?: string;
  videoClassName?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  adaptiveResolution?: boolean;
  preload?: boolean;
  isVisible?: boolean;
  draggable?: boolean;
}

const MediaAsset: React.FC<MediaAssetProps> = ({
  asset,
  variant = 'default',
  assetCount = 1,
  height,
  width,
  className,
  videoClassName,
  priority,
  quality,
  sizes,
  controls,
  autoplay,
  loop,
  adaptiveResolution,
  preload = false,
  isVisible = true,
  draggable = true,
}) => {
  // Variant-based defaults
  const getVariantDefaults = (variant: MediaAssetVariant) => {
    switch (variant) {
      case 'hero':
        return {
          height: height || 600,
          width: width,
          className: className || 'object-cover',
          videoClassName: videoClassName || 'w-full h-full',
          priority: priority ?? true,
          quality: quality || 85,
          sizes: sizes || '100vw',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'pageHero':
        return {
          height: height || 600,
          width: width,
          className: className || 'rounded-xl',
          videoClassName: videoClassName || 'rounded-lg overflow-hidden',
          priority: priority ?? false,
          quality: quality || 85,
          sizes: sizes || '100vw',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'compact':
        return {
          height: height || 200,
          width: width,
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          priority: priority ?? false,
          quality: quality || 75,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
          controls: controls ?? true,
          autoplay: autoplay ?? false,
          loop: loop ?? false,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'gallery':
        return {
          height: height || 400,
          width: width,
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          priority: priority ?? false,
          quality: quality || 80,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
          controls: controls ?? true,
          autoplay: autoplay ?? false,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      default: // 'default'
        return {
          height: height || 600,
          width: width,
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          priority: priority ?? false,
          quality: quality || 75,
          sizes: sizes || '(max-width: 768px) 50vw, 30vw',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
    }
  };

  const defaults = getVariantDefaults(variant);

  // Override priority for preloading
  const finalPriority = preload ? true : defaults.priority;

  // Convert MediaData to Asset format if needed
  const normalizedAsset: Asset =
    'type' in asset
      ? (asset as Asset)
      : {
          type: asset.mimeType?.startsWith('video/') ? 'video' : 'image',
          image: asset.mimeType?.startsWith('video/')
            ? undefined
            : {
                url: asset.url,
                alt: asset.alt,
                width: asset.width,
                height: asset.height,
              },
          video: asset.mimeType?.startsWith('video/')
            ? {
                url: asset.url,
                alt: asset.alt,
                width: asset.width,
                height: asset.height,
                mimeType: asset.mimeType,
              }
            : undefined,
        };
  if (normalizedAsset.type === 'image' && normalizedAsset.image?.url) {
    return (
      <ImageRenderer
        asset={
          normalizedAsset as {
            type: 'image';
            image: {
              url: string;
              alt?: string;
              width?: number;
              height?: number;
            };
          }
        }
        variant={variant}
        priority={finalPriority}
        quality={defaults.quality}
        sizes={defaults.sizes}
        className={defaults.className}
        isVisible={isVisible}
        draggable={draggable}
        assetCount={assetCount}
      />
    );
  }

  if (normalizedAsset.type === 'mux' && normalizedAsset.mux) {
    return (
      <VideoPlayer
        asset={normalizedAsset as { type: 'mux'; mux: string }}
        variant={variant}
        controls={defaults.controls}
        autoplay={defaults.autoplay}
        loop={defaults.loop}
        adaptiveResolution={defaults.adaptiveResolution}
        className={defaults.className}
        videoClassName={defaults.videoClassName}
        isVisible={isVisible}
      />
    );
  }

  if (normalizedAsset.type === 'video' && normalizedAsset.video?.url) {
    return (
      <VideoPlayer
        asset={
          normalizedAsset as {
            type: 'video';
            video: {
              url: string;
              alt?: string;
              width?: number;
              height?: number;
              filename?: string;
              mimeType?: string;
            };
          }
        }
        variant={variant}
        controls={defaults.controls}
        autoplay={defaults.autoplay}
        loop={defaults.loop}
        adaptiveResolution={defaults.adaptiveResolution}
        className={defaults.className}
        videoClassName={defaults.videoClassName}
        isVisible={isVisible}
      />
    );
  }

  return null;
};

export default MediaAsset;
