'use client';
import React from 'react';
import Image from 'next/image';
import { AppAction } from '@/components/ui';
import { TagList } from '@/components/ui';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { cardConverter } from '@/utils/richTextConverters/index';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { routeLink, type LinkGroup as LinkGroupType } from '@/utils/linkRouter';
import { fixImageUrl } from '@/utils/imageUrl';
import { Heading } from '@/components/headings';

interface Tag {
  id: string;
  name: string;
}

interface Media {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

interface LinkGroup {
  type: 'internal' | 'external' | 'copy';
  reference?: { slug: string };
  url?: string;
  text: string;
}

interface CarouselSlideProps {
  tags?: Tag[];
  subheadline?: string;
  content?: {
    root: {
      children: Array<{
        type: string;
        children?: Array<{
          text?: string;
          type?: string;
        }>;
      }>;
    };
  };
  image?: Media;
  link?: LinkGroupType;
  variant?: 'default' | 'hidden';
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({
  tags,
  subheadline,
  content,
  image,
  link,
  variant = 'default',
}) => {
  const renderActionButton = (link: LinkGroupType) => {
    const linkResult = routeLink(link);

    if (linkResult.isExternal) {
      return (
        <AppAction
          link={link}
          className="flex items-center gap-3 px-4 xl:px-6 py-3 border border-text rounded-lg hover:bg-text hover:text-white transition-colors duration-200 w-full min-w-0"
          variant="minimal"
        >
          <svg
            className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="font-mono text-xs xl:text-sm truncate min-w-0">
            {link.text?.toUpperCase()}
          </span>
        </AppAction>
      );
    }

    return (
      <AppAction link={link} variant="outline">
        {link.text?.toUpperCase()}
      </AppAction>
    );
  };

  if (variant === 'hidden') {
    return null;
  }

  return (
    <div className="relative select-none">
      <DevIndicator componentName="CarouselSlide" />
      <div className="grid lg:grid-cols-2 items-center h-[42em] lg:h-[28em] bg-surface-dark rounded-2xl relative">
        {/* Right Image - First on mobile */}
        {image && (
          <div className="relative h-72 lg:h-[28em] order-1 lg:order-2">
            <Image
              src={fixImageUrl(image.url)}
              alt={image.alt || 'Carousel image'}
              width={image.width || 800}
              height={image.height || 600}
              className="w-full h-full rounded-t-lg lg:rounded-r-lg lg:rounded-l-none object-cover"
            />
          </div>
        )}

        {/* Left Content - Second on mobile */}
        <div className="flex-1 space-y-6 px-8 pt-10 pb-12 lg:px-12 lg:py-16 order-2 lg:order-1 min-w-0">
          {/* Tags */}
          <TagList tags={tags} size="sm" className="justify-start gap-2" />

          {/* Subheadline */}
          {subheadline && (
            <Heading variant="card-title" as="h3">
              {subheadline}
            </Heading>
          )}

          {/* Content */}
          {content && (
            <RichText
              data={content}
              converters={cardConverter}
              className="grid gap-3"
            />
          )}

          {/* Call to Action */}
          <div className="w-full mt-8">{link && renderActionButton(link)}</div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide;
