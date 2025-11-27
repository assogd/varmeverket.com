import type { Field } from 'payload';

const LinkGroup: Field = {
  name: 'link',
  type: 'group',
  label: 'Add Link',
  admin: {
    description: 'Choose the type of link to add',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Internal Link', value: 'internal' },
        { label: 'External Link', value: 'external' },
        { label: 'Copy', value: 'copy' },
      ],
      defaultValue: 'internal',
      required: true,
      admin: {
        description: 'Choose the type of link',
      },
    },
    {
      name: 'doc',
      type: 'relationship',
      relationTo: ['pages', 'spaces', 'articles'],
      required: false,
      admin: {
        condition: (data: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.type === 'internal',
        description: 'Select a page, space, or article to link to',
        allowCreate: false,
        isClearable: true,
        appearance: 'drawer',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        condition: (data: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.type === 'external',
        description: 'Enter the external URL',
      },
    },
    {
      name: 'text',
      type: 'text',
      required: false,
      defaultValue: 'Läs mer',
      admin: {
        description: 'Link text (optional)',
      },
    },
  ],
};

export default LinkGroup;
