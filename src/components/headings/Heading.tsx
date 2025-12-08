import React from 'react';
import { cn } from '@/utils/cn';

// Heading variants - consolidated and organized by hierarchy
export type HeadingVariant =
  // H1 variants
  | 'page-header' // Main page/article titles (H1) - font-display, uppercase, text-2xl
  | 'space-header' // Space page headers (H1) - font-ballPill, centered, white text
  | 'building-title' // Building/hero titles (H1) - font-ballPill, text-3xl
  // H2 variants
  | 'section' // Standard section headings (H2) - font-sans, text-lg
  | 'content-h2' // Content section headings (H2) - font-display, uppercase, text-xl, centered
  // H3 variants
  | 'subsection' // Standard subsection headings (H3) - font-display, uppercase, text-lg
  | 'content-h3' // Content subsection headings (H3) - font-sans, text-lg, centered
  | 'card-title' // Card/component titles (H3) - font-display, uppercase, responsive
  // H4 variants
  | 'small-title' // Small titles (H4) - font-mono, uppercase
  | 'content-h4' // Content small titles (H4) - font-sans, uppercase
  // H5/H6 variants
  | 'label'; // Labels (H5/H6) - font-mono, uppercase, text-sm

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
  // H1 variants
  'page-header': {
    defaultAs: 'h1' as const,
    className:
      'font-display uppercase text-2xl leading-[0.95em] tracking-[-0.01em] px-4',
    // Note: Add pt-8 pb-2 for page headers, omit for article titles
  },
  'space-header': {
    defaultAs: 'h1' as const,
    className:
      'text-2xl xl:text-3xl text-center font-ballPill hyphens-auto break-words text-white',
  },
  'building-title': {
    defaultAs: 'h1' as const,
    className: 'font-ballPill text-3xl hyphens-auto break-words',
  },
  // H2 variants
  section: {
    defaultAs: 'h2' as const,
    className:
      'font-sans text-lg leading-[1em] tracking-[-0.01em] pt-8 first:pt-1',
  },
  'content-h2': {
    defaultAs: 'h2' as const,
    className:
      'font-display uppercase text-xl leading-[1.1em] tracking-[-0.01em]',
    // Note: Add px-4 text-center mb-2 mt-4 for centered content, omit for FAQ
  },
  // H3 variants
  subsection: {
    defaultAs: 'h3' as const,
    className:
      'font-display uppercase text-lg leading-[1.1em] tracking-[0.005em]',
  },
  'content-h3': {
    defaultAs: 'h3' as const,
    className: 'font-sans uppercase pt-2',
    // Note: Add px-4 text-center mt-4 for centered content
  },
  'card-title': {
    defaultAs: 'h3' as const,
    className:
      'font-display uppercase text-lg sm:text-[1.8em] leading-[1em] break-words tracking-[-0.01em]',
  },
  // H4 variants
  'small-title': {
    defaultAs: 'h4' as const,
    className: 'font-mono uppercase',
    // Note: Add pb-2 pt-2 [&:has(+_ul)]:border-b [&:has(+_ul)]:border-text for card titles
  },
  'content-h4': {
    defaultAs: 'h4' as const,
    className: 'font-sans uppercase',
    // Note: Add px-4 mt-3 for content spacing
  },
  // H5/H6 variants
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
export const PageTitle = (props: Omit<HeadingProps, 'variant'>) => {
  const { className, ...rest } = props;
  return (
    <Heading
      variant="page-header"
      {...rest}
      className={cn('pt-8 pb-2', className)}
    />
  );
};

export const ArticleTitle = (props: Omit<HeadingProps, 'variant'>) => (
  <Heading variant="page-header" {...props} />
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
