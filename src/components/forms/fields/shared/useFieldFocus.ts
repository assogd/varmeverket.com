import { useState } from 'react';

/**
 * Hook to track focus state for form fields
 * @param onBlurCallback - Optional callback to call when field loses focus
 */
export const useFieldFocus = (onBlurCallback?: () => void) => {
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => {
    setFocused(false);
    onBlurCallback?.();
  };

  return { focused, onFocus, onBlur };
};
