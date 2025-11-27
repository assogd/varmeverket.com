import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import MediaAsset from '@/components/common/MediaAsset';
import { defaultConverter } from '@/utils/richTextConverters/index';
import { FadeInUp } from '@/components/ui';
import clsx from 'clsx';

interface Asset {
  type: 'image' | 'mux' | 'video';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
  video?: { url: string; alt?: string; width?: number; height?: number };
}

interface PageHeaderHeroProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets?: Asset[];
}

// Custom converter for page headers with label headlines
export default function PageHeaderHero({
  text,
  assets = [],
}: PageHeaderHeroProps) {
  // Get the first valid asset for the hero background
  const heroAsset = assets.find(asset => {
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

  return (
    <div className="relative">
      <DevIndicator componentName="PageHeaderHero" position="top-center" />

      {/* Hero Section */}
      <div
        className={clsx(
          `relative overflow-hidden pt-8 h-[50vh] sm:h-[80vh] min-h-[500px]`
        )}
      >
        {/* Background Asset */}
        {heroAsset && (
          <div className="absolute inset-0 opacity-90">
            <MediaAsset asset={heroAsset} variant="hero" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-0 bg-bg rounded-t-xl" />
      </div>
      {/* Content */}
      {text && (
        <FadeInUp as="div" timing="fast">
          <RichText
            data={text}
            className="grid gap-3 justify-center place-items-center mt-20 px-4 text-center"
            converters={defaultConverter}
          />
        </FadeInUp>
      )}
    </div>
  );
}
