/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';
import { Heading } from '@/components/headings';
import { BalancedHeading } from '@/components/headings/BalancedHeading';

export const headingConverters = {
  // Standard heading mapping
  default: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });

    switch (node.tag) {
      case 'h1':
        return (
          <BalancedHeading
            variant="page-header"
            as="h1"
            charsPerLine={24}
            className="pt-8 pb-2"
          >
            {text}
          </BalancedHeading>
        );
      case 'h2':
        return (
          <Heading variant="section" as="h2">
            {text}
          </Heading>
        );
      case 'h3':
        return (
          <Heading variant="subsection" as="h3">
            {text}
          </Heading>
        );
      case 'h4':
        return (
          <Heading variant="small-title" as="h4">
            {text}
          </Heading>
        );
      case 'h5':
      case 'h6':
        return (
          <Heading variant="label" as={node.tag}>
            {text}
          </Heading>
        );
      default:
        return (
          <Heading variant="section" as={node.tag}>
            {text}
          </Heading>
        );
    }
  },

  article: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });

    switch (node.tag) {
      case 'h1':
        // Convert h1 to h2 in articles
        return (
          <Heading
            variant="content-h2"
            as="h2"
            className="px-4 text-center mb-2 mt-4"
          >
            {text}
          </Heading>
        );
      case 'h2':
        return (
          <Heading
            variant="content-h2"
            as="h2"
            className="px-4 text-center mb-2 mt-4"
          >
            {text}
          </Heading>
        );
      case 'h3':
        return (
          <Heading
            variant="content-h3"
            as="h3"
            className="px-4 text-center mt-4"
          >
            {text}
          </Heading>
        );
      case 'h4':
        return (
          <Heading variant="content-h4" as="h4" className="px-4 mt-3">
            {text}
          </Heading>
        );
      case 'h5':
      case 'h6':
        return (
          <Heading variant="label" as={node.tag}>
            {text}
          </Heading>
        );
      default:
        return (
          <Heading variant="section" as={node.tag}>
            {text}
          </Heading>
        );
    }
  },

  // All headings as small titles
  small: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <Heading variant="small-title" as={node.tag}>
        {text}
      </Heading>
    );
  },

  card: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <Heading
        variant="small-title"
        as={node.tag}
        className="pb-2 pt-2 [&:has(+_ul)]:border-b [&:has(+_ul)]:border-text"
      >
        {text}
      </Heading>
    );
  },

  // All headings as labels
  label: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    return (
      <Heading variant="label" as={node.tag}>
        {text}
      </Heading>
    );
  },

  // Convert h1 to h2, keep others as-is
  h2Only: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    // Convert h1 to h2, keep others as-is
    const tag = node.tag === 'h1' ? 'h2' : node.tag;

    switch (tag) {
      case 'h2':
        return (
          <Heading variant="section" as="h2">
            {text}
          </Heading>
        );
      case 'h3':
        return (
          <Heading variant="subsection" as="h3">
            {text}
          </Heading>
        );
      case 'h4':
        return (
          <Heading variant="small-title" as="h4">
            {text}
          </Heading>
        );
      case 'h5':
      case 'h6':
        return (
          <Heading variant="label" as={tag}>
            {text}
          </Heading>
        );
      default:
        return (
          <Heading variant="section" as="h2">
            {text}
          </Heading>
        );
    }
  },

  // For AssetTextBlock: convert h1 to h2, but style h2 same as h3
  assetText: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });
    // Convert h1 to h2
    const tag = node.tag === 'h1' ? 'h2' : node.tag;

    switch (tag) {
      case 'h2':
        // Style h2 the same as h3 in AssetTextBlock
        return (
          <Heading variant="subsection" as="h2">
            {text}
          </Heading>
        );
      case 'h3':
        return (
          <Heading variant="subsection" as="h3">
            {text}
          </Heading>
        );
      case 'h4':
        return (
          <Heading variant="small-title" as="h4" className="mt-2 ml-4">
            {text}
          </Heading>
        );
      case 'h5':
      case 'h6':
        return (
          <Heading variant="label" as={tag}>
            {text}
          </Heading>
        );
      default:
        return (
          <Heading variant="subsection" as="h2">
            {text}
          </Heading>
        );
    }
  },

  // For TextBlock: similar to article but h3 is uppercase text-base
  textBlock: ({ node, nodesToJSX }: any) => {
    const text = nodesToJSX({ nodes: node.children });

    switch (node.tag) {
      case 'h1':
        // Convert h1 to h2 in TextBlock
        return (
          <Heading
            variant="content-h2"
            as="h2"
            className="px-4 text-center mb-2 mt-4"
          >
            {text}
          </Heading>
        );
      case 'h2':
        return (
          <Heading
            variant="content-h2"
            as="h2"
            className="px-4 text-center mb-2 mt-4"
          >
            {text}
          </Heading>
        );
      case 'h3':
        return (
          <Heading variant="content-h3" as="h3" className="px-4 text-center">
            {text}
          </Heading>
        );
      case 'h4':
        return (
          <Heading variant="content-h4" as="h4" className="px-4 mt-3">
            {text}
          </Heading>
        );
      case 'h5':
      case 'h6':
        return (
          <Heading variant="label" as={node.tag}>
            {text}
          </Heading>
        );
      default:
        return (
          <Heading variant="section" as={node.tag}>
            {text}
          </Heading>
        );
    }
  },
};
