import type { CollectionConfig } from 'payload';
import AssetText from '@/blocks/composite/AssetText';
import AssetTextContainer from '@/blocks/composite/AssetTextContainer';
import Spotlight from '@/blocks/interactive/Spotlight';
import HorizontalCardBlock from '@/blocks/layout/HorizontalCardBlock';
import CardGrid from '@/blocks/layout/CardGrid';
import LogotypeWall from '@/blocks/brand/LogotypeWall';
import PartnerBlock from '@/blocks/brand/PartnerBlock';
import Router from '@/blocks/layout/Router';
import Carousel from '@/blocks/layout/Carousel';
import List from '@/blocks/layout/List';
import CourseCatalog from '@/blocks/specialized/CourseCatalog';
import HighlightGridGenerator from '@/blocks/layout/HighlightGridGenerator';
import FAQ from '@/blocks/interactive/FAQ';
import HighlightGrid from '@/blocks/layout/HighlightGrid';
import Calendar from '@/blocks/interactive/Calendar';
import InfoOverlay from '@/blocks/interactive/InfoOverlay';
import HorizontalMarqueeBlock from '@/blocks/interactive/HorizontalMarqueeBlock';
import TextBlock from '@/blocks/content/TextBlock';
import CTA from '@/blocks/interactive/CTA';
import Model3D from '@/blocks/media/Model3D';
import MinimalCarousel from '@/blocks/layout/MinimalCarousel';
import Image from '@/blocks/media/Image';
import SEOFields from '@/fields/SEOFields';
import LinkGroup from '@/fields/LinkGroup';
import { authenticated } from '@/access/authenticated';
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished';

const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              label: 'Header',
              fields: [
                {
                  name: 'variant',
                  type: 'select',
                  label: 'Variant',
                  options: [
                    { label: 'No assets', value: 'text-only' },
                    { label: 'Assets before text', value: 'assets-before' },
                    { label: 'Text before assets', value: 'text-before' },
                    {
                      label: 'Full viewport width hero',
                      value: 'gradient',
                    },
                  ],
                  defaultValue: 'text-only',
                  required: true,
                  admin: {
                    description: 'Choose the header display style',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: false,
                  admin: {
                    description: 'Small title displayed above the main header text',
                  },
                },
                {
                  name: 'text',
                  type: 'richText',
                  required: false,
                  admin: {
                    description: 'Main header text content for this page',
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
                        condition: () => false, // Hide the field
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
                      type: 'text', // Store Mux asset ID or playback ID
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
                  required: false,
                },
                LinkGroup,
              ],
              required: false,
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              required: false,
              blocks: [
                HighlightGrid,
                CardGrid,
                LogotypeWall,
                PartnerBlock,
                Carousel,
                CourseCatalog,
                HighlightGridGenerator,
                HorizontalCardBlock,
                Router,
                Spotlight,
                AssetText,
                AssetTextContainer,
                List,
                FAQ,
                Calendar,
                InfoOverlay,
                HorizontalMarqueeBlock,
                TextBlock,
                CTA,
                Model3D,
                MinimalCarousel,
                Image,
                // Add more blocks here as needed
              ],
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
  hooks: {},
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};

export default Pages;
