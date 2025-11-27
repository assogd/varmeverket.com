/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';
import ListItem from '@/components/ui/ListItem';

export const listConverters = {
  // Standard list with ListItem component
  default: {
    list: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      const NodeTag = node.tag;
      return <NodeTag className="space-y-[-1px] py-1">{children}</NodeTag>;
    },
    listitem: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      return (
        <ListItem variant="bullet" size="sm">
          {children}
        </ListItem>
      );
    },
  },

  outlinedBoxes: {
    list: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      const NodeTag = node.tag;
      return <NodeTag className="space-y-[-1px] py-1 px-4">{children}</NodeTag>;
    },
    listitem: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      return <ListItem variant="outline">{children}</ListItem>;
    },
  },
  // Compact lists for cards
  card: {
    list: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      const NodeTag = node.tag;
      return <NodeTag className="space-y-1 text-sm">{children}</NodeTag>;
    },
    listitem: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      return <li className="font-mono">{children}</li>;
    },
  },

  lined: {
    list: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      const NodeTag = node.tag;
      return (
        <NodeTag className="space-y-1 divide-y divide-text text-sm">
          {children}
        </NodeTag>
      );
    },
    listitem: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      return <li className="py-3 first:pt-0">{children}</li>;
    },
  },

  // Plain lists without custom styling
  plain: {
    list: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      const NodeTag = node.tag;
      return <NodeTag>{children}</NodeTag>;
    },
    listitem: ({ node, nodesToJSX }: any) => {
      const children = nodesToJSX({ nodes: node.children });
      return <li>{children}</li>;
    },
  },
};
