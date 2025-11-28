'use client';
import React from 'react';
import Image from 'next/image';
import { fixImageUrl } from '@/utils/imageUrl';
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { AppAction } from '@/components/ui';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { routeLink, type LinkGroup } from '@/utils/linkRouter';
import { defaultConverter } from '@/utils/richTextConverters/index';
import clsx from 'clsx';

interface SpotlightBlockProps {
  headline?: string;
  subheadline?: string;
  description?: {
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
  image?: { url: string; alt?: string; width?: number; height?: number };
  link?: LinkGroup;
}

const SpotlightBlock: React.FC<SpotlightBlockProps> = ({
  headline,
  subheadline,
  description,
  image,
  link,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '0px' });
  const controls = useAnimation();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Image movement based on scroll progress
  const imageY = useTransform(scrollYProgress, [0.2, 0.7], ['0%', '-150%']);

  React.useEffect(() => {
    if (inView) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 1.2, ease: 'easeOut' },
      });
    }
  }, [inView, controls]);

  // Use standardized link routing
  const linkResult = link ? routeLink(link) : null;

  const isLandscape =
    image && image.width && image.height ? image.width >= image.height : true;
  const imageClass = isLandscape
    ? 'w-[20em] max-w-[50vw]'
    : 'w-[20em] md:w-[18em] max-w-[50vw]';

  return (
    <section
      ref={ref}
      className={clsx(
        'relative grid gap-8 px-4 text-center',
        image?.url ? 'h-[250vh]' : ''
      )}
    >
      <DevIndicator componentName="SpotlightBlock" />
      <div
        className={clsx(
          'flex flex-col gap-6',
          image?.url &&
            'sticky top-0 inset-x-0 h-screen justify-center items-center'
        )}
      >
        <div className="pt-8 mx-auto grid max-w-8xl px-2 sm:px-4">
          {headline ? (
            <div className="h2-style uppercase">{headline}</div>
          ) : null}
          {subheadline && (
            <div className="h2-style max-w-8xl">{subheadline}</div>
          )}
        </div>
        <div className="font-mono max-w-6xl mx-auto mt-2">
          {typeof description === 'string' || description == null ? (
            <div className="whitespace-pre-line">{description}</div>
          ) : (
            <RichText
              data={description}
              converters={defaultConverter}
              className="grid gap-3"
            />
          )}
        </div>
        <div className="pb-8">
          {linkResult?.href && link?.text ? (
            <AppAction href={linkResult.href} variant="outline">
              {link.text}
            </AppAction>
          ) : null}
        </div>
        {image?.url ? (
          <div className="absolute top-1/2 translate-y-[calc(-50%-2em)] pointer-events-none">
            <motion.div style={{ y: imageY }}>
              <Image
                src={fixImageUrl(image.url)}
                alt={image.alt || ''}
                width={image.width || 320}
                height={image.height || 240}
                className={clsx(imageClass, 'rounded-sm object-contain')}
                priority
              />
            </motion.div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SpotlightBlock;
