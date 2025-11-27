import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const MuteIcon: React.FC<IconProps> = ({
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
      <line
        x1="23"
        y1="9"
        x2="17"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="17"
        y1="9"
        x2="23"
        y2="15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};
