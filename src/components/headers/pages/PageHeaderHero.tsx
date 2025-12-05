'use client';

import React, { useRef } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import MediaAsset from '@/components/common/MediaAsset';
import { defaultConverter } from '@/utils/richTextConverters/index';
import { FadeInUp } from '@/components/ui';
import { AppAction } from '@/components/ui';
import { PageHeaderLabel } from '@/components/headings';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';
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
  label?: string;
  link?: LinkGroup;
}

// Custom converter for page headers with label headlines
export default function PageHeaderHero({
  text,
  assets = [],
  label,
  link,
}: PageHeaderHeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Use Framer Motion's scroll-based animations for parallax effect
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax effect: background moves slower than scroll (creating depth)
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

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

  const linkResult = link ? routeLink(link) : null;

  return (
    <div className="relative">
      <DevIndicator componentName="PageHeaderHero" position="top-left" />

      {/* Hero Section */}
      <div
        ref={ref}
        className={clsx(
          `relative overflow-hidden pt-8 h-[50vh] sm:h-[80vh] min-h-[500px]`
        )}
      >
        {/* Background Asset with Parallax */}
        {heroAsset && (
          <motion.div
            className="absolute inset-0 opacity-90"
            style={{
              y,
              scale,
              willChange: 'transform',
            }}
          >
            <MediaAsset asset={heroAsset} variant="hero" />
          </motion.div>
        )}

        {/* Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-0 bg-bg rounded-t-xl" />
      </div>
      {/* Content */}
      {(text || label || link) && (
        <FadeInUp as="div" timing="fast" className="grid gap-3 mt-20 px-4 text-center">
          {label && <PageHeaderLabel>{label}</PageHeaderLabel>}
          {text && (
            <RichText
              data={text}
              className="grid gap-3 justify-center place-items-center"
              converters={defaultConverter}
            />
          )}
          {linkResult?.href && link?.text && (
            <div className="mt-4">
              <AppAction href={linkResult.href} variant="outline">
                {link.text}
              </AppAction>
            </div>
          )}
        </FadeInUp>
      )}
    </div>
  );
}
