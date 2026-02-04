import React from 'react';
import clsx from 'clsx';

interface SectionFrameProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export const SectionFrame: React.FC<SectionFrameProps> = ({
  title,
  description,
  children,
  variant = 'default',
}) => {
  const hasHeader = !!title || !!description;
  const bodyClasses =
    variant === 'compact'
      ? 'max-w-2xl mx-auto border-r border-l border-text px-10 py-8'
      : 'max-w-2xl mx-auto border-r border-l border-text p-12 my-2';

  const renderTitle = () => {
    if (!title) return null;
    if (typeof title === 'string' || typeof title === 'number') {
      return <h2 className={clsx('text-lg font-medium')}>{title}</h2>;
    }
    return title;
  };

  const renderDescription = () => {
    if (!description) return null;
    if (typeof description === 'string' || typeof description === 'number') {
      return <div className={clsx('font-mono mt-4')}>{description}</div>;
    }
    return description;
  };

  return (
    <section
      className={clsx('space-y-3 border-b last:border-b-0 pb-2 border-text')}
    >
      {hasHeader && (
        <div className={clsx('border-b border-text')}>
          <div className={clsx('pb-8 text-center')}>
            {renderTitle()}
            {renderDescription()}
          </div>
        </div>
      )}
      <div className={clsx(bodyClasses)}>{children}</div>
    </section>
  );
};
