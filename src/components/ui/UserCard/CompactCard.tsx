import React from 'react';
import Image from 'next/image';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { TagList, SkeletonCircle, SkeletonText } from '@/components/ui';

interface CompactCardProps {
  fullName?: string;
  tags?: Array<{ id: string; name: string }>;
  profilePicture?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  isLoading?: boolean;
}

export function CompactCard({
  fullName,
  tags,
  profilePicture,
  isLoading = false,
}: CompactCardProps) {
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="bg-surface w-72 p-4 flex justify-center gap-3 rounded-xl">
        <DevIndicator componentName="UserCardBlock Sm" />
        <div className="animate-pulse flex items-center gap-3">
          <SkeletonCircle size="w-15 h-15" />
          <div className="flex-1 min-w-0 flex gap-1 flex-col justify-center">
            <SkeletonText width="w-32" height="h-4" />
            <div className="flex gap-1">
              <SkeletonText width="w-8" height="h-5" />
              <SkeletonText width="w-12" height="h-5" />
            </div>
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
    <div className="bg-surface w-72 p-4 flex justify-center gap-3 rounded-xl">
      <DevIndicator componentName="UserCardBlock Sm" />
      {profilePicture?.url && (
        <Image
          src={profilePicture.url}
          alt={profilePicture.alt || fullName}
          width={60}
          height={60}
          className="w-15 h-15 object-cover rounded-md"
        />
      )}
      <div className="flex-1 min-w-0 flex gap-1 flex-col justify-center">
        <h3 className="text-base whitespace-nowrap truncate">{fullName}</h3>
        <TagList tags={tags} size="sm" className="justify-start gap-1" />
      </div>
    </div>
  );
}
