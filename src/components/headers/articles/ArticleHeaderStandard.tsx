/* eslint-disable @typescript-eslint/no-explicit-any */
// RichText data structures from Lexical are dynamic
'use client';

import React, { useRef } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeIn } from '@/components/ui';
import { TagList } from '@/components/ui';
import { Heading } from '@/components/headings';
import MediaAsset from '@/components/common/MediaAsset';
import { defaultConverter } from '@/utils/richTextConverters';

interface Asset {
  type: 'image' | 'mux';
  placement: 'before' | 'after';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface ArticleHeaderStandardProps {
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

export default function ArticleHeaderStandard({
  articleData,
  text,
  assets,
}: ArticleHeaderStandardProps) {
  const ref = useRef(null);

  // Use Framer Motion's scroll-based animations
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const assetScale = useTransform(scrollYProgress, [0, 0.1], [0.95, 1]);

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
        componentName="ArticleHeaderStandard"
        position="top-right"
      />

      <div className="grid gap-8 justify-center pt-32 text-center">
        {/* Tags */}
        <TagList tags={articleData.tags} size="md" className="mb-4" />

        <motion.div className="flex items-center justify-center" style={{}}>
          <FadeIn
            as="div"
            className="px-4 grid gap-4 font-mono"
            timing="slow"
            delay={0.2}
          >
            {/* Add article title as h1 if no h1 is found in RichText */}
            {text && articleData.title && !hasH1(text) && (
              <Heading variant="article-title" as="h1">
                {articleData.title}
              </Heading>
            )}
            {text && (
              <RichText
                data={text}
                className="grid gap-3 justify-center"
                converters={defaultConverter}
              />
            )}
          </FadeIn>
        </motion.div>

        {/* Author and Date Info */}
        <div className="font-mono">
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
                    className="rounded object-cover"
                    videoClassName="rounded overflow-hidden"
                    controls={false}
                    autoplay={true}
                    loop={true}
                    adaptiveResolution={true}
                  />
                </div>
              ))}
            </FadeIn>
          </motion.div>
        )}
      </div>
    </div>
  );
}
