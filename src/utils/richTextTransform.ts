/**
 * Utility functions for transforming rich text data
 */

/**
 * Removes trailing empty paragraphs and line breaks from rich text data
 * This cleans up content that has trailing <br> tags or empty paragraphs
 */
export function removeTrailingBreaks(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('root' in data)) {
    return data;
  }

  const dataObj = data as { root: { children?: unknown[] } };
  if (!dataObj.root || !dataObj.root.children) {
    return data;
  }

  const transformedData = JSON.parse(JSON.stringify(data)); // Deep clone
  const children = (transformedData as { root: { children: unknown[] } }).root.children;

  if (!Array.isArray(children) || children.length === 0) {
    return transformedData;
  }

  // Remove trailing empty paragraphs
  while (children.length > 0) {
    const lastChild = children[children.length - 1];
    
    // Check if it's an empty paragraph
    if (
      typeof lastChild === 'object' &&
      lastChild !== null &&
      'type' in lastChild &&
      (lastChild as { type: string }).type === 'paragraph'
    ) {
      const paragraph = lastChild as {
        type: string;
        children?: Array<{ text?: string; type?: string }>;
      };
      
      // Check if paragraph is empty (no children or only empty text nodes)
      const isEmpty =
        !paragraph.children ||
        paragraph.children.length === 0 ||
        paragraph.children.every(
          child =>
            !child.text || child.text.trim() === '' || child.text === '\n'
        );
      
      if (isEmpty) {
        children.pop();
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return transformedData;
}

/**
 * Transforms rich text data to fix internal link URLs
 * This ensures that internal links in Lexical rich text are properly resolved
 */
export function transformRichTextLinks(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('root' in data)) {
    return data;
  }

  const dataObj = data as { root: { children?: unknown[] } };
  if (!dataObj.root || !dataObj.root.children) {
    return data;
  }

  const transformedData = JSON.parse(JSON.stringify(data)); // Deep clone

  const transformNode = (node: unknown) => {
    if (
      typeof node === 'object' &&
      node !== null &&
      'type' in node &&
      'fields' in node
    ) {
      const nodeObj = node as { type: string; fields: unknown };
      if (
        nodeObj.type === 'link' &&
        typeof nodeObj.fields === 'object' &&
        nodeObj.fields !== null
      ) {
        const fields = nodeObj.fields as { type?: string; doc?: unknown };
        const { type, doc } = fields;

        if (
          type === 'internal' &&
          doc &&
          typeof doc === 'object' &&
          doc !== null
        ) {
          const docObj = doc as {
            value?: { slug?: string; relationTo?: string };
            relationTo?: string;
          };

          // Check if relationTo is at the top level or inside value
          const relationTo = docObj.relationTo || docObj.value?.relationTo;
          const slug = docObj.value?.slug;

          if (slug) {
            // Fix the URL for internal links
            let correctUrl = '#';
            if (relationTo === 'spaces') {
              correctUrl = `/spaces/${slug}`;
            } else if (relationTo === 'articles') {
              correctUrl = `/artikel/${slug}`;
            } else {
              correctUrl = `/${slug}`;
            }

            // Update the URL field
            (nodeObj.fields as { url: string }).url = correctUrl;
          }
        }
      }
    }

    // Recursively transform children
    if (typeof node === 'object' && node !== null && 'children' in node) {
      const nodeWithChildren = node as { children: unknown[] };
      if (Array.isArray(nodeWithChildren.children)) {
        nodeWithChildren.children.forEach(transformNode);
      }
    }
  };

  const transformedDataObj = transformedData as {
    root: { children: unknown[] };
  };
  transformedDataObj.root.children.forEach(transformNode);
  return transformedData;
}
