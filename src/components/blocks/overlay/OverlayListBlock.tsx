import React from 'react';
// import { RichText } from '@payloadcms/richtext-lexical/react';
import { ListItem } from '@/components/ui';

interface OverlayListBlockProps {
  headline?: string;
  items?: Array<{
    title: string;
    description?: string;
  }>;
}

export default function OverlayListBlock({
  headline,
  items = [],
}: OverlayListBlockProps) {
  return (
    <div className="pb-2">
      {headline && <h4 className="text-center mb-3">{headline}</h4>}
      <ul className="space-y-[-1px]">
        {items.map((item, index) => (
          <ListItem key={index} className="flex flex-col gap-1" size="sm">
            <div className="text-base">{item.title}</div>
            {item.description && (
              <span className="font-mono text-sm">{item.description}</span>
            )}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}
