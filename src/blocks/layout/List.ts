import type { Block } from 'payload';
import ListItem from '@/blocks/shared/ListItem';
import { InlineHeader } from '@/fields/InlineHeader';

const List: Block = {
  slug: 'list',
  imageURL: '/block-thumbnails/list.png',
  imageAltText: 'List Block',
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
