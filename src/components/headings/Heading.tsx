import React from 'react';
import { cn } from '@/utils/cn';

// Heading variants based on your current system
export type HeadingVariant =
  | 'page-title' // Main page titles (H1)
  | 'article-title' // Article titles (H1)
  | 'page-header' // Page header titles (H1) - matches globals.css
  | 'section' // Section headings (H2)
  | 'faq-title' // FAQ section titles (H2) - alternative styling
  | 'subsection' // Subsection headings (H3)
  | 'card-title' // Card/component titles (H3)
  | 'small-title' // Small titles (H4)
  | 'building-title' // Building-specific titles (H1-H3)
  | 'label'; // Labels (H5/H6)

export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface HeadingProps {
  children: React.ReactNode;
  variant?: HeadingVariant;
  size?: HeadingSize;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  center?: boolean;
}

// Default configurations for each variant
const variantConfig = {
  'page-header': {
    defaultAs: 'h1' as const,
    className:
      'font-display uppercase text-2xl leading-[0.95em] tracking-[-0.01em] px-4 pt-8 pb-2',
  },
  'space-header': {
    defaultAs: 'h1' as const,
    className:
      'text-2xl xl:text-3xl text-center font-ballPill hyphens-auto break-words text-white',
  },
  'article-title': {
    defaultAs: 'h1' as const,
    className:
      'font-display uppercase text-2xl leading-[0.95em] tracking-[-0.01em] px-4',
  },
  'article-h2': {
    defaultAs: 'h2' as const,
    className: 'px-4 font-display uppercase text-center text-xl mb-2 mt-4',
  },
  'article-h3': {
    defaultAs: 'h3' as const,
    className: 'px-4 font-sans text-center text-lg mt-4',
  },
  'article-h4': {
    defaultAs: 'h4' as const,
    className: 'px-4 mt-3 font-sans uppercase',
  },
  section: {
    defaultAs: 'h2' as const,
    className:
      'font-sans text-lg leading-[1em] tracking-[-0.01em] pt-8 first:pt-1',
  },
  'faq-title': {
    defaultAs: 'h2' as const,
    className:
      'font-display text-xl uppercase leading-[1em] tracking-[-0.01em]',
  },
  subsection: {
    defaultAs: 'h3' as const,
    className:
      'font-display uppercase text-lg leading-[1em] tracking-[0.005em]',
  },
  'card-title': {
    defaultAs: 'h3' as const,
    className:
      'font-display uppercase text-lg sm:text-[1.8em] leading-[1em] break-words tracking-[-0.01em]',
  },
  'small-title': {
    defaultAs: 'h4' as const,
    className: 'font-display uppercase text-md',
  },
  'small-card-title': {
    defaultAs: 'h4' as const,
    className:
      'font-mono uppercase pb-2 pt-2 [&:has(+_ul)]:border-b [&:has(+_ul)]:border-text',
  },
  'building-title': {
    defaultAs: 'h1' as const,
    className: 'font-ballPill text-3xl hyphens-auto break-words',
  },
  label: {
    defaultAs: 'h5' as const,
    className: 'font-mono uppercase text-sm px-4 pb-1',
  },
};

// Size configurations
const sizeConfig = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

export function Heading({
  children,
  variant = 'section',
  size,
  className,
  as,
  center = false,
}: HeadingProps) {
  const config = variantConfig[variant];
  const Component = as || config.defaultAs;

  const classes = cn(
    // Base styles
    size && sizeConfig[size],

    // Variant-specific styles
    config.className,

    // Conditional styles
    center && 'text-center',

    // Custom className
    className
  );

  return <Component className={classes}>{children}</Component>;
}

// Convenience components for common use cases
export const PageTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="page-title" {...props} />
);

export const ArticleTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="article-title" {...props} />
);

export const SectionHeading = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="section" {...props} />
);

export const SubsectionHeading = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="subsection" {...props} />
);

export const CardTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="card-title" {...props} />
);

export const SmallTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="small-title" {...props} />
);

export const BuildingTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="building-title" {...props} />
);

export const Label = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="label" {...props} />
);
