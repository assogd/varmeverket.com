import type { Block } from 'payload';
import CommonCard from '@/blocks/CommonCard';

const CourseCatalog: Block = {
  slug: 'courseCatalog',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: {
        description: 'Text that will scroll in the top and bottom marquees',
      },
    },
    {
      name: 'navigationSections',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'sectionId',
          type: 'text',
          required: true,
          admin: {
            description:
              'Unique identifier for this section (e.g., "beginner", "intermediate", "advanced")',
          },
        },
        {
          name: 'sectionTitle',
          type: 'text',
          required: true,
          admin: {
            description:
              'Display title for this section (e.g., "BEGINNER", "INTERMEDIATE", "ADVANCED")',
          },
        },
        {
          name: 'navigationItems',
          type: 'blocks',
          required: true,
          minRows: 1,
          blocks: [CommonCard],
        },
      ],
    },
  ],
};

export default CourseCatalog;
