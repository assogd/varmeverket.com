'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tag } from '@/components/ui';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { fixImageUrl } from '@/utils/imageUrl';
import { findImageInAssets } from './utils';
import type { CardProps } from './types';

export default function ShowcaseCard({
  item,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
}: CardProps) {
  // Find image: use featuredImage or first image in assets
  let image = item.featuredImage;
  if (!image && item.assets) {
    image = findImageInAssets(item.assets);
  }

  if (!image) {
    return null; // Should not happen for showcases
  }

  const cardId = `showcase-${item.id}-${index}`;

  return (
    <motion.button
      key={cardId}
      onClick={onClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="self-start basis-64 sm:basis-72 grow-0 shrink-0 text-left w-full max-w-80 snap-center"
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative">
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-md">
          <div className="relative w-full h-full">
            <motion.div
              animate={{
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? 'brightness(0.9)' : 'brightness(1)',
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother feel
              }}
              className="absolute inset-0"
              style={{ transformOrigin: 'center center' }}
            >
              <Image
                src={fixImageUrl(image.url)}
                alt={image.alt || item.title || 'Showcase image'}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Date Tags */}
          <motion.div
            animate={{
              y: isHovered ? 2 : 0,
              x: isHovered ? 2 : 0,
              scale: isHovered ? 1.025 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-3 left-3 flex gap-0.5 text-bg mix-blend-difference z-10"
          >
            <Tag name={'Showcase'} size="md" />
            {item.year && <Tag name={item.year.toString()} size="md" />}
          </motion.div>

          {/* Plus Icon */}
          <motion.div
            animate={{
              y: isHovered ? 0 : -2,
              x: isHovered ? 0 : 2,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-4 right-4 text-bg mix-blend-difference z-10"
          >
            <PlusIcon size={16} strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          animate={{
            y: isHovered ? -10 : 0,
            opacity: isHovered ? 0 : 1,
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="uppercase px-0.5 pt-1.5"
        >
          {item.title}
        </motion.div>
      </div>
    </motion.button>
  );
}
