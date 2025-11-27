'use client';
import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { FadeIn } from '@/components/ui';
import { AppAction } from '@/components/ui';
import { TagList } from '@/components/ui';
import { Heading } from '@/components/headings';
import Image from 'next/image';
import { fixImageUrl } from '@/utils/imageUrl';
import { NavigationItem } from './types';

interface ViewportItemProps {
  item: NavigationItem;
  index: number;
  isActive: boolean;
  isViewportCovered: boolean;
  onInView: (index: number) => void;
}

export const ViewportItem: React.FC<ViewportItemProps> = ({
  item,
  index,
  isActive,
  isViewportCovered,
  onInView,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: 0.5,
    margin: '-20% 0px -20% 0px',
  });

  React.useEffect(() => {
    if (isInView) {
      onInView(index);
    }
  }, [isInView, index, onInView]);

  return (
    <div ref={ref} className="h-screen">
      {isActive && isViewportCovered && (
        <FadeIn
          timing="fast"
          delay={0.1}
          className="fixed inset-0 flex items-center justify-center p-2 lg:p-8 pl-12 lg:pl-8"
        >
          <div className="max-w-lg grid gap-4 text-center justify-items-center bg-accent p-8 pb-16">
            {/* Featured Image */}
            {item.image && (
              <Image
                src={fixImageUrl(item.image.url)}
                alt={item.image.alt || item.title}
                width={216}
                height={216}
                className="rounded-md w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 object-contain"
              />
            )}

            {/* Tags */}
            <TagList tags={item.tags} size="md" className="mt-2" />

            {/* Title */}
            <Heading variant="subsection" as="h3">
              {item.title}
            </Heading>

            {/* Content */}
            {item.body && (
              <div className="mb-6 font-mono">
                <RichText data={item.body} />
              </div>
            )}

            {/* Call to Action */}
            {item.link?.text && (
              <AppAction
                href={
                  item.link?.type === 'external' && item.link?.url
                    ? item.link.url
                    : item.link?.type === 'internal' && item.link?.reference
                      ? typeof item.link.reference === 'object' &&
                        item.link.reference?.slug
                        ? `/${item.link.reference?.slug}`
                        : `/${item.link.reference}`
                      : undefined
                }
                variant="primary"
                target={item.link?.type === 'external' ? '_blank' : undefined}
                rel={
                  item.link?.type === 'external'
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {item.link.text}
              </AppAction>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
};
