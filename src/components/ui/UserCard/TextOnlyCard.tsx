import React from 'react';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { TagList, SkeletonText } from '@/components/ui';

interface TextOnlyCardProps {
  fullName?: string;
  tags?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function TextOnlyCard({
  fullName,
  tags,
  isLoading = false,
}: TextOnlyCardProps) {
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="bg-surface w-72 text-center p-4 flex flex-col justify-center gap-2 rounded-xl">
        <DevIndicator componentName="UserCardBlock Text" />
        <div className="animate-pulse">
          <SkeletonText width="w-32" height="h-4" />
          <div className="flex gap-1 justify-center">
            <SkeletonText width="w-12" height="h-5" />
            <SkeletonText width="w-16" height="h-5" />
          </div>
        </div>
      </div>
    );
  }

  // If no data, don't render anything
  if (!fullName) {
    return null;
  }

  // Render the actual card
  return (
    <div className="bg-surface w-72 text-center p-4 flex flex-col justify-center gap-2 rounded-xl">
      <DevIndicator componentName="UserCardBlock Text" />
      <h3 className="text-md whitespace-nowrap truncate">{fullName}</h3>
      <TagList tags={tags} size="sm" />
    </div>
  );
}
