import React from 'react';
import clsx from 'clsx';

interface PageLayoutProps {
  children: React.ReactNode;
  contentType?: 'page' | 'article' | 'space' | 'showcase';
  paddingBottom?: boolean;
  className?: string;
}

export default function PageLayout({
  children,
  contentType,
  paddingBottom = true,
  className,
}: PageLayoutProps) {
  return (
    <div
      data-content-type={contentType}
      className={clsx(
        'min-h-screen grid gap-24',
        paddingBottom ? 'pb-36' : '',
        className
      )}
    >
      {children}
    </div>
  );
}
