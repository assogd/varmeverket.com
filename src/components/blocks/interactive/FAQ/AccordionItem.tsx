'use client';

import React, { useState, useRef } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedArrow } from '@/components/ui';
import { extractPlainText } from '@/utils/richTextUtils';
import { removeTrailingBreaks } from '@/utils/richTextTransform';
import type { QAItem } from './types';

interface AccordionItemProps {
  qa: QAItem;
  index: number;
  headingLevel: 'h3' | 'h4';
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ qa }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-text rounded-md overflow-hidden">
      <button
        onClick={toggleAccordion}
        className="w-full pt-4 pb-[.9em] text-left flex items-center justify-between cursor-pointer hover:bg-text/5 transition-colors select-none"
      >
        <div className="flex-shrink-0 px-4">
          <AnimatedArrow isOpen={isOpen} />
        </div>
        <div className="font-sans flex-1 text-center">
          {extractPlainText(qa.question)}
        </div>
        <div className="flex-shrink-0 px-4">
          <AnimatedArrow isOpen={isOpen} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="overflow-hidden"
          >
            <div ref={contentRef} className="px-4 pb-4">
              <div className="pt-1 pb-2 font-mono">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <RichText data={removeTrailingBreaks(qa.answer) as any} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
