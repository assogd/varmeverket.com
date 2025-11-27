import { useTheme as useNextTheme } from 'next-themes';

/**
 * Hook to access theme state and controls
 * @returns Theme context with theme, resolvedTheme, setTheme, and systemTheme
 */
export const useTheme = useNextTheme;

/**
 * Hook to check if current theme is dark
 * @returns boolean indicating if dark mode is active
 */
export const useIsDark = (): boolean => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark';
};

/**
 * Hook to get theme-aware classes
 * @param lightClasses - Classes to apply in light mode
 * @param darkClasses - Classes to apply in dark mode
 * @returns Combined classes based on current theme
 */
export const useThemeClasses = (
  lightClasses: string,
  darkClasses: string
): string => {
  const isDark = useIsDark();
  return isDark ? darkClasses : lightClasses;
};
