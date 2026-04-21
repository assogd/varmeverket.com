import React from 'react';

interface PageHeaderLabelProps {
  children: React.ReactNode;
}

export function PageHeaderLabel({ children }: PageHeaderLabelProps) {
  return (
    <div className="font-sans uppercase mt-4 mb-8 tracking-wide">
      {children}
    </div>
  );
}
