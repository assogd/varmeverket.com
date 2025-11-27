/* eslint-disable @typescript-eslint/no-explicit-any */
// RichText data structures from Lexical are dynamic
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp, FadeInDown } from '@/components/ui/FadeIn';
import { TagList } from '@/components/ui';
import { Heading } from '@/components/headings';
import VideoPlayer from '@/components/common/VideoPlayer';
import { fixImageUrl } from '@/utils/imageUrl';
import { defaultConverter } from '@/utils/richTextConverters';

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

interface ArticleHeaderAssetsAboveProps {
  articleData: {
    title?: string;
    tags?: Array<{ id: string; name: string }>;
    author?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      bylineDescription?: string;
    };
    publishedDate?: string;
    lastModifiedDate?: string;
  };
  text?: any;
  assets: Asset[];
}

export default function ArticleHeaderAssetsAbove({
  articleData,
  text,
  assets,
}: ArticleHeaderAssetsAboveProps) {
  const ref = useRef(null);

  // Use Framer Motion's scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Add subtle scale effect for more dynamic feel
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Check if RichText contains an h1 element
  const hasH1 = (richTextData: any): boolean => {
    if (!richTextData?.root?.children) return false;

    const checkChildren = (children: any[]): boolean => {
      return children.some(child => {
        if (child.type === 'heading' && child.tag === 'h1') {
          return true;
        }
        if (child.children) {
          return checkChildren(child.children);
        }
        return false;
      });
    };

    return checkChildren(richTextData.root.children);
  };

  return (
    <div ref={ref} className="relative">
      <DevIndicator
        componentName="ArticleHeaderAssetsAbove"
        position="top-right"
      />

      <div className="grid gap-4 justify-center pt-32 text-center">
        {/* Tags */}
        <TagList tags={articleData.tags} size="md" />

        {/* Render assets before text */}
        <motion.div
          className="flex items-center justify-center py-4"
          style={{
            scale,
            y,
            willChange: 'transform',
          }}
        >
          <FadeInDown
            as="div"
            className="flex gap-4 justify-center select-none relative z-10"
            timing="fast"
            delay={0.2}
          >
            {assets.map((asset, i) => {
              if (asset.type === 'image' && asset.image) {
                return (
                  <Image
                    key={i}
                    src={fixImageUrl(asset.image.url)}
                    alt={asset.image.alt || ''}
                    width={asset.image.width || 800}
                    height={asset.image.height || 400}
                    priority={true}
                    sizes="(max-width: 768px) 50vw, 100vw"
                    className="rounded object-contain w-auto h-auto max-w-[80vw] sm:max-w-[50vw] max-h-[16em] sm:max-h-[24em]"
                  />
                );
              }
              if (
                (asset.type === 'mux' && asset.mux) ||
                (asset.type === 'video' && asset.video?.url)
              ) {
                const videoAsset =
                  asset.type === 'mux'
                    ? { type: 'mux' as const, mux: asset.mux }
                    : { type: 'video' as const, video: asset.video };
                return (
                  <VideoPlayer
                    key={i}
                    asset={videoAsset}
                    variant="default"
                    autoplay={true}
                    loop={true}
                    controls={false}
                    adaptiveResolution={true}
                    className="rounded object-cover"
                    videoClassName="rounded overflow-hidden"
                    isVisible={true}
                  />
                );
              }
              return null;
            })}
          </FadeInDown>
        </motion.div>

        {/* Render rich text with enhanced motion effects */}
        {text && (
          <FadeInUp
            as="div"
            className="px-4 grid gap-4 font-mono"
            timing="fast"
            delay={0.2}
          >
            {/* Add article title as h1 if no h1 is found in RichText */}
            {articleData.title && !hasH1(text) && (
              <Heading variant="article-title" as="h1">
                {articleData.title}
              </Heading>
            )}
            <RichText
              data={text}
              className="grid gap-3 justify-center"
              converters={defaultConverter}
            />
          </FadeInUp>
        )}

        {/* Fallback: Show title as h1 if no text at all */}
        {!text && articleData.title && (
          <Heading variant="article-title" as="h1">
            {articleData.title}
          </Heading>
        )}

        {/* Author and Date Info */}
        <div className="font-mono mt-4">
          {articleData.author && (
            <div className="">
              Författare:&nbsp;
              {articleData.author.firstName && articleData.author.lastName
                ? `${articleData.author.firstName} ${articleData.author.lastName}`
                : articleData.author.email}
            </div>
          )}
          <div>Publicerad: {formatDate(articleData.publishedDate || '')}</div>
        </div>
      </div>
    </div>
  );
}
