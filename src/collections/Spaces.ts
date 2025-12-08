import type { CollectionConfig } from 'payload';
import AssetText from '@/blocks/composite/AssetText';
import AssetTextContainer from '@/blocks/composite/AssetTextContainer';
import LogotypeWall from '@/blocks/brand/LogotypeWall';
import PartnerBlock from '@/blocks/brand/PartnerBlock';
import List from '@/blocks/layout/List';
import TextBlock from '@/blocks/content/TextBlock';
import MinimalCarousel from '@/blocks/layout/MinimalCarousel';
import CTA from '@/blocks/interactive/CTA';
import Form from '@/blocks/interactive/Form';
import HighlightGrid from '@/blocks/layout/HighlightGrid';
import HighlightGridGenerator from '@/blocks/layout/HighlightGridGenerator';
import Calendar from '@/blocks/interactive/Calendar';
import Image from '@/blocks/media/Image';
import InfoOverlay from '@/blocks/interactive/InfoOverlay';
import HorizontalMarqueeBlock from '@/blocks/interactive/HorizontalMarqueeBlock';
import Model3D from '@/blocks/media/Model3D';
import Carousel from '@/blocks/layout/Carousel';
import CardGrid from '@/blocks/layout/CardGrid';
import Router from '@/blocks/layout/Router';
import Spotlight from '@/blocks/interactive/Spotlight';
import FAQ from '@/blocks/interactive/FAQ';
import SEOFields from '@/fields/SEOFields';
import { authenticated } from '@/access/authenticated';
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished';

const Spaces: CollectionConfig = {
  slug: 'spaces',
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
    defaultColumns: ['title', 'slug', 'capacity', 'updatedAt'],
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
      name: 'capacity',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Maximum number of people the space can accommodate',
      },
    },
    {
      name: 'areaSize',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
        description: 'Size of the space in square meters',
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
                  name: 'text',
                  type: 'richText',
                  required: false,
                },
                {
                  name: 'heroAsset',
                  type: 'group',
                  label: 'Hero Asset',
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
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (data: unknown, siblingData: unknown) =>
                          (siblingData as { type?: string })?.type === 'image',
                      },
                    },
                    {
                      name: 'mux',
                      type: 'text', // Store Mux asset ID or playback ID
                      required: false,
                      admin: {
                        condition: (data: unknown, siblingData: unknown) =>
                          (siblingData as { type?: string })?.type === 'mux',
                      },
                    },
                    {
                      name: 'video',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                      admin: {
                        condition: (data: unknown, siblingData: unknown) =>
                          (siblingData as { type?: string })?.type === 'video',
                      },
                    },
                  ],
                  required: false,
                },
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
                HighlightGridGenerator,
                Image,
                AssetText,
                AssetTextContainer,
                LogotypeWall,
                PartnerBlock,
                CTA,
                Form,
                List,
                MinimalCarousel,
                TextBlock,
                Calendar,
                InfoOverlay,
                HorizontalMarqueeBlock,
                Model3D,
                Carousel,
                CardGrid,
                Router,
                Spotlight,
                FAQ,
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

export default Spaces;
