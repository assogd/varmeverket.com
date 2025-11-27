import React from 'react';
import Image from 'next/image';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { TagList, SkeletonCircle, SkeletonText } from '@/components/ui';

interface LargeCardProps {
  fullName?: string;
  tags?: Array<{ id: string; name: string }>;
  profilePicture?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  bylineDescription?: string;
  isLoading?: boolean;
}

export function LargeCard({
  fullName,
  tags,
  profilePicture,
  bylineDescription,
  isLoading = false,
}: LargeCardProps) {
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="grid gap-2 bg-surface text-center py-10 px-8 rounded-xl w-80">
        <DevIndicator componentName="UserCardBlock Lg" />
        <div className="animate-pulse">
          <div className="mb-4">
            <SkeletonCircle size="w-36 h-36 mx-auto rounded-md" />
          </div>
          <div className="flex gap-1 justify-center mb-2">
            <SkeletonText width="w-8" height="h-5" />
            <SkeletonText width="w-12" height="h-5" />
          </div>
          <SkeletonText width="w-40 mx-auto" height="h-6" />
          <SkeletonText width="w-48 mx-auto" height="h-4" />
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
    <div className="grid gap-2 bg-surface text-center py-10 px-8 rounded-xl w-80">
      <DevIndicator componentName="UserCardBlock Lg" />
      {profilePicture?.url && (
        <Image
          src={profilePicture.url}
          alt={profilePicture.alt || fullName}
          width={120}
          height={120}
          className="w-36 h-36 object-cover mx-auto rounded-md mb-4"
        />
      )}
      <TagList tags={tags} size="sm" />
      <h3 className="font-display text-lg uppercase">{fullName}</h3>
      {bylineDescription && (
        <p className="font-mono mt-2 hyphens-auto">{bylineDescription}</p>
      )}
    </div>
  );
}
