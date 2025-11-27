'use client';

import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { BlockHeader } from '@/components/blocks/BlockHeader';
import { ListItem } from '@/components/ui';

interface ListItem {
  title: string;
  description: string;
}

interface ListBlockProps {
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
  items: ListItem[];
}

const ListBlock: React.FC<ListBlockProps> = ({
  headline,
  description,
  items,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative py-8 px-2">
      <DevIndicator componentName="ListBlock" />
      <BlockHeader headline={headline} description={description} />
      <ul className="max-w-2xl mx-auto gap-1 justify-center flex flex-col">
        {items.map((item, index) => (
          <ListItem key={index} variant="background" size="md">
            <h4 className="font-sans uppercase mb-2">{item.title}</h4>
            <p className="font-mono">{item.description}</p>
          </ListItem>
        ))}
      </ul>
    </div>
  );
};

export default ListBlock;
