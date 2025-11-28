import type { Block } from 'payload';

const TextBlock: Block = {
  slug: 'textBlock',
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
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Article', value: 'article' },
      ],
      admin: {
        description:
          'Choose the text block variant for different styling and layout',
      },
    },
  ],
};

export default TextBlock;
