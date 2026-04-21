import type { CollectionConfig } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';

import Image from '@/blocks/media/Image';
import Video from '@/blocks/media/Video';
import CTA from '@/blocks/interactive/CTA';
import QA from '@/blocks/interactive/QA';
import LogotypeWall from '@/blocks/brand/LogotypeWall';
import Model3D from '@/blocks/media/Model3D';
import MinimalCarousel from '@/blocks/layout/MinimalCarousel';
import CardGrid from '@/blocks/layout/CardGrid';
import SEOFields from '@/fields/SEOFields';
import { authenticated } from '@/access/authenticated';
import { commonHooks, commonVersioning } from '@/utils/hooks';

const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user) return true;
      // Allow either custom status or Payload's _status (draft publish) so events show when "published" in admin
      return {
        or: [
          { status: { equals: 'published' } },
          { _status: { equals: 'published' } },
        ],
      } as import('payload').Where;
    },
    update: authenticated,
  },
  admin: {
    defaultColumns: [
      'title',
      'status',
      'eventAccess',
      'featured',
      'startDateTime',
      'format',
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
        description: 'The main title of the event',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: false,
      admin: {
        position: 'sidebar',
        description:
          'URL-friendly version of the title (auto-generated if empty)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publication status of the event',
      },
    },
    {
      name: 'eventAccess',
      type: 'select',
      required: false,
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Members only', value: 'members_only' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Controls whether the event page is public or only available for logged-in portal members.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      required: false,
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'If enabled, this event will show on the portal dashboard for every member.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Time & Location',
          fields: [
            {
              name: 'startDateTime',
              type: 'date',
              required: true,
              admin: {
                description: 'When the event starts',
                date: {
                  pickerAppearance: 'dayAndTime',
                  timeFormat: 'HH:mm',
                  displayFormat: 'MMM dd, yyyy HH:mm',
                },
              },
            },
            {
              name: 'endDateTime',
              type: 'date',
              required: false,
              admin: {
                description: 'When the event ends (optional)',
                date: {
                  pickerAppearance: 'dayAndTime',
                  timeFormat: 'HH:mm',
                  displayFormat: 'MMM dd, yyyy HH:mm',
                },
              },
            },
            {
              name: 'isAllDay',
              type: 'checkbox',
              required: false,
              admin: {
                description: 'Mark as an all-day event',
              },
            },
            {
              name: 'format',
              type: 'select',
              required: false,
              defaultValue: 'in_person',
              options: [
                { label: 'In person', value: 'in_person' },
                { label: 'Online', value: 'online' },
                { label: 'Hybrid', value: 'hybrid' },
              ],
              admin: {
                description: 'How the event is delivered',
              },
            },
            {
              name: 'locationSource',
              type: 'select',
              required: false,
              defaultValue: 'space',
              options: [
                { label: 'Choose a space', value: 'space' },
                { label: 'Custom field', value: 'custom' },
              ],
              admin: {
                description:
                  'Choose whether to link to a space or write a custom location',
              },
            },
            {
              name: 'space',
              type: 'relationship',
              relationTo: 'spaces',
              required: false,
              admin: {
                description: 'Choose a space for this event',
                condition: (
                  data: unknown,
                  siblingData: { locationSource?: 'space' | 'custom' } = {}
                ) => siblingData?.locationSource !== 'custom',
              },
            },
            {
              name: 'locationName',
              type: 'text',
              required: false,
              admin: {
                description:
                  'Location name or venue (shown when using custom field)',
                condition: (
                  data: unknown,
                  siblingData: { locationSource?: 'space' | 'custom' } = {}
                ) => siblingData?.locationSource === 'custom',
              },
            },
            {
              name: 'onlineUrl',
              type: 'text',
              required: false,
              admin: {
                description:
                  'Link to online meeting / stream (shown for online or hybrid events)',
                condition: (
                  data: unknown,
                  siblingData: { format?: string } = {}
                ) =>
                  siblingData?.format === 'online' ||
                  siblingData?.format === 'hybrid',
              },
            },
            {
              name: 'externalCta',
              type: 'group',
              label: 'External CTA',
              admin: {
                description:
                  'Optional sticky event action shown together with SPARA, for example "Köp biljetter".',
              },
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  required: false,
                  admin: {
                    description: 'External URL for the event action.',
                  },
                },
                {
                  name: 'text',
                  type: 'text',
                  required: false,
                  admin: {
                    description:
                      'Button label shown in the sticky event action area.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              label: 'Header',
              fields: [
                {
                  name: 'text',
                  type: 'richText',
                  required: false,
                  admin: {
                    description: 'Main header text content for this event',
                  },
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
                          'Choose where this asset should appear relative to the header text content',
                      },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'image',
                      },
                    },
                    {
                      name: 'mux',
                      type: 'text',
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'mux',
                      },
                    },
                    {
                      name: 'video',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (
                          data: unknown,
                          siblingData: Record<string, unknown>
                        ) => siblingData?.type === 'video',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: false,
              admin: {
                description:
                  'Main image displayed at the top of the event page',
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              required: false,
              admin: {
                description:
                  'A brief summary or excerpt of the event (used in listings and social media)',
              },
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags' as const,
              hasMany: true,
              required: false,
              admin: {
                description: 'Select one or more tags for this event',
              },
            },
            {
              name: 'introduction',
              type: 'richText',
              required: false,
              admin: {
                hidden: true,
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: false,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  BlocksFeature({
                    blocks: [
                      Image,
                      Video,
                      CTA,
                      QA,
                      LogotypeWall,
                      Model3D,
                      MinimalCarousel,
                      CardGrid,
                    ],
                  }),
                ],
              }),
              admin: {
                description:
                  'The main content of the event. You can insert blocks (images, videos, etc.) anywhere within the content using the block button.',
              },
            },
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: false,
              access: {
                read: () => true,
              },
              maxDepth: 0,
              admin: {
                description: 'Optional form to display on this event.',
              },
            },
          ],
        },
        {
          label: 'Series & Occurrences',
          fields: [
            {
              name: 'children',
              type: 'relationship',
              relationTo: 'events',
              required: false,
              hasMany: true,
              maxDepth: 1,
              admin: {
                description:
                  'Link one or more child events to make this a series parent. Leave empty for standalone events.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [SEOFields],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [commonHooks.dateTracking],
  },
  versions: commonVersioning,
};

export default Events;
