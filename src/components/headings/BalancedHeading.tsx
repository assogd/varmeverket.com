'use client';

import React, { useMemo } from 'react';
import {
  extractTextFromNode,
  breakTextIntoLines,
} from '@/utils/textLineBreaker';
import { Heading, type HeadingProps } from './Heading';

interface BalancedHeadingProps extends Omit<HeadingProps, 'children'> {
  children: React.ReactNode;
  charsPerLine?: number;
}

/**
 * Heading component that intelligently breaks text into evenly distributed lines
 */
export function BalancedHeading({
  children,
  charsPerLine = 24,
  ...headingProps
}: BalancedHeadingProps) {
  const balancedText = useMemo(() => {
    // Extract plain text from children
    const text = extractTextFromNode(children);

    // If no text extracted, return children as-is
    if (!text.trim()) {
      return children;
    }

    // Break text into lines
    const brokenText = breakTextIntoLines(text, charsPerLine);

    // If no line breaks were added (text fits on one line), return as-is
    if (!brokenText.includes('\n')) {
      return children;
    }

    // Split by line breaks and wrap each line
    const lines = brokenText.split('\n');

    return (
      <>
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  }, [children, charsPerLine]);

  return <Heading {...headingProps}>{balancedText}</Heading>;
}
