import React from 'react';

export function convertHeadlineHyphenToEnDash(text: string): string {
  return text.replace(
    /(?<=\s)-(?=\s)|(?<=[A-Za-z0-9À-ÖØ-öø-ÿ])-(?=\s|[([{])|(?<=\)|\]|\}|\s)-(?=[A-Za-z0-9À-ÖØ-öø-ÿ])/g,
    '–'
  );
}

export function normalizeDisplayHeadlineNode(
  node: React.ReactNode
): React.ReactNode {
  if (typeof node === 'string') {
    return convertHeadlineHyphenToEnDash(node);
  }

  if (Array.isArray(node)) {
    return node.map(child => normalizeDisplayHeadlineNode(child));
  }

  if (!React.isValidElement(node)) {
    return node;
  }

  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  if (element.props.children == null) {
    return element;
  }

  return React.cloneElement(element, {
    children: normalizeDisplayHeadlineNode(element.props.children),
  });
}
