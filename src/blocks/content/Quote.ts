import type { Block } from 'payload';

const Quote: Block = {
  slug: 'quote',
  labels: {
    singular: 'Quote',
    plural: 'Quote Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'The quote content',
      },
    },
  ],
};

export default Quote;
