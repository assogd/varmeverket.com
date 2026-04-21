'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag } from '@/components/ui';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { fixImageUrl } from '@/utils/imageUrl';
import type { CardProps } from './types';
import { buildEventUrl } from '@/utils/eventUrl';

export default function EventCardWithImage({
  item,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: CardProps) {
  const cardId = `event-${item.id}-${index}`;
  const href = buildEventUrl({
    slug: item.slug,
    startDateTime: item.startDateTime,
    parentSlug: item.parentSlug,
    href: item.href,
  });

  return (
    <Link
      href={href}
      className="self-start basis-64 sm:basis-72 grow-0 shrink-0 w-full max-w-80 snap-center"
    >
      <motion.button
        key={cardId}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        className="text-left w-full focus:outline-none"
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <div className="relative">
          <div className="relative aspect-[2/3] overflow-hidden rounded-md">
            <div className="relative w-full h-full">
              <motion.div
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  filter: isHovered ? 'brightness(0.9)' : 'brightness(1)',
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute inset-0"
                style={{ transformOrigin: 'center center' }}
              >
                <Image
                  src={fixImageUrl(item.featuredImage!.url)}
                  alt={item.featuredImage!.alt || item.title || 'Event image'}
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

            <motion.div
              animate={{
                y: isHovered ? 2 : 0,
                x: isHovered ? 2 : 0,
                scale: isHovered ? 1.025 : 1,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute top-2 left-2 flex gap-0.5 text-bg mix-blend-difference z-10"
            >
              <Tag name="Event" size="md" />
            </motion.div>

            <motion.div
              animate={{
                y: isHovered ? 0 : -2,
                x: isHovered ? 0 : 2,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute top-[0.75em] right-3 text-bg mix-blend-difference z-10"
            >
              <PlusIcon size={16} />
            </motion.div>
          </div>

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
    </Link>
  );
}
