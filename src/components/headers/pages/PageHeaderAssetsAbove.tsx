'use client';

import React, { useRef } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp, FadeInDown } from '@/components/ui/FadeIn';
import { jsxConverter } from '@/utils/richTextConverters/index';
import MediaAsset from '@/components/common/MediaAsset';

interface Asset {
  type: 'image' | 'mux';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface PageHeaderAssetsAboveProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets: Asset[];
}

export default function PageHeaderAssetsAbove({
  text,
  assets,
}: PageHeaderAssetsAboveProps) {
  const ref = useRef(null);

  // Use Framer Motion's scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Add subtle scale effect for more dynamic feel
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  // Add slight y-axis movement for parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={ref} className="px-2 text-center relative">
      <DevIndicator
        componentName="PageHeaderAssetsAbove"
        position="top-right"
      />

      {/* Render assets before text - centered with max height */}
      <motion.div
        className="flex items-center justify-center"
        style={{
          scale,
          y,
          willChange: 'transform',
        }}
      >
        <FadeInDown
          as="div"
          className="flex gap-4 justify-center select-none pt-32 sm:pt-36 relative z-10"
          timing="fast"
          delay={0.2}
        >
          {assets.map((asset, i) => (
            <MediaAsset
              key={i}
              asset={asset}
              assetCount={assets.length}
              height={Math.max(220 - (assets.length - 1) * 40, 120)}
              priority={true}
              quality={75}
              sizes="(max-width: 768px) 50vw, 100vw"
              controls={false}
              autoplay={true}
              loop={true}
            />
          ))}
        </FadeInDown>
      </motion.div>

      {/* Render rich text with enhanced motion effects */}
      <FadeInUp
        as="div"
        className="max-w-7xl mx-auto px-4"
        timing="fast"
        delay={0.2}
      >
        <RichText
          data={text}
          className="rich-text font-mono grid gap-3 hyphens-auto"
          converters={jsxConverter}
        />
      </FadeInUp>
    </div>
  );
}
