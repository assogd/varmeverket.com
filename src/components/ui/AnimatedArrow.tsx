'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AccordionArrowIcon } from '@/components/icons';

interface AnimatedArrowProps {
  isOpen: boolean;
  size?: number;
  className?: string;
}

export const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  isOpen,
  size = 16,
  className = '',
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{
        rotate: isOpen ? 180 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      style={{
        transformOrigin: 'center',
      }}
    >
      <AccordionArrowIcon size={size} />
    </motion.div>
  );
};
