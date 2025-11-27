import React from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { fixVideoUrl } from '@/utils/imageUrl';

interface VideoPlayerProps {
  asset: {
    type: 'mux' | 'video';
    mux?: string;
    video?: {
      url: string;
      alt?: string;
      width?: number;
      height?: number;
      filename?: string;
      mimeType?: string;
    };
  };
  variant?: 'hero' | 'pageHero' | 'default' | 'compact' | 'gallery';
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  adaptiveResolution?: boolean;
  className?: string;
  videoClassName?: string;
  isVisible?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  asset,
  variant = 'default',
  controls = false,
  autoplay = false,
  loop = false,
  adaptiveResolution = true,
  className,
  videoClassName,
  isVisible = true,
  muted: mutedProp,
  playsInline = false,
}) => {
  // Variant-based defaults
  const getVariantDefaults = (variant: string) => {
    switch (variant) {
      case 'hero':
        return {
          className: className || 'w-full h-full',
          videoClassName: videoClassName || 'w-full h-full',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'pageHero':
        return {
          className: className || 'rounded-xl',
          videoClassName: videoClassName || 'rounded-lg overflow-hidden',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'compact':
        return {
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          controls: controls ?? true,
          autoplay: autoplay ?? false,
          loop: loop ?? false,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      case 'gallery':
        return {
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          controls: controls ?? true,
          autoplay: autoplay ?? false,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
      default: // 'default'
        return {
          className: className || 'rounded object-cover',
          videoClassName: videoClassName || 'rounded overflow-hidden',
          controls: controls ?? false,
          autoplay: autoplay ?? true,
          loop: loop ?? true,
          adaptiveResolution: adaptiveResolution ?? true,
        };
    }
  };

  const defaults = getVariantDefaults(variant);

  if (asset.type === 'mux' && asset.mux) {
    return (
      <div
        className={defaults.videoClassName}
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        <MuxPlayer
          playbackId={asset.mux}
          autoPlay={defaults.autoplay}
          muted={mutedProp !== undefined ? mutedProp : defaults.autoplay}
          loop={defaults.loop}
          playsInline={playsInline}
          className="object-cover w-full h-full"
          style={{
            aspectRatio: 16 / 9,
            ...(defaults.controls === false
              ? { ['--controls' as string]: 'none' }
              : {}),
          }}
          {...(!defaults.adaptiveResolution ? { playbackEngine: 'mse' } : {})}
        />
      </div>
    );
  }

  if (asset.type === 'video' && asset.video?.url) {
    return (
      <div
        className={defaults.videoClassName}
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        <video
          src={fixVideoUrl(asset.video.url)}
          autoPlay={defaults.autoplay}
          muted={mutedProp !== undefined ? mutedProp : defaults.autoplay}
          loop={defaults.loop}
          controls={defaults.controls}
          playsInline={playsInline}
          className="object-cover w-full h-full"
          style={{ aspectRatio: 16 / 9 }}
          poster={asset.video.alt}
        />
      </div>
    );
  }

  return null;
};

export default VideoPlayer;
