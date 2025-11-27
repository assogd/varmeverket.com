import React from 'react';
import Image from 'next/image';
import { DevIndicator } from '@/components/dev/DevIndicator';
import { TagList, SkeletonCircle, SkeletonText } from '@/components/ui';

interface MediumCardProps {
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

export function MediumCard({
  fullName,
  tags,
  profilePicture,
}: MediumCardProps) {
  return (
    <div className="grid gap-2 bg-surface text-center py-10 px-8 rounded-xl w-80">
      <DevIndicator componentName="UserCardBlock Md" />

      {/* Profile picture or skeleton */}
      {profilePicture?.url ? (
        <Image
          src={profilePicture.url}
          alt={profilePicture.alt || fullName}
          width={120}
          height={120}
          className="w-36 h-36 object-cover mx-auto rounded-md mb-4"
        />
      ) : (
        <div className="mb-4 animate-pulse">
          <SkeletonCircle size="w-36 h-36 mx-auto rounded-md" />
        </div>
      )}

      {/* Tags or skeleton */}
      {tags && tags.length > 0 ? (
        <TagList tags={tags} size="sm" />
      ) : (
        <div className="flex gap-1 justify-center mb-2 animate-pulse">
          <SkeletonText width="w-8" height="h-5" />
          <SkeletonText width="w-12" height="h-5" />
        </div>
      )}

      {/* Name or skeleton */}
      {fullName ? (
        <h3 className="font-display text-lg uppercase truncate">{fullName}</h3>
      ) : (
        <SkeletonText width="w-40 mx-auto" height="h-6" />
      )}
    </div>
  );
}
