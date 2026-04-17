import type { Block } from 'payload';

const HighlightGrid: Block = {
  slug: 'highlightGrid',
  imageURL: '/block-thumbnails/highlight-grid-generator.png',
  imageAltText: 'Highlight Grid Block',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'highlights',
      type: 'relationship',
      relationTo: ['showcases', 'articles', 'events'] as never,
      hasMany: true,
      required: true,
    },
  ],
};

export default HighlightGrid;
