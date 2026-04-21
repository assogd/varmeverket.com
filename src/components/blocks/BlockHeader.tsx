import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import clsx from 'clsx';
import { SectionHeading, Heading } from '@/components/headings';

interface BlockHeaderProps {
  headline?: string;
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
  className?: string;
  headlineClassName?: string;
  descriptionClassName?: string;
  /** Match FAQBlock headline: Heading content-h2. Default section = SectionHeading (ListBlock etc.) */
  headlineVariant?: 'section' | 'content-h2';
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
  headline,
  description,
  className = '',
  headlineClassName,
  descriptionClassName,
  headlineVariant = 'section',
}) => {
  if (!headline && !description) {
    return null;
  }

  return (
    <header className={className}>
      {headline &&
        (headlineVariant === 'content-h2' ? (
          <Heading
            variant="content-h2"
            as="h2"
            className={clsx(
              'mb-4 px-2 text-center',
              !description && 'mb-8',
              headlineClassName
            )}
          >
            {headline}
          </Heading>
        ) : (
          <SectionHeading
            className={clsx(
              'text-center',
              !description ? 'mb-8' : 'mb-3',
              headlineClassName
            )}
          >
            {headline}
          </SectionHeading>
        ))}
      {description && (
        <div
          className={clsx(
            'font-mono text-center px-2 sm:px-4 md:px-8 max-w-6xl mx-auto mb-4', // Default styles
            descriptionClassName // Additional custom styles
          )}
        >
          <RichText data={description as never} className="grid gap-3" />
        </div>
      )}
    </header>
  );
};
