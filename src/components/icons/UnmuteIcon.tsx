import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const UnmuteIcon: React.FC<IconProps> = ({
  size = 20,
  className = '',
  color = 'white',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 24 24">
      <polygon
        points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Icon>
  );
};
