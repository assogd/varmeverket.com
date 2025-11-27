import type { Block } from 'payload';
import ListItem from '@/blocks/ListItem';
import { InlineHeader } from '@/fields/InlineHeader';

const List: Block = {
  slug: 'list',
  labels: {
    singular: 'List',
    plural: 'Lists',
  },
  fields: [
    ...InlineHeader,
    {
      name: 'items',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [ListItem],
    },
  ],
};

export default List;
