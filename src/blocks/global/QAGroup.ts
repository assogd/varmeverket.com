import type { Block } from 'payload';
import QA from '@/blocks/global/QA';

const QAGroup: Block = {
  slug: 'qaGroup',
  labels: {
    singular: 'Q&A Group',
    plural: 'Q&A Groups',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Group title (e.g., "General", "Technical", "Billing")',
      },
    },
    {
      name: 'items',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [QA],
    },
  ],
};

export default QAGroup;
