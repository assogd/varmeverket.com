import React, { cloneElement, isValidElement, Children } from 'react';
import { useBlinkHover } from '@/hooks/useBlinkHover';

interface BlinkHoverProps {
  children: React.ReactNode;
  interval?: number;
  enabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  target?: string; // CSS selector to target specific child element
  [key: string]: unknown; // Allow other props to be passed through
}

export function BlinkHover({
  children,
  interval = 100,
  enabled = true,
  className = '',
  style = {},
  target,
  ...props
}: BlinkHoverProps) {
  const { isVisible, startBlinking, stopBlinking } = useBlinkHover({
    interval,
    enabled,
  });

  // If target is specified, clone children and add blinking props to matching elements
  if (target) {
    const cloneChildren = (children: React.ReactNode): React.ReactNode => {
      return Children.map(children, child => {
        if (isValidElement(child)) {
          const childElement = child as React.ReactElement<{
            className?: string;
            style?: React.CSSProperties;
            children?: React.ReactNode;
            [key: string]: unknown;
          }>;
          // Check if this child matches the target selector
          const childProps = childElement.props;
          const matchesTarget =
            (target === '.title' && childProps.className?.includes('title')) ||
            (target === '.number' &&
              childProps.className?.includes('number')) ||
            (target === '[data-blink-target]' &&
              childProps['data-blink-target']) ||
            target === childProps.className;

          if (matchesTarget) {
            return cloneElement(childElement, {
              ...childProps,
              style: {
                ...(childProps.style || {}),
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0ms',
              },
            });
          }

          // Recursively check nested children
          if (childProps.children) {
            return cloneElement(childElement, {
              ...childProps,
              children: cloneChildren(childProps.children),
            });
          }
        }
        return child;
      });
    };

    return (
      <div
        {...props}
        className={className}
        style={style}
        onMouseEnter={startBlinking}
        onMouseLeave={stopBlinking}
      >
        {cloneChildren(children)}
      </div>
    );
  }

  // Default behavior - blink the entire container
  return (
    <div
      {...props}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0ms',
      }}
      onMouseEnter={startBlinking}
      onMouseLeave={stopBlinking}
    >
      {children}
    </div>
  );
}
