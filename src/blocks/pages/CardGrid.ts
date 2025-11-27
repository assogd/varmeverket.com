import type { Block } from 'payload';
import CommonCard from '@/blocks/CommonCard';
import { InlineHeader } from '@/fields/InlineHeader';

const CardGrid: Block = {
  slug: 'card-grid',
  fields: [
    ...InlineHeader,
    {
      name: 'backgroundColor',
      type: 'select',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Orange Accent',
          value: 'orange',
        },
      ],
      defaultValue: 'default',
      admin: {
        description: 'Choose the background color for the card grid',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Cards',
      minRows: 1,
      fields: [...CommonCard.fields],
    },
  ],
};

export default CardGrid;
