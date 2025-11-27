/* eslint-disable @typescript-eslint/no-explicit-any */
// Lexical node structures are dynamic and vary by block type
import React from 'react';

/**
 * Check if a paragraph is empty (no text content or only whitespace/breaks)
 */
export const isEmptyParagraph = (text: any): boolean => {
  return (
    !text ||
    (typeof text === 'string' && text.trim() === '') ||
    (React.isValidElement(text) && (text.props as any).children === '') ||
    (Array.isArray(text) &&
      text.every(
        child =>
          !child ||
          (typeof child === 'string' && child.trim() === '') ||
          (React.isValidElement(child) && (child.props as any).children === '')
      ))
  );
};
