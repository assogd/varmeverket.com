import type { Block } from 'payload';

const UserCard: Block = {
  slug: 'userCard',
  labels: {
    singular: 'User Card',
    plural: 'User Cards',
  },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      options: [
        { label: 'Text Only', value: 'textOnly' },
        { label: 'Compact Card', value: 'compactCard' },
        { label: 'Medium Card', value: 'mediumCard' },
        { label: 'Large Card', value: 'largeCard' },
      ],
      admin: {
        description: 'Choose the visual variant for this user card',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Select the user to display in this card',
      },
    },
  ],
};

export default UserCard;
