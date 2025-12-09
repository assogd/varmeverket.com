import clsx from 'clsx';

export const getInputClasses = (error?: string): string => {
  const baseClasses =
    'w-full px-4 py-4 border bg-bg text-text font-sans rounded focus:outline-none focus:border-1 transition-colors placeholder:text-[rgba(0,0,0,.5)] dark:placeholder:text-[rgba(255,255,255,.5)]';
  const errorClasses = error
    ? 'border-red-500 focus:border-red-500'
    : 'border-text focus:border-text';

  return clsx(baseClasses, errorClasses);
};

export const getCheckboxClasses = (): string => {
  return 'mt-1 w-5 h-5 border border-text bg-bg text-text rounded focus:ring-2 focus:ring-text';
};
