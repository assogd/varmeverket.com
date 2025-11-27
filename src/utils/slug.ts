/**
 * Generate a URL-friendly slug from a title or string
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (title: string): string => {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

/**
 * Payload CMS hook for auto-generating slugs from titles
 * @param data - The document data
 * @param operation - The operation being performed
 * @returns Modified data with generated slug
 */
export const slugFromTitleHook = ({
  data,
  operation,
}: {
  data: Record<string, unknown>;
  operation: string;
}) => {
  if (data?.title) {
    // Always generate slug from title for new documents
    // For updates, only generate if slug is empty or if title changed significantly
    if (operation === 'create' || !data.slug) {
      data.slug = generateSlug(data.title);
    }
  }
  return data;
};
