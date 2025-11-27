'use client';

import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import {
  TextOnlyCard,
  CompactCard,
  MediumCard,
  LargeCard,
} from '@/components/ui';

interface UserCardBlockProps {
  variant: 'textOnly' | 'compactCard' | 'mediumCard' | 'largeCard';
  user: Record<string, unknown> | string | null;
}

export default function UserCardBlock({ variant, user }: UserCardBlockProps) {
  // Handle case where user is just an ID string (unpopulated relationship)
  if (typeof user === 'string') {
    return <UserCardBlockWithFetch variant={variant} userId={user} />;
  }

  // Handle loading state (user is null)
  if (user === null) {
    return renderCard(variant, null);
  }

  // Extract user data and render card
  const userData = extractUserData(user);
  return renderCard(variant, userData);
}

// Helper function to extract user data
function extractUserData(user: Record<string, unknown>) {
  const firstName = user.firstName as string | undefined;
  const lastName = user.lastName as string | undefined;
  const bylineDescription = user.bylineDescription as string | undefined;
  const profilePicture = user.profilePicture as
    | {
        url?: string;
        alt?: string;
        width?: number;
        height?: number;
      }
    | undefined;
  const tags = user.tags as
    | Array<{
        id: string;
        name: string;
      }>
    | undefined;

  return {
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    tags,
    profilePicture,
    bylineDescription,
  };
}

// Helper function to render the appropriate card
function renderCard(
  variant: string,
  userData: {
    fullName?: string;
    tags?: Array<{ id: string; name: string }>;
    profilePicture?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    bylineDescription?: string;
  } | null
) {
  const cardProps = userData
    ? {
        fullName: userData.fullName,
        tags: userData.tags,
        profilePicture: userData.profilePicture,
        ...(variant === 'largeCard' && {
          bylineDescription: userData.bylineDescription,
        }),
      }
    : { isLoading: true };

  const CardComponent =
    {
      textOnly: TextOnlyCard,
      compactCard: CompactCard,
      mediumCard: MediumCard,
      largeCard: LargeCard,
    }[variant] || TextOnlyCard;

  return <CardComponent {...cardProps} />;
}

/**
 * Client-side component that fetches user data
 */
function UserCardBlockWithFetch({
  variant,
  userId,
}: {
  variant: 'textOnly' | 'compactCard' | 'mediumCard' | 'largeCard';
  userId: string;
}) {
  const { user, loading, error } = useUserData(userId);

  // If error after retries, don't render anything (remove the block)
  if (error || (!loading && !user)) {
    return null;
  }

  // Show loading state that matches the card variant
  if (loading) {
    return <UserCardBlock variant={variant} user={null} />;
  }

  // Render with the fetched user data
  if (!user) return null;
  return (
    <UserCardBlock
      variant={variant}
      user={user as unknown as Record<string, unknown>}
    />
  );
}
