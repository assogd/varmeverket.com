import React from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import clsx from 'clsx';
import { SectionHeading } from '@/components/headings';

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
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
  headline,
  description,
  className = '',
  headlineClassName,
  descriptionClassName,
}) => {
  if (!headline && !description) {
    return null;
  }

  return (
    <header className={className}>
      {headline && (
        <SectionHeading
          className={clsx(
            'text-center', // Default styles
            !description ? 'mb-8' : 'mb-3',
            headlineClassName // Additional custom styles
          )}
        >
          {headline}
        </SectionHeading>
      )}
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
