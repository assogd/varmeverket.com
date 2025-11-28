import type { Block } from 'payload';

/**
 * @deprecated This block is deprecated and will be removed after migration.
 * Use TextBlock instead, which includes all features of Text plus variant support.
 *
 * Legacy: This block is kept temporarily for backward compatibility.
 * All new blocks should use TextBlock from '@/blocks/content/TextBlock'.
 *
 * Migration status: 1 instance in database (Fotostudio space) - to be migrated manually.
 */
const Text: Block = {
  slug: 'text',
  labels: {
    singular: 'Text Block',
    plural: 'Text Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      validate: (value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { validateNoH1Headings } = require('@/utils/validation');
        return validateNoH1Headings(value);
      },
    },
  ],
};

export default Text;
