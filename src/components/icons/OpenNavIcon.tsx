import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const OpenNavIcon: React.FC<IconProps> = ({
  size = 22,
  className = '',
  color = 'white',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 22 14">
      <path
        d="M2 2H20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M2 12H20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </Icon>
  );
};
