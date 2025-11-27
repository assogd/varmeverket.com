import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';
import Text from '@/blocks/articles/Text';
import List from '@/blocks/global/List';

const InfoOverlay: Block = {
  slug: 'infoOverlay',
  labels: {
    singular: 'Info Overlay',
    plural: 'Info Overlays',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: {
        description: 'Main headline for the overlay content',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Hero image displayed in the overlay',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: false,
      admin: {
        description:
          'Content blocks for the overlay - can include text, images, lists, etc.',
      },
      blocks: [Text, List],
    },
    LinkGroup,
  ],
};

export default InfoOverlay;
