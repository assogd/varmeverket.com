import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const CheckIcon: React.FC<IconProps> = ({
  size = 14,
  className = '',
  color = '#0C0C0C',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 14 12">
      <path
        d="M4.44913 8.94911L1.1302 5.52852L1.52588e-05 6.68512L4.44913 11.2705L14 1.42711L12.8778 0.270508L4.44913 8.94911Z"
        fill="currentColor"
      />
    </Icon>
  );
};
