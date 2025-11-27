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
      admin: {
        description:
          'Additional text content that can be inserted anywhere in the article',
      },
    },
  ],
};

export default TextBlock;
