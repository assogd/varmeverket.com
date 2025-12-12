'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

interface AvatarProps {
  user?: {
    name?: string;
    email?: string;
  };
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Get user initials from name
 * Pure function - extracts initials from a name string
 * Always returns 1-2 characters:
 * - For names with 2+ words: First letter of first word + first letter of last word
 *   Example: "Mathias Dag Lindahl" -> "ML"
 * - For single word with 2+ chars: First 2 letters
 *   Example: "John" -> "JO"
 * - For single word with 1 char: That single letter
 *   Example: "A" -> "A"
 */
const getInitials = (name: string): string => {
  try {
    if (!name || typeof name !== 'string') {
      return 'U';
    }

    // Remove any non-letter characters and split by whitespace
    const cleanName = name.trim().replace(/[^a-zA-ZåäöÅÄÖ\s]/g, '');
    if (!cleanName || cleanName.length === 0) {
      return 'U';
    }

    const parts = cleanName
      .split(/\s+/)
      .filter(part => part && part.length > 0);

    // Multiple words: take first letter of first word + first letter of last word
    // Example: "Mathias Dag Lindahl" -> "ML"
    if (parts.length >= 2) {
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];
      const first = firstPart?.[0]?.toUpperCase() || '';
      const last = lastPart?.[0]?.toUpperCase() || '';

      // Prefer 2 characters (first + last initial)
      if (first && last) {
        return first + last;
      }
      // Fallback to single character if only one available
      if (first) {
        return first;
      }
      return 'U';
    }

    // Single word: take first 2 letters if available, otherwise first 1 letter
    // Example: "John" -> "JO", "A" -> "A"
    if (cleanName.length >= 2) {
      return cleanName.substring(0, 2).toUpperCase();
    }
    if (cleanName.length === 1) {
      return cleanName[0].toUpperCase();
    }
    return 'U';
  } catch (error) {
    console.warn('Error getting initials:', error);
    return 'U';
  }
};

/**
 * Avatar component - displays user profile image or initials fallback
 */
export const Avatar: React.FC<AvatarProps> = ({
  user,
  profileImageUrl,
  size = 'md',
  className,
}) => {
  // Memoize user initials - only recalculate when user.name or user.email changes
  const userInitials = React.useMemo(() => {
    try {
      if (user?.name && typeof user.name === 'string') {
        return getInitials(user.name);
      }
      if (
        user?.email &&
        typeof user.email === 'string' &&
        user.email.length > 0
      ) {
        const firstChar = user.email[0];
        // Only use alphanumeric characters
        if (firstChar && /[a-zA-Z0-9]/.test(firstChar)) {
          return firstChar.toUpperCase();
        }
      }
      return 'U';
    } catch (error) {
      console.warn('Error rendering user initials:', error);
      return 'U';
    }
  }, [user?.name, user?.email]);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const baseClasses = clsx(
    'rounded-md overflow-hidden flex items-center justify-center',
    'bg-black text-white dark:bg-transparent',
    sizeClasses[size],
    className
  );

  // If profile image is provided, use it
  if (profileImageUrl) {
    return (
      <div className={baseClasses}>
        <Image
          src={profileImageUrl}
          alt={user?.name || 'User'}
          width={
            size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64
          }
          height={
            size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64
          }
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise, show initials
  return <div className={baseClasses}>{userInitials}</div>;
};

export default Avatar;
