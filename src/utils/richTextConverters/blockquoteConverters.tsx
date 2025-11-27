/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';

export const blockquoteConverters = {
  // Large, centered for articles
  article: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <blockquote className="relative max-w-6xl w-full mx-auto px-4 py-8 text-center font-display text-xl">
        {text}
      </blockquote>
    );
  },

  // Medium for pages
  page: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <blockquote className="relative max-w-6xl w-full mx-auto px-4 text-center font-display text-lg">
        {text}
      </blockquote>
    );
  },

  // Medium for asset text
  default: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <blockquote className="relative font-display text-lg">{text}</blockquote>
    );
  },

  // Compact for cards
  card: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <blockquote className="text-sm font-mono italic text-center">
        {text}
      </blockquote>
    );
  },
};
