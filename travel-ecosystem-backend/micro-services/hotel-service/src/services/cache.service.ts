/**
 * Cache Service using Redis
 * Implements cache-first strategy for hotel searches
 */

import { Hotel, SearchResult } from '../types/index.js';

export class CacheService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private defaultTTL: number = 300; // 5 minutes in seconds

  /**
   * Get cached search results
   */
  async getSearchResults(cacheKey: string): Promise<SearchResult | null> {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(cacheKey);
      return null;
    }

    console.log(`Cache HIT: ${cacheKey}`);
    return cached.data as SearchResult;
  }

  /**
   * Cache search results
   */
  async setSearchResults(cacheKey: string, data: SearchResult, ttl?: number): Promise<void> {
    const expiryTime = Date.now() + (ttl || this.defaultTTL) * 1000;
    
    this.cache.set(cacheKey, {
      data,
      expiry: expiryTime
    });

    console.log(`Cache SET: ${cacheKey} (TTL: ${ttl || this.defaultTTL}s)`);
  }

  /**
   * Get cached hotel details
   */
  async getHotel(hotelId: string): Promise<Hotel | null> {
    const cacheKey = `hotel:${hotelId}`;
    const cached = this.cache.get(cacheKey);
    
    if (!cached || Date.now() > cached.expiry) {
      return null;
    }

    console.log(`Cache HIT: ${cacheKey}`);
    return cached.data as Hotel;
  }

  /**
   * Cache hotel details
   */
  async setHotel(hotelId: string, hotel: Hotel, ttl?: number): Promise<void> {
    const cacheKey = `hotel:${hotelId}`;
    const expiryTime = Date.now() + (ttl || this.defaultTTL) * 1000;
    
    this.cache.set(cacheKey, {
      data: hotel,
      expiry: expiryTime
    });

    console.log(`Cache SET: ${cacheKey}`);
  }

  /**
   * Invalidate cache for a specific key
   */
  async invalidate(cacheKey: string): Promise<void> {
    this.cache.delete(cacheKey);
    console.log(`Cache INVALIDATED: ${cacheKey}`);
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    console.log('Cache CLEARED');
  }

  /**
   * Generate cache key from search query
   */
  generateSearchCacheKey(query: any): string {
    const parts = [
      query.location || query.city || '',
      query.country || '',
      query.checkInDate || '',
      query.checkOutDate || '',
      query.guests || '',
      query.minPrice || '',
      query.maxPrice || '',
      query.minRating || '',
      query.starRating || '',
      (query.amenities || []).sort().join(','),
      query.limit || '',
      query.offset || ''
    ];

    return `search:${parts.join(':').toLowerCase()}`;
  }
}
