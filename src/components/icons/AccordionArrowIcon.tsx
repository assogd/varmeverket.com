import React from 'react';
import { Icon, IconProps } from '@/components/icons/Icon';

export const AccordionArrowIcon: React.FC<IconProps> = ({
  size = 16,
  className = '',
  color = 'currentColor',
}) => {
  return (
    <Icon
      size={size}
      className={`${className} dark:scale-[.9] origin-center`}
      color={color}
      viewBox="0 0 16 11"
    >
      <path
        d="M14.12 0.55957L8 6.66624L1.88 0.55957L0 2.43957L8 10.4396L16 2.43957L14.12 0.55957Z"
        fill="currentColor"
      />
    </Icon>
  );
};
