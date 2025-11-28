import type { Block } from 'payload';

const HighlightGrid: Block = {
  slug: 'highlightGrid',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'highlights',
      type: 'relationship',
      relationTo: ['showcases', 'articles'] as never,
      hasMany: true,
      required: true,
    },
  ],
};

export default HighlightGrid;
