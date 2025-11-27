import React from 'react';

// Base skeleton component
export const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`bg-gray-300 rounded animate-pulse ${className}`}></div>
);

// Circle skeleton for avatars, images, etc.
export const SkeletonCircle = ({ size }: { size: string }) => (
  <SkeletonBox className={`${size} rounded-full`} />
);

// Text skeleton for titles, descriptions, etc.
export const SkeletonText = ({
  width,
  height = 'h-3',
}: {
  width: string;
  height?: string;
}) => <SkeletonBox className={`${height} ${width}`} />;

// Card skeleton for entire cards
export const SkeletonCard = ({ className }: { className: string }) => (
  <SkeletonBox className={`bg-surface ${className}`} />
);
