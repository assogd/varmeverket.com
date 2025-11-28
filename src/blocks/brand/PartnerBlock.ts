import type { Block } from 'payload';

const PartnerBlock: Block = {
  slug: 'partner-block',
  labels: {
    singular: 'Partner',
    plural: 'Partners',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The name or title of the partner',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The partner logo/image',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional URL to link to when the partner is clicked',
      },
    },
  ],
};

export default PartnerBlock;
