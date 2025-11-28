import type { Block } from 'payload';

const HighlightGridGenerator: Block = {
  slug: 'highlightGridGenerator',
  labels: {
    singular: 'Highlight Grid Generator',
    plural: 'Highlight Grid Generators',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: {
        description: 'Headline for the generated content section',
      },
    },
    {
      name: 'contentTypes',
      type: 'select',
      required: true,
      hasMany: true,
      options: [
        { label: 'Articles', value: 'articles' },
        { label: 'Showcases', value: 'showcases' },
      ],
      defaultValue: ['articles'],
      admin: {
        description: 'Select which content types to include in the generator',
      },
    },
    {
      name: 'filterTags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      required: false,
      admin: {
        description:
          'Select tags to filter content by (leave empty to show all content)',
      },
    },
    {
      name: 'maxItems',
      type: 'number',
      required: false,
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: {
        description: 'Maximum number of items to display (1-12)',
      },
    },
    {
      name: 'sortBy',
      type: 'select',
      options: [
        { label: 'Published Date (Newest First)', value: '-publishedDate' },
        { label: 'Published Date (Oldest First)', value: 'publishedDate' },
        { label: 'Title (A-Z)', value: 'title' },
        { label: 'Title (Z-A)', value: '-title' },
        { label: 'Year (Newest First)', value: '-year' },
        { label: 'Year (Oldest First)', value: 'year' },
        { label: 'Created Date (Newest First)', value: '-createdAt' },
        { label: 'Created Date (Oldest First)', value: 'createdAt' },
      ],
      defaultValue: '-publishedDate',
      admin: {
        description: 'How to sort the generated content',
      },
    },
  ],
};

export default HighlightGridGenerator;
