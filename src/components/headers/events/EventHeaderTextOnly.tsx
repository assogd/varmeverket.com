/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { FadeInUp } from '@/components/ui';
import { TagList } from '@/components/ui';
import { Heading } from '@/components/headings';
import { defaultConverter } from '@/utils/richTextConverters';
import { EventMeta } from './EventMeta';

interface EventHeaderTextOnlyProps {
  eventData: {
    title?: string;
    tags?: Array<{ id: string; name: string }>;
    startDateTime?: string;
    endDateTime?: string;
    isAllDay?: boolean;
    format?: 'in_person' | 'online' | 'hybrid';
    locationName?: string;
    space?: { title?: string };
  };
  text?: any;
}

function hasH1(richTextData: any): boolean {
  if (!richTextData?.root?.children) return false;
  const checkChildren = (children: any[]): boolean => {
    return children.some(child => {
      if (child.type === 'heading' && child.tag === 'h1') return true;
      if (child.children) return checkChildren(child.children);
      return false;
    });
  };
  return checkChildren(richTextData.root.children);
}

export default function EventHeaderTextOnly({
  eventData,
  text,
}: EventHeaderTextOnlyProps) {
  return (
    <div className="relative">
      <DevIndicator componentName="EventHeaderTextOnly" position="top-right" />

      <div className="grid gap-8 justify-center pt-32 text-center">
        <TagList tags={eventData.tags} size="md" className="mb-4" />

        <FadeInUp as="div" timing="fast">
          <div className="px-4 grid gap-8 font-mono">
            {text && eventData.title && !hasH1(text) && (
              <Heading variant="page-header" as="h1">
                {eventData.title}
              </Heading>
            )}
            {text && (
              <RichText
                data={text}
                className="grid gap-3 justify-center"
                converters={defaultConverter}
              />
            )}
          </div>
        </FadeInUp>

        {!text && eventData.title && (
          <Heading variant="page-header" as="h1">
            {eventData.title}
          </Heading>
        )}

        <EventMeta
          startDateTime={eventData.startDateTime}
          endDateTime={eventData.endDateTime}
          isAllDay={eventData.isAllDay}
          format={eventData.format}
          locationName={eventData.locationName}
          space={eventData.space}
        />
      </div>
    </div>
  );
}
