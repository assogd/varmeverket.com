import React from 'react';
import clsx from 'clsx';

interface FieldLabelProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  focused?: boolean;
  className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  id,
  label,
  required = false,
  error,
  focused = false,
  className = '',
}) => {
  const labelClasses = clsx(
    'relative block mb-2 mx-1 font-sans transition-colors text-text',
    className
  );

  return (
    <label htmlFor={id} className={labelClasses}>
      {label}
      {required && (
        <div className="mr-1 absolute right-0 top-0">
          <span
            className={clsx(
              'absolute right-0 top-[.3em] text-[1.5rem] leading-[1rem] transition-all duration-200',
              {
                'right-[3.75em]': error,
              }
            )}
          >
            *
          </span>
          <span
            className={clsx('transition-all duration-200', {
              'opacity-0 pointer-events-none': !error,
              'opacity-100 delay-200': error,
            })}
          >
            Obligatorisk
          </span>
        </div>
      )}
    </label>
  );
};
