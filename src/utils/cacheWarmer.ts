/**
 * Cache warming utilities
 * Pre-populates cache with frequently accessed data
 */

import { PayloadAPI } from '@/lib/api';

interface WarmupConfig {
  pages: string[];
  collections: string[];
  priority: 'high' | 'medium' | 'low';
}

class CacheWarmer {
  private isWarming = false;
  private warmupQueue: Array<() => Promise<void>> = [];

  /**
   * Warm up cache with essential data
   */
  async warmup(config: WarmupConfig): Promise<void> {
    if (this.isWarming) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cache warming already in progress');
      }
      return;
    }

    this.isWarming = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔥 Starting cache warming...');
    }

    try {
      // High priority: Homepage and navigation
      if (config.priority === 'high' || config.priority === 'medium') {
        await this.warmupHomepage();
        await this.warmupNavigation();
      }

      // Medium priority: Common pages
      if (config.priority === 'high' || config.priority === 'medium') {
        await this.warmupPages(config.pages);
      }

      // Low priority: Collections
      if (config.priority === 'high') {
        await this.warmupCollections(config.collections);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cache warming completed');
      }
    } catch (error) {
      // Always log errors, even in production
      console.error('❌ Cache warming failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm up homepage data
   */
  private async warmupHomepage(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('  📄 Warming homepage...');
      }
      await PayloadAPI.findBySlug('pages', 'hem', 10);
      if (process.env.NODE_ENV === 'development') {
        console.log('  ✅ Homepage warmed');
      }
    } catch (error) {
      console.error('  ❌ Homepage warming failed:', error);
    }
  }

  /**
   * Warm up navigation data
   */
  private async warmupNavigation(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('  🧭 Warming navigation...');
      }
      await PayloadAPI.find({
        collection: 'navigation',
        depth: 3,
        limit: 1,
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('  ✅ Navigation warmed');
      }
    } catch (error) {
      console.error('  ❌ Navigation warming failed:', error);
    }
  }

  /**
   * Warm up specific pages
   */
  private async warmupPages(pages: string[]): Promise<void> {
    const pagePromises = pages.map(async slug => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`  📄 Warming page: ${slug}`);
        }
        await PayloadAPI.findBySlug('pages', slug, 10);
        if (process.env.NODE_ENV === 'development') {
          console.log(`  ✅ Page ${slug} warmed`);
        }
      } catch (error) {
        console.error(`  ❌ Page ${slug} warming failed:`, error);
      }
    });

    await Promise.allSettled(pagePromises);
  }

  /**
   * Warm up collections
   */
  private async warmupCollections(collections: string[]): Promise<void> {
    const collectionPromises = collections.map(async collection => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`  📚 Warming collection: ${collection}`);
        }
        await PayloadAPI.find({
          collection,
          limit: 10,
          depth: 2,
        });
        if (process.env.NODE_ENV === 'development') {
          console.log(`  ✅ Collection ${collection} warmed`);
        }
      } catch (error) {
        console.error(`  ❌ Collection ${collection} warming failed:`, error);
      }
    });

    await Promise.allSettled(collectionPromises);
  }

  /**
   * Schedule cache warming for later
   */
  scheduleWarmup(config: WarmupConfig, delayMs: number = 5000): void {
    setTimeout(() => {
      this.warmup(config);
    }, delayMs);
  }

  /**
   * Get warming status
   */
  getStatus(): { isWarming: boolean; queueLength: number } {
    return {
      isWarming: this.isWarming,
      queueLength: this.warmupQueue.length,
    };
  }
}

// Global cache warmer instance
export const cacheWarmer = new CacheWarmer();

/**
 * Default warmup configuration
 */
export const defaultWarmupConfig: WarmupConfig = {
  pages: [
    'hem', // Homepage
    'coworking',
    'musikstudios',
    'event-spaces',
    'medlemskap',
    'utbildning',
    'residens',
    'partnerskap',
  ],
  collections: ['articles', 'showcases', 'navigation'],
  priority: 'high',
};

/**
 * Initialize cache warming on app start
 */
export function initializeCacheWarming(): void {
  // Schedule warmup after a short delay to not block initial load
  cacheWarmer.scheduleWarmup(defaultWarmupConfig, 2000);
}

/**
 * Manual cache warming trigger
 */
export async function triggerCacheWarming(
  config?: Partial<WarmupConfig>
): Promise<void> {
  const finalConfig = {
    ...defaultWarmupConfig,
    ...config,
  };

  await cacheWarmer.warmup(finalConfig);
}
