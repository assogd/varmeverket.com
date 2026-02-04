import type { CollectionConfig } from 'payload';
import { authenticated } from '@/access/authenticated';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

const Announcements: CollectionConfig = {
  slug: 'announcements',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true, // Allow public read access for portal users
    update: authenticated,
  },
  admin: {
    defaultColumns: [
      'title',
      'priority',
      'isEnabled',
      'startsAt',
      'endsAt',
      'updatedAt',
    ],
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of the announcement',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
      admin: {
        description: 'The content of the announcement',
      },
    },
    {
      name: 'priority',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Priority for sorting (higher numbers appear first)',
      },
    },
    {
      name: 'isEnabled',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Whether this announcement is currently active',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        description:
          'When this announcement should start being shown (optional)',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      required: false,
      admin: {
        position: 'sidebar',
        description:
          'When this announcement should stop being shown (optional)',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
  ],
};

export default Announcements;
