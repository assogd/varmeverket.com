import { useState } from 'react';

/**
 * Hook to track focus state for form fields
 */
export const useFieldFocus = () => {
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  return { focused, onFocus, onBlur };
};
