import type { CollectionConfig, Field } from 'payload';
import NavigationItem from '@/blocks/shared/NavigationItem';
import LinkGroup from '@/fields/LinkGroup';
import { commonHooks, publicAccess } from '@/utils/hooks';

const Navigation: CollectionConfig = {
  slug: 'navigation',
  labels: {
    singular: 'Navigation',
    plural: 'Navigation',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Globals',
  },
  access: publicAccess,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
        description:
          'Name for this navigation (e.g., "Main Navigation", "Footer Navigation")',
      },
    },
    {
      name: 'highlight',
      type: 'group',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Highlighted item shown in closed navigation state',
      },
      fields: [...(LinkGroup as { fields: Field[] }).fields] as Field[],
    },
    {
      name: 'menuItems',
      type: 'blocks',
      required: true,
      admin: {
        description: 'Main menu items',
      },
      blocks: [NavigationItem],
    },
  ],
  hooks: {
    beforeValidate: [
      commonHooks.initializeNestedArrays as unknown as (args: {
        data?: Record<string, unknown>;
        operation: string;
      }) => Record<string, unknown>,
    ],
  },
};

export default Navigation;
