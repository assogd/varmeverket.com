'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeIn } from '@/components/ui';
import { jsxConverter } from '@/utils/richTextConverters/index';
import MediaAsset from '@/components/common/MediaAsset';
import clsx from 'clsx';

interface Asset {
  type: 'image' | 'mux';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface PageHeaderStandardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  assets: Asset[];
}

export default function PageHeaderStandard({
  text,
  assets,
}: PageHeaderStandardProps) {
  const ref = useRef(null);

  // Use Framer Motion's scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]);
  const [isVisible, setIsVisible] = useState(true);

  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 1.05]);

  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    const unsubscribe = opacity.on('change', latest => {
      setIsVisible(latest > 0);
    });
    return unsubscribe;
  }, [opacity]);

  // Asset scale - inverse of text scale for dynamic balance
  const assetScale = useTransform(scrollYProgress, [0, 0.1], [0.95, 1]);

  return (
    <div ref={ref} className="px-2 sm:px-4 text-center relative">
      <DevIndicator componentName="PageHeaderStandard" position="top-right" />

      <motion.div
        className={clsx(
          'flex items-center justify-center pt-36 pb-16 fixed inset-x-0 top-0',
          !isVisible && 'pointer-events-none'
        )}
        style={{
          opacity,
          scale,
          y,
        }}
      >
        <FadeIn
          as="div"
          className="max-w-7xl mx-auto px-4"
          timing="slow"
          delay={0.2}
        >
          <RichText
            data={text}
            className="grid gap-3"
            converters={jsxConverter}
          />
        </FadeIn>
      </motion.div>

      <div className="flex items-center justify-center pt-36 pb-16 opacity-0 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4">
          <RichText data={text} className="" converters={jsxConverter} />
        </div>
      </div>

      {/* Render assets after text */}
      {assets.length > 0 && (
        <motion.div
          style={{
            scale: assetScale,
          }}
        >
          <FadeIn
            as="div"
            className="relative z-10 flex justify-center flex-row gap-4 mt-8"
            timing="normal"
            delay={0.6}
          >
            {assets.map((asset, i) => (
              <div key={i} className={assets.length > 1 ? 'flex-1' : ''}>
                <MediaAsset
                  asset={asset}
                  height={asset.image?.height || 600}
                  width={asset.image?.width || 800}
                  variant="pageHero"
                />
              </div>
            ))}
          </FadeIn>
        </motion.div>
      )}
    </div>
  );
}
