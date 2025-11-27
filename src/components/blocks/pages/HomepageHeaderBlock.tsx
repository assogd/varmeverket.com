'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { jsxConverter } from '@/utils/richTextConverters/index';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { motion, easeOut } from 'framer-motion';
import { FadeIn } from '@/components/ui/FadeIn';
import VideoPlayer from '@/components/common/VideoPlayer';
import ImageRenderer from '@/components/common/ImageRenderer';

interface Asset {
  type: 'image' | 'mux' | 'video';
  placement: 'before' | 'after';
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

interface HomepageHeaderBlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets?: Asset[];
  children?: React.ReactNode;
  // New gradient variant props
  variant?: 'standard' | 'gradient';
  heroAsset?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  title?: string;
}

export default function HomepageHeaderBlock({
  text,
  assets = [],
  children,
}: HomepageHeaderBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const richTextRef = useRef<HTMLDivElement>(null);

  // Get the first asset (video or image) for the fullscreen background - memoized
  const backgroundAsset = useMemo(
    () => assets.find(asset => asset.placement === 'before') || assets[0],
    [assets]
  );

  const renderBackgroundAsset = useCallback(() => {
    if (!backgroundAsset) return null;

    const animationProps = {
      className: 'relative w-full h-full',
      initial: { opacity: 0, scale: 1.1 },
      animate: {
        opacity: 1,
        scale: 1,
      },
      transition: {
        duration: 0.5,
        ease: easeOut,
        delay: 1.5,
      },
    };

    if (backgroundAsset.type === 'image' && backgroundAsset.image?.url) {
      return (
        <motion.div {...animationProps}>
          <ImageRenderer
            asset={
              backgroundAsset as {
                type: 'image';
                image: {
                  url: string;
                  alt?: string;
                  width?: number;
                  height?: number;
                };
              }
            }
            variant="hero"
            priority={true}
            className="w-full h-full object-cover"
          />
        </motion.div>
      );
    }

    if (
      (backgroundAsset.type === 'mux' || backgroundAsset.type === 'video') &&
      (backgroundAsset.mux || backgroundAsset.video?.url)
    ) {
      return (
        <motion.div {...animationProps}>
          <VideoPlayer
            asset={
              backgroundAsset as {
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
              }
            }
            variant="hero"
            controls={false}
            autoplay={true}
            loop={true}
            playsInline={true}
            className="w-full h-full object-cover"
            videoClassName="w-full h-full"
          />
        </motion.div>
      );
    }

    return null;
  }, [backgroundAsset]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 h-[calc(50vh+8rem)] sm:h-screen z-0 bg-surface-dark">
        <DevIndicator
          componentName="HomepageHeaderBlock"
          position="top-right"
        />
        <FadeIn
          className="font-ballPill absolute inset-0 -translate-y-4 flex items-center justify-center select-none uppercase text-lg sm:text-xl text-surface-dark deboss-text"
          variant="fade"
          timing="slow"
          once={false}
        >
          Värmeverket
        </FadeIn>
        {renderBackgroundAsset()}
      </div>

      <motion.div
        ref={containerRef}
        className="mt-[50vh] sm:mt-[calc(100vh-2rem)] relative z-10 bg-bg rounded-t-xl grid gap-24 pb-48"
      >
        <FadeIn
          ref={richTextRef}
          className="flex items-center justify-center px-4 text-center pt-8 sm:pt-16 md:pt-20"
          timing="slow"
          delay={1}
        >
          <RichText
            data={text}
            className="flex flex-col items-center gap-3"
            converters={jsxConverter}
          />
        </FadeIn>
        {children}
      </motion.div>
    </>
  );
}
