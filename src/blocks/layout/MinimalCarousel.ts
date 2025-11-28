import type { Block } from 'payload';

const MinimalCarousel: Block = {
  slug: 'minimalCarousel',
  fields: [
    {
      name: 'assets',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'asset',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      name: 'aspectRatio',
      type: 'select',
      options: [
        { label: 'Landscape (16:9)', value: 'landscape' },
        { label: 'Portrait (9:16)', value: 'portrait' },
        { label: 'Square (1:1)', value: 'square' },
        { label: '4:3', value: 'fourThree' },
      ],
      required: true,
      defaultValue: 'landscape',
    },
  ],
};

export default MinimalCarousel;
