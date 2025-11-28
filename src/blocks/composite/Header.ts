import type { Block } from 'payload';

const Header: Block = {
  slug: 'header',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Variant',
      options: [
        { label: 'No assets', value: 'text-only' },
        { label: 'Assets before text', value: 'assets-before' },
        { label: 'Text before assets', value: 'text-before' },
        { label: 'Full viewport width', value: 'gradient' },
      ],
      defaultValue: 'text-only',
      required: true,
      admin: {
        description: 'Choose the header display style',
      },
    },
    {
      name: 'text',
      type: 'richText',
      required: true,
    },
    {
      name: 'assets',
      type: 'array',
      label: 'Assets',
      minRows: 0,
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Mux Video', value: 'mux' },
            { label: 'Self-hosted Video', value: 'video' },
          ],
          required: false,
        },
        {
          name: 'placement',
          type: 'select',
          label: 'Placement',
          options: [
            { label: 'Before Text', value: 'before' },
            { label: 'After Text', value: 'after' },
          ],
          defaultValue: 'before',
          required: true,
          admin: {
            description:
              'Choose where this asset should appear relative to the text content',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            condition: (data: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.type === 'image',
          },
        },
        {
          name: 'mux',
          type: 'text', // Store Mux asset ID or playback ID
          required: false,
          admin: {
            condition: (data: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.type === 'mux',
          },
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            condition: (data: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.type === 'video',
          },
        },
      ],
      required: false,
    },
  ],
};

export default Header;
