import React from 'react';
import { IconProps } from '@/components/icons/Icon';

interface PlusIconProps extends IconProps {
  strokeWidth?: number;
}

export const PlusIcon: React.FC<PlusIconProps> = ({
  size = 14,
  className = '',
  strokeWidth = 1.8,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.11475 0L7.11475 14M0 6.88525H14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
      />
    </svg>
  );
};
