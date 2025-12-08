import React from 'react';

interface PageHeaderLabelProps {
  children: React.ReactNode;
}

export function PageHeaderLabel({ children, ...props }: PageHeaderLabelProps) {
  return (
    <div className="font-sans uppercase m-4 tracking-wide">{children}</div>
  );
}
