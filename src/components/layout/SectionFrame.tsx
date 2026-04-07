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
      ? 'w-full max-w-2xl mx-auto sm:border-r sm:border-l border-text px-0 sm:px-10 py-6 sm:py-8'
      : 'w-full max-w-2xl mx-auto sm:border-r sm:border-l border-text px-0 sm:px-12 pt-8 sm:pt-12 sm:pb-12 my-2';

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
      return (
        <div className={clsx('font-mono mt-6 max-w-2xl mx-auto')}>
          {description}
        </div>
      );
    }
    return description;
  };

  return (
    <section
      className={clsx('space-y-3 sm:border-b last:border-b-0 pb-2 border-text')}
    >
      {hasHeader && (
        <div className={clsx('sm:pb-6 text-center')}>
          {renderTitle()}
          {renderDescription()}
        </div>
      )}
      <hr className="hidden sm:block" />
      <div className={clsx(bodyClasses)}>{children}</div>
    </section>
  );
};
