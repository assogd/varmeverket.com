'use client';

import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Heading } from '@/components/headings/Heading';
import { jsxConverter } from '@/utils/richTextConverters/index';
import { QAList } from './QAList';
import type { QAItem, QAGroup } from './types';

type FAQBlockItem = QAItem | QAGroup;

interface FAQBlockProps {
  headline?: string;
  description?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  items: FAQBlockItem[];
  layout?: 'accordion' | 'list';
}

export const FAQBlock: React.FC<FAQBlockProps> = ({
  headline,
  description,
  items,
  layout = 'accordion',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative px-4 pt-8 pb-24">
      <DevIndicator componentName="FAQBlock" />

      {/* Header */}
      {(headline || description) && (
        <div className="mb-8 text-center">
          {headline && (
            <Heading variant="faq-title" as="h2" className="mb-4 px-2">
              {headline}
            </Heading>
          )}
          {description && (
            <RichText
              data={description}
              converters={jsxConverter}
              className="grid justify-center"
            />
          )}
        </div>
      )}

      {/* FAQ Items */}
      <div className="max-w-2xl mx-auto">
        <QAList items={items} layout={layout} />
      </div>
    </div>
  );
};
