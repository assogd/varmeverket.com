/**
 * Validate that rich text content doesn't contain H1 headings
 * @param value - The rich text value to validate
 * @returns true if valid, error message if invalid
 */
export const validateNoH1Headings = (value: unknown): true | string => {
  if (value && typeof value === 'object' && value !== null && 'root' in value) {
    const richTextValue = value as {
      root: { children: Array<{ type: string; tag: string }> };
    };
    if (richTextValue.root && richTextValue.root.children) {
      const hasH1 = richTextValue.root.children.some(
        child => child.type === 'heading' && child.tag === 'h1'
      );
      if (hasH1) {
        return 'H1-rubriker är inte tillåtna. Vänligen använd H2 eller lägre.';
      }
    }
  }
  return true;
};

/**
 * Validate that a field is not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field for error message
 * @returns true if valid, error message if invalid
 */
export const validateRequired = (
  value: unknown,
  fieldName: string = 'Detta fält'
): true | string => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} är obligatoriskt.`;
  }
  return true;
};

/**
 * Validate email format
 * @param value - The email value to validate
 * @returns true if valid, error message if invalid
 */
export const validateEmail = (value: string): true | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Vänligen ange en giltig e-postadress.';
  }
  return true;
};

/**
 * Validate URL format
 * @param value - The URL value to validate
 * @returns true if valid, error message if invalid
 */
export const validateUrl = (value: string): true | string => {
  try {
    new URL(value);
    return true;
  } catch {
    return 'Vänligen ange en giltig URL.';
  }
};
