// Lazy initialization to avoid circular dependency
// We use a function that imports buildConverter only when called
function createConverter(options: Parameters<typeof import('./converterBuilder').buildConverter>[0]) {
  // Dynamic import to break circular dependency
  const { buildConverter } = require('./converterBuilder');
  return buildConverter(options);
}

// Article converter - for article content with inline blocks
export const articleConverter = createConverter({
  paragraph: 'article',
  blockquote: 'article',
  heading: 'article',
  list: 'outlinedBoxes',
  includeBlocks: true,
});

// Default converter - for blocks, cards, etc.
export const defaultConverter = createConverter({
  paragraph: 'default',
  blockquote: 'page',
  heading: 'default',
  list: 'default',
});

export const assetTextConverter = createConverter({
  paragraph: 'default',
  blockquote: 'default',
  heading: 'default',
  list: 'default',
});

// Card converter - for compact card content
export const cardConverter = createConverter({
  paragraph: 'card',
  blockquote: 'card',
  heading: 'card',
  list: 'lined',
});

// Plain converter - minimal styling
export const plainConverter = createConverter({
  paragraph: 'plain',
  heading: 'label',
  list: 'plain',
});

// Space converter - for space pages with label headings
export const spaceConverter = createConverter({
  paragraph: 'space',
  heading: 'label',
  list: 'default',
});

// Legacy export for backward compatibility
export const jsxConverter = defaultConverter;
