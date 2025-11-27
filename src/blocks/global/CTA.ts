import type { Block } from 'payload';
import LinkGroup from '@/fields/LinkGroup';

const CTA: Block = {
  slug: 'cta',
  labels: {
    singular: 'Call to Action',
    plural: 'Call to Action Blocks',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'ctaType',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Rotating Button', value: 'rotating' },
        { label: 'Marquee', value: 'marquee' },
      ],
      required: true,
      defaultValue: 'default',
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
      admin: {
        condition: (data: unknown, siblingData: unknown) =>
          (siblingData as { ctaType?: string })?.ctaType !== 'rotating',
      },
    },
    LinkGroup,
  ],
};

export default CTA;
