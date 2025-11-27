import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { Attribute } from '@/components/ui';
import MediaAsset from '@/components/common/MediaAsset';
import { buildConverter } from '@/utils/richTextConverters/index';
import { Heading } from '@/components/headings';

interface Asset {
  type: 'image' | 'mux';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
}

interface HeaderBlockHeroProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: any;
  heroAsset?: {
    type?: 'image' | 'mux';
    image?: { url: string; alt?: string; width?: number; height?: number };
    mux?: string;
  };
  title?: string;
  attributes?: Array<{
    type: 'custom' | 'capacity' | 'area';
    value: string | number;
    unit?: string;
  }>;
}

// Custom converter for hero headers with label headlines
const heroConverter = buildConverter({
  paragraph: 'space',
  heading: 'label',
  list: 'default',
});

export default function HeaderBlockHero({
  text,
  heroAsset,
  title,
  attributes = [],
}: HeaderBlockHeroProps) {
  return (
    <div className="relative">
      <DevIndicator componentName="HeaderBlockHero" position="top-center" />

      {/* Hero Section */}
      <div
        className={`relative overflow-hidden pt-8 ${
          heroAsset
            ? 'h-[50vh] sm:h-[80vh] min-h-[500px]'
            : 'h-[50vh] sm:h-[70vh] min-h-[450px]'
        }`}
      >
        {/* Background Asset */}
        {heroAsset && (
          <div className="absolute inset-0 opacity-90">
            <MediaAsset asset={heroAsset as Asset} variant="hero" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg to-transparent" />
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 pb-4">
          {/* Page Title */}
          {title && (
            <Heading variant="building-title">{title.toUpperCase()}</Heading>
          )}

          {/* Page Attributes */}
          {attributes.length > 0 && (
            <div className="flex items-center gap-1 mt-0">
              {attributes.map((attr, index) => (
                <Attribute
                  key={index}
                  type={attr.type}
                  value={attr.value}
                  unit={attr.unit}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {text && (
        <RichText
          data={text}
          className="grid gap-3 justify-center text-center text-md lg:text-lg px-2"
          converters={heroConverter}
        />
      )}
    </div>
  );
}
