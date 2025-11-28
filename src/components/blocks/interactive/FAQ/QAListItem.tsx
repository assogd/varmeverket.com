'use client';

import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { ListItem } from '@/components/ui';
import { extractPlainText } from '@/utils/richTextUtils';
import { removeTrailingBreaks } from '@/utils/richTextTransform';
import type { QAItem } from './types';

interface QAListItemProps {
  qa: QAItem;
  index: number;
  headingLevel: 'h3' | 'h4';
}

export const QAListItem: React.FC<QAListItemProps> = ({ qa, headingLevel }) => {
  const HeadingTag = headingLevel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanedAnswer = removeTrailingBreaks(qa.answer) as any;

  return (
    <ListItem>
      <HeadingTag className="font-sans mb-2">
        {extractPlainText(qa.question)}
      </HeadingTag>
      <RichText data={cleanedAnswer} className="font-mono" />
    </ListItem>
  );
};
