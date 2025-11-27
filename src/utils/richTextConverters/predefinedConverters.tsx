import { buildConverter } from './converterBuilder';

// Article converter - for article content with inline blocks
export const articleConverter = buildConverter({
  paragraph: 'article',
  blockquote: 'article',
  heading: 'article',
  list: 'outlinedBoxes',
  includeBlocks: true,
});

// Default converter - for blocks, cards, etc.
export const defaultConverter = buildConverter({
  paragraph: 'default',
  blockquote: 'page',
  heading: 'default',
  list: 'default',
});

export const assetTextConverter = buildConverter({
  paragraph: 'default',
  blockquote: 'default',
  heading: 'default',
  list: 'default',
});

// Card converter - for compact card content
export const cardConverter = buildConverter({
  paragraph: 'card',
  blockquote: 'card',
  heading: 'card',
  list: 'lined',
});

// Plain converter - minimal styling
export const plainConverter = buildConverter({
  paragraph: 'plain',
  heading: 'label',
  list: 'plain',
});

// Space converter - for space pages with label headings
export const spaceConverter = buildConverter({
  paragraph: 'space',
  heading: 'label',
  list: 'default',
});

// Legacy export for backward compatibility
export const jsxConverter = defaultConverter;
