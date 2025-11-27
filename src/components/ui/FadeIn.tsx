'use client';
import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import clsx from 'clsx';

export type FadeInVariant =
  | 'fade'
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scale'
  | 'scaleUp';

export type FadeInTiming = 'fast' | 'normal' | 'slow';

interface FadeInProps {
  children: React.ReactNode;
  variant?: FadeInVariant;
  timing?: FadeInTiming;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
  amount?: number;
  threshold?: number;
  // Custom motion props for advanced usage
  customMotionProps?: Partial<MotionProps>;
  // Allow style and ref to be passed through
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
  // Allow additional props to be passed through
  [key: string]: unknown;
}

const timingConfigs = {
  fast: { duration: 0.3, ease: 'easeOut' },
  normal: { duration: 0.5, ease: 'easeOut' },
  slow: { duration: 0.8, ease: 'easeOut' },
} as const;

const variantConfig = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
} as const;

/**
 * Reusable fade-in animation component with multiple variants and timing options
 *
 * @example
 * // Basic fade in
 * <FadeIn>
 *   <div>Content</div>
 * </FadeIn>
 *
 * @example
 * // Fade up with slow timing and delay
 * <FadeIn variant="fadeUp" timing="slow" delay={0.2}>
 *   <h1>Title</h1>
 * </FadeIn>
 *
 * @example
 * // Custom element with className
 * <FadeIn as="section" className="my-8" variant="scale">
 *   <div>Content</div>
 * </FadeIn>
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  variant = 'fade',
  timing = 'normal',
  delay = 0,
  className,
  as = 'div',
  once = true,
  amount = 0.1,
  threshold,
  customMotionProps,
  style,
  ref,
  ...restProps
}) => {
  const MotionComponent = motion[
    as as keyof typeof motion
  ] as React.ComponentType<Record<string, unknown>>;

  const animationConfig = variantConfig[variant];
  const timingConfig = timingConfigs[timing];

  const motionProps: MotionProps = {
    initial: animationConfig.initial,
    animate: animationConfig.animate,
    transition: {
      ...timingConfig,
      delay,
    },
    ...(once && {
      whileInView: animationConfig.animate,
      viewport: {
        once: true,
        amount,
        ...(threshold && { margin: `${threshold * 100}%` }),
      },
    }),
    ...customMotionProps,
  };

  return (
    <MotionComponent
      {...motionProps}
      {...restProps}
      className={clsx(className)}
      style={style}
      ref={ref}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * Pre-configured fade-in components for common use cases
 */
export const FadeInFast = (props: Omit<FadeInProps, 'timing'>) => (
  <FadeIn {...props} timing="fast" />
);

export const FadeInSlow = (props: Omit<FadeInProps, 'timing'>) => (
  <FadeIn {...props} timing="slow" />
);

export const FadeInUp = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="fadeUp" />
);

export const FadeInDown = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="fadeDown" />
);

export const FadeInLeft = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="fadeLeft" />
);

export const FadeInRight = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="fadeRight" />
);

export const FadeInScale = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="scale" />
);

export const FadeInScaleUp = (props: Omit<FadeInProps, 'variant'>) => (
  <FadeIn {...props} variant="scaleUp" />
);

export default FadeIn;
