import type { Block } from 'payload';

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
