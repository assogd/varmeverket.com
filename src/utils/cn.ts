import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge class names
 * Uses clsx for conditional class handling
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
