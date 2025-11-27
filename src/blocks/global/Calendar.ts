import type { Block } from 'payload';
import { InlineHeader } from '@/fields/InlineHeader';

const CalendarEvent: Block = {
  slug: 'calendarEvent',
  labels: {
    singular: 'Calendar Event',
    plural: 'Calendar Events',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
    {
      name: 'link',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Internal', value: 'internal' },
            { label: 'External', value: 'external' },
          ],
          defaultValue: 'internal',
          required: false,
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'spaces'],
          required: false,
          admin: {
            condition: (data: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.type === 'internal',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: false,
          admin: {
            condition: (data: unknown, siblingData: Record<string, unknown>) =>
              siblingData?.type === 'external',
          },
        },
        {
          name: 'text',
          type: 'text',
          required: false,
          defaultValue: 'Läs mer',
        },
      ],
      admin: {
        description: 'Optional link for the event',
      },
    },
  ],
};

const Calendar: Block = {
  slug: 'calendar',
  labels: {
    singular: 'Calendar',
    plural: 'Calendar Blocks',
  },
  fields: [
    ...InlineHeader,
    {
      name: 'events',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [CalendarEvent],
    },
  ],
};

export default Calendar;
