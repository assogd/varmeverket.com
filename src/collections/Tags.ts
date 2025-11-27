import type { CollectionConfig } from 'payload';
import { authenticated } from '@/access/authenticated';

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true, // Allow public read access for tags
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Profile picture for this tag',
      },
    },
    {
      name: 'references',
      type: 'relationship',
      relationTo: ['articles', 'pages', 'spaces'],
      hasMany: true,
      required: false,
      admin: {
        hidden: true,
        description: 'Related content that uses this tag',
      },
    },
  ],
};

export default Tags;
