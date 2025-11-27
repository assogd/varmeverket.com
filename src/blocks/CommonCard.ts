import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';

const CommonCard: Block = {
  slug: 'common-card',
  fields: [
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags', // This is the correct usage for a single collection in Payload
      hasMany: true,
      required: false,
      admin: {
        description: 'Select one or more tags to use as badges',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: false,
      validate: (value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { validateNoH1Headings } = require('@/utils/validation');
        return validateNoH1Headings(value);
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    LinkGroup,
  ],
};

export default CommonCard;
