import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';
import { InlineHeader } from '@/fields/InlineHeader';

const Carousel: Block = {
  slug: 'carousel',
  fields: [
    ...InlineHeader,
    {
      name: 'slides',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'subheadline',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Hidden', value: 'hidden' },
          ],
          defaultValue: 'default',
        },
        LinkGroup,
      ],
    },
  ],
};

export default Carousel;
