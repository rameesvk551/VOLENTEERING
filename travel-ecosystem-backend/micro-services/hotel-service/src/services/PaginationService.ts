import type { Hotel, PaginatedHotelResponse } from '../domain/Hotel.js';

/**
 * Pagination Service
 * 
 * Implements cursor-based pagination for infinite scroll UX.
 * Cursor = index in the sorted array.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, pagination would be more robust:
 *   - Use encrypted/signed cursors to prevent tampering
 *   - Store cursor state in Redis for distributed systems
 *   - Support different page sizes based on client (mobile vs desktop)
 *   - Implement cursor expiration (e.g., 15 minutes)
 *   - Add metadata (total pages, total count, etc.)
 *   - Support bidirectional pagination (prev/next)
 *   - Handle result set changes (new hotels added/removed)
 *   - Optimize for database queries (OFFSET/LIMIT or keyset pagination)
 * 
 * Example production cursor:
 * ```
 * // Encrypted cursor containing: timestamp, offset, query_hash
 * const cursor = this.encryptCursor({
 *   offset: 40,
 *   timestamp: Date.now(),
 *   queryHash: hash(searchParams),
 *   version: 1
 * });
 * ```
 */
export class PaginationService {
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  /**
   * Paginate hotels using cursor-based pagination
   * 
   * @param hotels - Full array of sorted hotels
   * @param cursor - Current position (index) in the array
   * @param limit - Number of items per page
   * @returns Paginated response with hotels and metadata
   */
  paginate(
    hotels: Hotel[],
    cursor: number = 0,
    limit?: number
  ): PaginatedHotelResponse {
    // Validate and sanitize inputs
    const safeCursor = Math.max(0, cursor);
    const safeLimit = this.validateLimit(limit);

    // Extract the page of results
    const startIndex = safeCursor;
    const endIndex = startIndex + safeLimit;
    const pageHotels = hotels.slice(startIndex, endIndex);

    // Calculate next cursor and hasMore flag
    const nextCursor = endIndex;
    const hasMore = endIndex < hotels.length;

    return {
      hotels: pageHotels,
      cursor: nextCursor,
      hasMore,
      total: hotels.length,
    };
  }

  /**
   * Validate and sanitize the limit parameter
   */
  private validateLimit(limit?: number): number {
    if (!limit || limit <= 0) {
      return this.DEFAULT_LIMIT;
    }

    // Cap at max limit to prevent excessive data transfer
    return Math.min(limit, this.MAX_LIMIT);
  }

  /**
   * Future: Generate encrypted cursor for security
   * 
   * generateSecureCursor(offset: number, queryHash: string): string {
   *   const payload = {
   *     offset,
   *     queryHash,
   *     timestamp: Date.now(),
   *     version: 1
   *   };
   *   
   *   const json = JSON.stringify(payload);
   *   const encrypted = this.encryptionService.encrypt(json);
   *   return Buffer.from(encrypted).toString('base64url');
   * }
   */

  /**
   * Future: Decode and validate cursor
   * 
   * decodeSecureCursor(cursor: string): {offset: number, queryHash: string} {
   *   const encrypted = Buffer.from(cursor, 'base64url');
   *   const json = this.encryptionService.decrypt(encrypted);
   *   const payload = JSON.parse(json);
   *   
   *   // Validate timestamp (cursor expired after 15 minutes)
   *   if (Date.now() - payload.timestamp > 15 * 60 * 1000) {
   *     throw new Error('Cursor expired');
   *   }
   *   
   *   return payload;
   * }
   */

  /**
   * Future: Cache paginated results in Redis
   * 
   * async getPaginatedFromCache(cacheKey: string, cursor: number): Promise<PaginatedHotelResponse | null> {
   *   const cached = await this.redis.get(`pagination:${cacheKey}:${cursor}`);
   *   if (cached) {
   *     return JSON.parse(cached);
   *   }
   *   return null;
   * }
   * 
   * async setPaginatedToCache(cacheKey: string, cursor: number, result: PaginatedHotelResponse): Promise<void> {
   *   await this.redis.setex(
   *     `pagination:${cacheKey}:${cursor}`,
   *     300, // 5 minutes TTL
   *     JSON.stringify(result)
   *   );
   * }
   */

  /**
   * Future: Support bidirectional pagination
   * 
   * paginateBidirectional(
   *   hotels: Hotel[],
   *   cursor: string,
   *   direction: 'forward' | 'backward',
   *   limit: number
   * ): PaginatedHotelResponse {
   *   const decoded = this.decodeSecureCursor(cursor);
   *   
   *   if (direction === 'backward') {
   *     const endIndex = decoded.offset;
   *     const startIndex = Math.max(0, endIndex - limit);
   *     return this.createResponse(hotels.slice(startIndex, endIndex), startIndex, hotels.length);
   *   }
   *   
   *   // Forward pagination (default)
   *   return this.paginate(hotels, decoded.offset, limit);
   * }
   */
}
