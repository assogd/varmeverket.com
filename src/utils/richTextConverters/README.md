# Rich Text Converters

This directory contains modular rich text converters for the Payload CMS Lexical editor. The converters have been split into smaller, more maintainable files for better organization.

## Structure

```
richTextConverters/
├── index.ts                    # Main entry point with all exports
├── types.ts                    # TypeScript type definitions
├── utils.ts                    # Utility functions
├── paragraphConverters.tsx     # Paragraph rendering variants
├── blockquoteConverters.tsx    # Blockquote rendering variants
├── headingConverters.tsx       # Heading rendering variants
├── listConverters.tsx          # List rendering variants
├── blockConverters.tsx         # Custom block components
├── converterBuilder.tsx        # Main converter builder function
├── predefinedConverters.tsx    # Pre-configured converter sets
└── README.md                   # This file
```

## Usage

### Import from the main file (backward compatible)

```typescript
import {
  articleConverter,
  defaultConverter,
} from '@/utils/richTextConverters/index';
```

### Import specific converters

```typescript
import {
  paragraphConverters,
  buildConverter,
} from '@/utils/richTextConverters/index';
```

## Converter Types

### Paragraph Converters

- `article` - Centered, narrow width for articles
- `default` - Default mono font for blocks/cards
- `card` - Compact for cards
- `space` - For space pages
- `plain` - No styling, just the paragraph

### Blockquote Converters

- `article` - Large, centered for articles
- `page` - Medium for pages
- `default` - Medium for asset text
- `card` - Compact for cards

### Heading Converters

- `default` - Standard heading mapping
- `small` - All headings as small titles
- `card` - For cards
- `label` - All headings as labels

### List Converters

- `default` - Standard list with ListItem component
- `card` - Compact lists for cards
- `lined` - Lists with dividers
- `plain` - Plain lists without custom styling

## Predefined Converters

- `articleConverter` - For article content with inline blocks
- `defaultConverter` - For blocks, cards, etc.
- `assetTextConverter` - For asset text content
- `cardConverter` - For compact card content
- `plainConverter` - Minimal styling
- `spaceConverter` - For space pages with label headings

## Building Custom Converters

```typescript
import { buildConverter } from '@/utils/richTextConverters/index';

const customConverter = buildConverter({
  paragraph: 'article',
  blockquote: 'page',
  heading: 'default',
  list: 'default',
  includeBlocks: true,
});
```

## Adding New Converters

1. Add your converter function to the appropriate file
2. Export it from that file
3. Re-export it from `index.ts`
4. Update the types in `types.ts` if needed

## Migration

The original `richTextConverters.tsx` file now simply re-exports everything from this directory, so existing imports will continue to work without changes.
