import type { Block } from 'payload';
import UserCard from '@/blocks/global/UserCard';

const HorizontalMarqueeBlock: Block = {
  slug: 'horizontalMarquee',
  labels: {
    singular: 'Horizontal Marquee',
    plural: 'Horizontal Marquees',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: false,
      admin: {
        description: 'Optional headline for the marquee section',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
      admin: {
        description: 'Optional description for the marquee section',
      },
    },
    {
      name: 'speed',
      type: 'number',
      required: true,
      defaultValue: 20,
      min: 10,
      max: 30,
      admin: {
        description:
          'Speed of the marquee animation (10 = slowest, 30 = fastest)',
      },
    },
    {
      name: 'userCards',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [UserCard],
      admin: {
        description: 'Add user cards to display in the marquee',
      },
    },
  ],
};

export default HorizontalMarqueeBlock;
