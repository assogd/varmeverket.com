import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const CloseIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 24 24">
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};
