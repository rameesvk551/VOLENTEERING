import { Redis } from 'ioredis';
import logger from '../utils/logger';

class CacheService {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Cache Keys Structure:
   * - visa:{origin}:{destination} → Full visa data (TTL: 24h)
   * - country:{code} → Country info (TTL: 7d)
   * - map:{origin}:all → All destinations map (TTL: 12h)
   * - user:{id}:bookmarks → User bookmarks (TTL: 1h)
   * - search:popular → Trending searches (TTL: 6h)
   */

  // TTL constants (in seconds)
  private readonly TTL = {
    VISA: 24 * 60 * 60, // 24 hours
    COUNTRY: 7 * 24 * 60 * 60, // 7 days
    MAP: 12 * 60 * 60, // 12 hours
    BOOKMARKS: 60 * 60, // 1 hour
    SEARCH: 6 * 60 * 60, // 6 hours
    SHORT: 5 * 60, // 5 minutes
  };

  /**
   * Generic get with JSON parsing
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Generic set with JSON stringification
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // ===== Specific Cache Methods =====

  /**
   * Cache visa data
   */
  async cacheVisaData(origin: string, destination: string, data: any): Promise<boolean> {
    const key = `visa:${origin.toUpperCase()}:${destination.toUpperCase()}`;
    return this.set(key, data, this.TTL.VISA);
  }

  /**
   * Get cached visa data
   */
  async getVisaData(origin: string, destination: string): Promise<any | null> {
    const key = `visa:${origin.toUpperCase()}:${destination.toUpperCase()}`;
    return this.get(key);
  }

  /**
   * Cache country data
   */
  async cacheCountry(code: string, data: any): Promise<boolean> {
    const key = `country:${code.toUpperCase()}`;
    return this.set(key, data, this.TTL.COUNTRY);
  }

  /**
   * Get cached country data
   */
  async getCountry(code: string): Promise<any | null> {
    const key = `country:${code.toUpperCase()}`;
    return this.get(key);
  }

  /**
   * Cache all destinations map for an origin
   */
  async cacheDestinationsMap(origin: string, data: any): Promise<boolean> {
    const key = `map:${origin.toUpperCase()}:all`;
    return this.set(key, data, this.TTL.MAP);
  }

  /**
   * Get cached destinations map
   */
  async getDestinationsMap(origin: string): Promise<any | null> {
    const key = `map:${origin.toUpperCase()}:all`;
    return this.get(key);
  }

  /**
   * Cache user bookmarks
   */
  async cacheUserBookmarks(userId: string, data: any): Promise<boolean> {
    const key = `user:${userId}:bookmarks`;
    return this.set(key, data, this.TTL.BOOKMARKS);
  }

  /**
   * Get cached user bookmarks
   */
  async getUserBookmarks(userId: string): Promise<any | null> {
    const key = `user:${userId}:bookmarks`;
    return this.get(key);
  }

  /**
   * Invalidate user bookmarks cache
   */
  async invalidateUserBookmarks(userId: string): Promise<boolean> {
    const key = `user:${userId}:bookmarks`;
    return this.delete(key);
  }

  /**
   * Track popular searches (sorted set)
   */
  async trackSearch(origin: string, destination: string): Promise<void> {
    try {
      const key = 'search:popular';
      const member = `${origin.toUpperCase()}:${destination.toUpperCase()}`;
      await this.redis.zincrby(key, 1, member);
      await this.redis.expire(key, this.TTL.SEARCH);
    } catch (error) {
      logger.error('Error tracking search:', error);
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    try {
      const key = 'search:popular';
      return await this.redis.zrevrange(key, 0, limit - 1);
    } catch (error) {
      logger.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * Cache comparison data
   */
  async cacheComparison(countries: string[], data: any): Promise<boolean> {
    const key = `comparison:${countries.sort().join(':')}`;
    return this.set(key, data, this.TTL.SHORT);
  }

  /**
   * Get cached comparison
   */
  async getComparison(countries: string[]): Promise<any | null> {
    const key = `comparison:${countries.sort().join(':')}`;
    return this.get(key);
  }

  /**
   * Invalidate all visa data for a specific country pair
   */
  async invalidateVisaData(origin?: string, destination?: string): Promise<number> {
    if (origin && destination) {
      const key = `visa:${origin.toUpperCase()}:${destination.toUpperCase()}`;
      await this.delete(key);
      return 1;
    } else if (origin) {
      return this.deletePattern(`visa:${origin.toUpperCase()}:*`);
    }
    return 0;
  }

  /**
   * Invalidate all cached data (use with caution)
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      logger.warn('All cache data flushed');
      return true;
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('stats');
      const keyspace = await this.redis.info('keyspace');
      return { info, keyspace };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }
}

export default CacheService;
