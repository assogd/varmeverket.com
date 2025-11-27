import { DefaultNodeTypes } from '@payloadcms/richtext-lexical';

export type NodeTypes =
  | DefaultNodeTypes
  | {
      blockType: string;
      [key: string]: unknown;
    };

export interface ConverterOptions {
  paragraph?: keyof typeof import('./paragraphConverters').paragraphConverters;
  blockquote?: keyof typeof import('./blockquoteConverters').blockquoteConverters;
  heading?: keyof typeof import('./headingConverters').headingConverters;
  list?: keyof typeof import('./listConverters').listConverters;
  includeBlocks?: boolean;
}
