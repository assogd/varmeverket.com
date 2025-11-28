import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';

const Spotlight: Block = {
  slug: 'spotlight',
  imageURL: '/block-thumbnails/spotlight.png',
  imageAltText: 'Spotlight Block',
  labels: {
    singular: 'Spotlight',
    plural: 'Spotlights',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'subheadline',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          'Optional. If provided, the feature includes media and subtle motion.',
      },
    },
    LinkGroup,
  ],
};

export default Spotlight;
