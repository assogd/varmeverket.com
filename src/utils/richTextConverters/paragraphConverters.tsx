/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';
import { isEmptyParagraph } from './utils';

export const paragraphConverters = {
  // Centered, narrow width for articles
  article: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    if (isEmptyParagraph(text)) return null;
    return <p className="max-w-2xl w-full px-4 mx-auto">{text}</p>;
  },

  // Default mono font for blocks/cards
  default: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    if (isEmptyParagraph(text)) return null;
    return (
      <p
        className="font-mono max-w-6xl hyphens-auto"
        style={{ textAlign: 'inherit' }}
      >
        {text}
      </p>
    );
  },

  // Compact for cards
  card: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    if (isEmptyParagraph(text)) return null;
    return <p className="text-sm font-mono hyphens-auto">{text}</p>;
  },

  space: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    if (isEmptyParagraph(text)) return null;
    return <p className="font-sans max-w-6xl hyphens-auto">{text}</p>;
  },

  // No styling, just the paragraph
  plain: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    if (isEmptyParagraph(text)) return null;
    return <p>{text}</p>;
  },
};
