import type { CollectionConfig } from 'payload';
import { authenticated } from '@/access/authenticated';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true, // Allow public read access for user profiles
    update: authenticated,
  },
  fields: [
    // Email added by default
    {
      name: 'firstName',
      type: 'text',
      required: false,
    },
    {
      name: 'lastName',
      type: 'text',
      required: false,
    },
    {
      name: 'bylineDescription',
      type: 'textarea',
      required: false,
      admin: {
        description: 'A brief description or bio for use in article bylines',
      },
    },
    {
      name: 'profilePicture',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Profile picture for this user',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      required: false,
      admin: {
        description: 'Tags associated with this user',
      },
    },
  ],
};
