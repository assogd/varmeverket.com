/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import { NodeTypes, ConverterOptions } from './types';
import { paragraphConverters } from './paragraphConverters';
import { blockquoteConverters } from './blockquoteConverters';
import { headingConverters } from './headingConverters';
import { listConverters } from './listConverters';
import { blockConverters } from './blockConverters';

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

    // Add article blocks if requested
    if (options.includeBlocks) {
      converter.blocks = blockConverters;
    }

    return converter;
  };
};
