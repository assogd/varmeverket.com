import React from 'react';
import { Tag } from '@/components/ui';
import clsx from 'clsx';

interface TagType {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TagListProps {
  tags?: TagType[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  size = 'md',
  className,
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={clsx('flex flex-wrap justify-center gap-0.5', className)}>
      {tags.map((tag, index) => (
        <Tag key={tag.id || index} name={tag.name} size={size} />
      ))}
    </div>
  );
};

export default TagList;
