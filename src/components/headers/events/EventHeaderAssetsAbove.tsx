/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { EventMeta } from './EventMeta';
import { EventParentTitleLink } from './EventParentTitleLink';

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

interface EventHeaderAssetsAboveProps {
  eventData: {
    title?: string;
    parentTitle?: string;
    parentSlug?: string;
    tags?: Array<{ id: string; name: string }>;
    startDateTime?: string;
    endDateTime?: string;
    isAllDay?: boolean;
    format?: 'in_person' | 'online' | 'hybrid';
    locationName?: string;
    space?: { title?: string };
  };
  text?: any;
  assets: Asset[];
  eventId?: string;
  hasForm?: boolean;
}

function hasH1(richTextData: any): boolean {
  if (!richTextData?.root?.children) return false;
  const checkChildren = (children: any[]): boolean => {
    return children.some(child => {
      if (child.type === 'heading' && child.tag === 'h1') return true;
      if (child.children) return checkChildren(child.children);
      return false;
    });
  };
  return checkChildren(richTextData.root.children);
}

export default function EventHeaderAssetsAbove({
  eventData,
  text,
  assets,
  eventId,
  hasForm,
}: EventHeaderAssetsAboveProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={ref} className="relative">
      <DevIndicator
        componentName="EventHeaderAssetsAbove"
        position="top-right"
      />

      <div className="grid gap-4 justify-center pt-32 text-center">
        {eventData.parentTitle && eventData.parentSlug ? (
          <EventParentTitleLink
            parentTitle={eventData.parentTitle}
            parentSlug={eventData.parentSlug}
          />
        ) : (
          <TagList tags={eventData.tags} size="md" />
        )}

        <motion.div
          className="flex items-center justify-center py-4"
          style={{ scale, y, willChange: 'transform' }}
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

        {text && (
          <FadeInUp
            as="div"
            className="px-4 grid gap-4 font-mono"
            timing="fast"
            delay={0.2}
          >
            {eventData.title && !hasH1(text) && (
              <Heading variant="page-header" as="h1">
                {eventData.title}
              </Heading>
            )}
            <RichText
              data={text}
              className="grid gap-3 justify-center"
              converters={defaultConverter}
            />
          </FadeInUp>
        )}

        {!text && eventData.title && (
          <Heading variant="page-header" as="h1">
            {eventData.title}
          </Heading>
        )}

        <EventMeta
          title={eventData.title}
          startDateTime={eventData.startDateTime}
          endDateTime={eventData.endDateTime}
          isAllDay={eventData.isAllDay}
          format={eventData.format}
          locationName={eventData.locationName}
          space={eventData.space}
          eventId={eventId}
          hasForm={hasForm}
        />
      </div>
    </div>
  );
}
