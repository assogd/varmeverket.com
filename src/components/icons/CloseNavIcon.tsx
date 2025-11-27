import React from 'react';
import { Icon, type IconProps } from '@/components/icons/Icon';

export const CloseNavIcon: React.FC<IconProps> = ({
  size = 18,
  className = '',
  color = 'currentColor',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 18 17">
      <path
        d="M2.57104 15.1965L15.299 2.46861M2.70104 2.46851L15.429 15.1964"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </Icon>
  );
};
