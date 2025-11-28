import type { Block } from 'payload';
import { InlineHeader } from '@/fields/InlineHeader';
import QA from '@/blocks/interactive/QA';
import QAGroup from '@/blocks/interactive/QAGroup';

const FAQ: Block = {
  slug: 'faq',
  imageURL: '/block-thumbnails/faq.png',
  imageAltText: 'FAQ Block',
  labels: {
    singular: 'FAQ Block',
    plural: 'FAQ Blocks',
  },
  fields: [
    ...InlineHeader,
    {
      name: 'items',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [QA, QAGroup],
      admin: {
        description: 'Add individual Q&As or Q&A groups to this FAQ section',
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Accordion', value: 'accordion' },
        { label: 'List', value: 'list' },
      ],
      defaultValue: 'accordion',
      admin: {
        description: 'Choose how to display the Q&As',
      },
    },
  ],
};

export default FAQ;
