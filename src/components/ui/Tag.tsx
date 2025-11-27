import React from 'react';

interface TagProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'border border-current leading-4 text-xs px-1 py-0.25',
  md: 'border border-current leading-4 text-sm px-1.5 pt-0.5 pb-[.15em]',
  lg: 'border border-current leading-4 text-base px-2 pt-1 pb-[.15em]',
};

const emojiSizeClasses = {
  sm: 'text-xs px-1 py-0.5',
  md: 'text-sm h-full px-0.5 flex items-center justify-center',
  lg: 'text-base px-2 py-0.5',
};

// Function to check if a string contains only emojis
const isOnlyEmoji = (str: string): boolean => {
  // Check if str is defined and not null
  if (!str || typeof str !== 'string') return false;

  // Remove whitespace and check if the string contains only emoji characters
  const trimmed = str.trim();
  if (trimmed.length === 0) return false;

  // Unicode ranges for emojis and other symbols
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F0FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]$/u;

  return emojiRegex.test(trimmed);
};

const Tag: React.FC<TagProps> = ({ name, size = 'md' }) => {
  // Handle undefined or null name
  if (!name) return null;

  const isEmoji = isOnlyEmoji(name);
  const sizeClass = isEmoji ? emojiSizeClasses[size] : sizeClasses[size];

  return (
    <div className={`rounded-full whitespace-nowrap leading-4 ${sizeClass}`}>
      {name}
    </div>
  );
};

export default Tag;
