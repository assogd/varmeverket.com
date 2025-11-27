'use client';

import React from 'react';
import { AccordionItem } from './AccordionItem';
import { QAListItem } from './QAListItem';
import type { QAItemOrGroup, QAItem } from './types';

interface QAListProps {
  items: QAItemOrGroup[];
  layout: 'accordion' | 'list';
}

const renderQAItem = (
  qa: QAItem,
  index: number,
  layout: 'accordion' | 'list',
  headingLevel: 'h3' | 'h4' = 'h3'
) => {
  if (layout === 'list') {
    return (
      <QAListItem
        key={index}
        qa={qa}
        index={index}
        headingLevel={headingLevel}
      />
    );
  }

  return (
    <AccordionItem
      key={index}
      qa={qa}
      index={index}
      headingLevel={headingLevel}
    />
  );
};

const renderItem = (
  item: QAItemOrGroup,
  index: number,
  layout: 'accordion' | 'list'
) => {
  if (item.blockType === 'qa') {
    return renderQAItem(item, index, layout, 'h3');
  }

  if (item.blockType === 'qaGroup') {
    return (
      <div key={index}>
        <h3 className="text-md text-center mb-4 mt-8">{item.title}</h3>
        <div className="space-y-[-1px]">
          {item.items.map((qa, qaIndex) =>
            renderQAItem(qa, qaIndex, layout, 'h4')
          )}
        </div>
      </div>
    );
  }

  return null;
};

export const QAList: React.FC<QAListProps> = ({ items, layout }) => {
  return (
    <div className={layout === 'list' ? 'space-y-4' : 'space-y-[-1px]'}>
      {items.map((item, index) => renderItem(item, index, layout))}
    </div>
  );
};
