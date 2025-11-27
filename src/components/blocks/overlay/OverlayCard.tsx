'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlusIcon } from '@/components/icons';

interface OverlayCardProps {
  overlay: {
    headline: string;
    heroImage?: {
      url?: string;
      alt?: string;
    };
    layout?: unknown[];
    link?: unknown;
  };
  index: number;
  onClick: (overlay: unknown) => void;
  isInView?: boolean;
}

const OverlayCard: React.FC<OverlayCardProps> = ({
  overlay,
  index,
  onClick,
  isInView = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-68 sm:w-72 md:w-76 lg:w-80 mx-2 cursor-pointer"
      onClick={() => onClick(overlay)}
    >
      {overlay.heroImage?.url && (
        <Image
          src={overlay.heroImage.url}
          alt={overlay.heroImage.alt || overlay.headline}
          width={320}
          height={128}
          className="w-full h-auto aspect-[5/4] object-cover rounded-md"
        />
      )}

      <div className="break-words uppercase mt-1 flex items-center justify-between gap-2">
        <div className="translate-y-0.5">{overlay.headline}</div>
        <div className="bg-text text-bg rounded-sm p-1">
          <PlusIcon size={14} className="" color="currentColor" />
        </div>
      </div>
    </motion.div>
  );
};

export default OverlayCard;
