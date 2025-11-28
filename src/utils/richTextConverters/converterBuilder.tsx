/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import { NodeTypes, ConverterOptions } from './types';
import { paragraphConverters } from './paragraphConverters';
import { blockquoteConverters } from './blockquoteConverters';
import { headingConverters } from './headingConverters';
import { listConverters } from './listConverters';
// Lazy import blockConverters to avoid circular dependency
let _blockConverters: typeof import('./blockConverters').blockConverters | null = null;

function getBlockConverters() {
  if (!_blockConverters) {
    _blockConverters = require('./blockConverters').blockConverters;
  }
  return _blockConverters;
}

/**
 * Build a converter by cherry-picking different renderings
 */
export const buildConverter = (
  options: ConverterOptions
): JSXConvertersFunction<NodeTypes> => {
  return ({ defaultConverters }) => {
    const converter: any = { ...defaultConverters };

    // Add paragraph converter
    if (options.paragraph) {
      converter.paragraph = paragraphConverters[options.paragraph];
    }

    // Add blockquote converter
    if (options.blockquote) {
      converter.quote = blockquoteConverters[options.blockquote];
    }

    // Add heading converter
    if (options.heading) {
      converter.heading = headingConverters[options.heading];
    }

    // Add list converters
    if (options.list) {
      const listConverter = listConverters[options.list];
      converter.list = listConverter.list;
      converter.listitem = listConverter.listitem;
    }

    // Add article blocks if requested (lazy load to avoid circular dependency)
    if (options.includeBlocks) {
      converter.blocks = getBlockConverters();
    }

    return converter;
  };
};
