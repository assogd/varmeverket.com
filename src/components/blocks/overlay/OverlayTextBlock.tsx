import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';

interface OverlayTextBlockProps {
  content: {
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
}

export default function OverlayTextBlock({ content }: OverlayTextBlockProps) {
  return (
    <div className="text-center">
      <RichText data={content} className="text-base" />
    </div>
  );
}
