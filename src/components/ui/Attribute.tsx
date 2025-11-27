import React from 'react';
import { clsx } from 'clsx';
import { CapacityIcon, AreaIcon } from '@/components/icons';

interface AttributeProps {
  type:
    | 'capacity'
    | 'area'
    | 'height'
    | 'width'
    | 'length'
    | 'temperature'
    | 'lighting'
    | 'sound'
    | 'accessibility'
    | 'custom';
  value: string | number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-sm px-[.3em] pt-[0.2em] pb-[.075em]',
  md: 'text-sm px-[.3em] pt-[0.2em] pb-[.075em]',
  lg: 'text-sm px-[.3em] pt-[0.2em] pb-[.075em]',
};

const iconMap = {
  capacity: CapacityIcon,
  area: AreaIcon,
  height: null,
  width: null,
  length: null,
  temperature: null,
  lighting: null,
  sound: null,
  accessibility: null,
  custom: null,
};

const Attribute: React.FC<AttributeProps> = ({
  type,
  value,
  unit,
  size = 'md',
}) => {
  const IconComponent = iconMap[type];
  const displayValue = unit ? `${value}${unit}` : value;
  const sizeClass = sizeClasses[size];
  const hasIcon = IconComponent !== null;

  return (
    <div
      className={`inline-flex items-center gap-1 bg-text rounded-sm text-bg uppercase font-sans mix-blend-screen ${sizeClass}`}
    >
      {hasIcon && (
        <IconComponent
          size={12}
          className={clsx(
            'text-bg ml-[.05em] -translate-y-[.025em]',
            type === 'area' && '-mr-[.1em]'
          )}
          color="currentColor"
        />
      )}
      <span>{displayValue}</span>
    </div>
  );
};

export default Attribute;
