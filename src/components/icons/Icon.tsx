import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export interface BaseIconProps extends IconProps {
  children: React.ReactNode;
  viewBox: string;
}

export const Icon: React.FC<BaseIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  style,
  children,
  viewBox,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color, ...style }}
    >
      {children}
    </svg>
  );
};
