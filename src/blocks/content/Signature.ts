import type { Block } from 'payload';

const Signature: Block = {
  slug: 'signature',
  labels: {
    singular: 'Signature',
    plural: 'Signatures',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
      admin: {
        description: 'Signature text (e.g., name, initials, or title)',
      },
    },
  ],
};

export default Signature;
