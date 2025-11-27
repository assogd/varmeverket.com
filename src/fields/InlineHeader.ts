import type { Field } from 'payload';

/**
 * Shared field group for block headers (headline + description)
 * Used across multiple block types for consistency
 */
export const InlineHeader: Field[] = [
  {
    name: 'headline',
    type: 'text',
    required: false,
    admin: {
      description: 'Optional headline for the block',
    },
  },
  {
    name: 'description',
    type: 'richText',
    required: false,
    admin: {
      description: 'Optional rich text description for the block',
    },
  },
];
