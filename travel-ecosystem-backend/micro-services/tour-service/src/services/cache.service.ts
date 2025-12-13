import NodeCache from 'node-cache';
import { generateCacheKey, TourSearchQuery } from '../models/tour.model.js';

/**
 * Cache Service
 * Manages caching for tour search results and details
 */
export class CacheService {
  private cache: NodeCache;
  private searchTTL: number;
  private detailsTTL: number;

  constructor() {
    const maxKeys = parseInt(process.env.CACHE_MAX_KEYS || '1000');
    this.searchTTL = parseInt(process.env.CACHE_TTL_SEARCH || '300'); // 5 minutes default
    this.detailsTTL = parseInt(process.env.CACHE_TTL_DETAILS || '600'); // 10 minutes default

    this.cache = new NodeCache({
      stdTTL: this.searchTTL,
      checkperiod: 120,
      maxKeys,
      useClones: false // For better performance
    });

    // Log cache statistics periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      console.log('[Cache Stats]', {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0
      });
    }, 60000); // Every minute
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, type: 'search' | 'details' = 'search'): boolean {
    const ttl = type === 'search' ? this.searchTTL : this.detailsTTL;
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
  }

  /**
   * Generate cache key for search query
   */
  generateSearchCacheKey(query: TourSearchQuery): string {
    return `search_${generateCacheKey(query)}`;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}
