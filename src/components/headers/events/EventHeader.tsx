import React from 'react';
import EventHeaderAssetsAbove from './EventHeaderAssetsAbove';
import EventHeaderStandard from './EventHeaderStandard';
import EventHeaderTextOnly from './EventHeaderTextOnly';

interface Asset {
  type: 'image' | 'mux' | 'video';
  placement: 'before' | 'after';
  image?: { url: string; alt?: string; width?: number; height?: number };
  mux?: string;
  video?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    filename?: string;
    mimeType?: string;
  };
}

export interface EventHeaderEventData {
  title?: string;
  excerpt?: string;
  tags?: Array<{ id: string; name: string }>;
  startDateTime?: string;
  endDateTime?: string;
  isAllDay?: boolean;
  format?: 'in_person' | 'online' | 'hybrid';
  locationName?: string;
  space?: { title?: string };
}

interface EventHeaderProps {
  eventData: EventHeaderEventData;
  header?: {
    text?: unknown;
    assets?: Asset[];
  };
  /** When no header assets exist, use this as a single "before" image (like article header assets). */
  featuredImage?: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export function EventHeader({ eventData, header, featuredImage }: EventHeaderProps) {
  const validAssets = (header?.assets || []).filter(asset => {
    if (asset.type === 'image') {
      return asset.image?.url && asset.image.url.trim() !== '';
    }
    if (asset.type === 'mux') {
      return asset.mux && asset.mux.trim() !== '';
    }
    if (asset.type === 'video') {
      return asset.video?.url && asset.video.url.trim() !== '';
    }
    return false;
  });

  // Use featuredImage as a single "before" asset when no header assets (same pattern as articles)
  const assets =
    validAssets.length > 0
      ? validAssets
      : featuredImage?.url?.trim()
        ? [
            {
              type: 'image' as const,
              placement: 'before' as const,
              image: {
                url: featuredImage.url,
                alt: featuredImage.alt,
                width: featuredImage.width,
                height: featuredImage.height,
              },
            },
          ]
        : [];

  const beforeAssets = assets.filter(a => a.placement === 'before');
  const afterAssets = assets.filter(a => a.placement === 'after');
  const hasAssets = assets.length > 0;

  if (!hasAssets) {
    return (
      <EventHeaderTextOnly eventData={eventData} text={header?.text} />
    );
  }

  if (beforeAssets.length > 0) {
    return (
      <EventHeaderAssetsAbove
        eventData={eventData}
        text={header?.text}
        assets={beforeAssets}
      />
    );
  }

  if (afterAssets.length > 0) {
    return (
      <EventHeaderStandard
        eventData={eventData}
        text={header?.text}
        assets={afterAssets}
      />
    );
  }

  return null;
}
