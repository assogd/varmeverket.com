import React from 'react';
import clsx from 'clsx';

interface SectionFrameProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  headerInnerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bodyClassName?: string;
  withBodyFrame?: boolean;
}

export const SectionFrame: React.FC<SectionFrameProps> = ({
  title,
  description,
  children,
  className,
  headerClassName,
  headerInnerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  withBodyFrame = true,
}) => {
  const hasHeader = !!title || !!description;

  const renderTitle = () => {
    if (!title) return null;
    if (typeof title === 'string' || typeof title === 'number') {
      return (
        <h2 className={clsx('text-lg font-medium', titleClassName)}>{title}</h2>
      );
    }
    return <div className={titleClassName}>{title}</div>;
  };

  const renderDescription = () => {
    if (!description) return null;
    if (typeof description === 'string' || typeof description === 'number') {
      return <p className={descriptionClassName}>{description}</p>;
    }
    return <div className={descriptionClassName}>{description}</div>;
  };

  return (
    <section className={clsx('space-y-3', className)}>
      {hasHeader && (
        <div className={clsx('border-b border-text', headerClassName)}>
          <div className={clsx('pt-4 pb-8 text-center', headerInnerClassName)}>
            {renderTitle()}
            {renderDescription()}
          </div>
        </div>
      )}
      {children &&
        (withBodyFrame ? (
          <div
            className={clsx(
              'max-w-2xl mx-auto border-r border-l border-text p-12',
              bodyClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        ))}
    </section>
  );
};
