import React from 'react';
import { cn } from '@/utils/cn';

interface PageHeaderLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeaderLabel({ children, className }: PageHeaderLabelProps) {
  return <div className={cn('hidden', className)}>{children}</div>;
}
