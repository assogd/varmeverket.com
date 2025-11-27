/**
 * Get current timestamp as ISO string
 * @returns Current date as ISO string
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Payload CMS hook for setting published date on creation
 * @param data - The document data
 * @param operation - The operation being performed
 * @returns Modified data with published date
 */
export const setPublishedDateHook = ({
  data,
  operation,
}: {
  data: Record<string, unknown>;
  operation: string;
}) => {
  if (operation === 'create' && !data.publishedDate) {
    data.publishedDate = getCurrentTimestamp();
  }
  return data;
};

/**
 * Payload CMS hook for updating last modified date
 * @param data - The document data
 * @returns Modified data with updated last modified date
 */
export const updateLastModifiedHook = ({
  data,
}: {
  data: Record<string, unknown>;
}) => {
  data.lastModifiedDate = getCurrentTimestamp();
  return data;
};

/**
 * Combined hook for both published date and last modified date
 * @param data - The document data
 * @param operation - The operation being performed
 * @returns Modified data with both dates set
 */
export const dateTrackingHook = ({
  data,
  operation,
}: {
  data: Record<string, unknown>;
  operation: string;
}) => {
  // Set published date on creation if not provided
  if (operation === 'create' && !data.publishedDate) {
    data.publishedDate = getCurrentTimestamp();
  }

  // Always update last modified date
  data.lastModifiedDate = getCurrentTimestamp();

  return data;
};
