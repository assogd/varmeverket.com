import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const LockIcon: React.FC<IconProps> = ({
  size = 22,
  className = '',
  color = 'white',
}) => {
  return (
    <Icon size={size} className={className} color={color} viewBox="0 0 24 24">
      <path
        d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C2.89543 10 2 10.8954 2 12V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V12C22 10.8954 21.1046 10 20 10H18M6 10H18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};

