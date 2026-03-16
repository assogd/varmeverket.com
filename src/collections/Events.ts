import type { CollectionConfig } from 'payload';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';

import Image from '@/blocks/media/Image';
import Video from '@/blocks/media/Video';
import CTA from '@/blocks/interactive/CTA';
import QA from '@/blocks/interactive/QA';
import LogotypeWall from '@/blocks/brand/LogotypeWall';
import PartnerBlock from '@/blocks/brand/PartnerBlock';
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
      return {
        status: {
          equals: 'published',
        },
      };
    },
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'status', 'startDateTime', 'format', 'updatedAt'],
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
      type: 'tabs',
      tabs: [
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
                description:
                  'Optional introduction section (appears before main content)',
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
                      PartnerBlock,
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
                description:
                  'Optional form to display on this event.',
              },
            },
          ],
        },
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
              required: true,
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

