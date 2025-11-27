import { slugFromTitleHook } from '@/utils/slug';
import { dateTrackingHook } from '@/utils/dates';

/**
 * Common collection hooks that can be reused across collections
 */
export const commonHooks = {
  /**
   * Hook for auto-generating slugs from titles
   */
  slugFromTitle: slugFromTitleHook,

  /**
   * Hook for tracking published and last modified dates
   */
  dateTracking: dateTrackingHook,

  /**
   * Hook for initializing nested arrays (useful for navigation items)
   */
  initializeNestedArrays: ({ data }: { data: Record<string, unknown> }) => {
    const initializeChildren = (items: Record<string, unknown>[]) => {
      if (!items) return;
      items.forEach(item => {
        if (!item.children) {
          item.children = [];
        }
        initializeChildren(item.children);
      });
    };

    if (data?.menuItems) {
      initializeChildren(data.menuItems);
    }
    return data;
  },
};

/**
 * Common versioning configuration for collections
 */
export const commonVersioning = {
  drafts: {
    autosave: {
      interval: 100, // Optimal for live preview
    },
    schedulePublish: true,
  },
  maxPerDoc: 50,
};

/**
 * Common access control for public collections
 */
export const publicAccess = {
  read: () => true,
  create: () => true,
  update: () => true,
  delete: () => true,
};
