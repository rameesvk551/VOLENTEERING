import type { FastifyRequest, FastifyReply } from 'fastify';
import type { HotelSearchQuery, PaginatedHotelResponse } from '../domain/Hotel.js';
import { AggregatorService } from '../services/AggregatorService.js';

/**
 * Search Query Parameters (from URL query string)
 */
interface SearchQueryParams {
  location: string;
  checkin: string;
  checkout: string;
  guests: string;
  cursor?: string;
  limit?: string;
}

/**
 * HotelController
 * 
 * Handles HTTP requests for the /search endpoint.
 * Validates input, calls the aggregator service, and returns JSON response.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, controllers would include:
 *   - Request validation middleware (Zod, Joi, class-validator)
 *   - Authentication and authorization
 *   - Rate limiting per user/IP
 *   - Request logging and tracing
 *   - CORS configuration
 *   - Response compression
 *   - ETag caching headers
 *   - API versioning (v1, v2, etc.)
 *   - GraphQL support for flexible queries
 *   - Webhook support for async results
 */
export class HotelController {
  constructor(private readonly aggregator: AggregatorService) {}

  /**
   * Search hotels endpoint
   * 
   * GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=20
   */
  async search(
    request: FastifyRequest<{ Querystring: SearchQueryParams }>,
    reply: FastifyReply
  ): Promise<PaginatedHotelResponse> {
    try {
      // Extract and validate query parameters
      const { location, checkin, checkout, guests, cursor, limit } = request.query;

      // Validation
      if (!location || !checkin || !checkout || !guests) {
        reply.code(400);
        return {
          hotels: [],
          cursor: 0,
          hasMore: false,
          total: 0,
        } as any;
      }

      // Build search query
      const query: HotelSearchQuery = {
        location: location.trim(),
        checkin: checkin.trim(),
        checkout: checkout.trim(),
        guests: parseInt(guests, 10),
        cursor: cursor ? parseInt(cursor, 10) : 0,
        limit: limit ? parseInt(limit, 10) : 20,
      };

      // Log the search request
      console.log('\n🔍 New search request:', {
        location: query.location,
        checkin: query.checkin,
        checkout: query.checkout,
        guests: query.guests,
        cursor: query.cursor,
        limit: query.limit,
      });

      // Execute aggregation
      const startTime = Date.now();
      const results = await this.aggregator.search(query);
      const duration = Date.now() - startTime;

      console.log(`✅ Search completed in ${duration}ms\n`);

      // Return results with proper caching headers
      reply.header('Cache-Control', 'public, max-age=300'); // 5 minutes
      reply.header('X-Response-Time', `${duration}ms`);

      return results;

    } catch (error) {
      console.error('❌ Error in search controller:', error);
      
      reply.code(500);
      return {
        hotels: [],
        cursor: 0,
        hasMore: false,
        total: 0,
      } as any;
    }
  }

  /**
   * Future: Advanced search with filters
   * 
   * async searchAdvanced(
   *   request: FastifyRequest<{ Querystring: AdvancedSearchQuery }>,
   *   reply: FastifyReply
   * ): Promise<PaginatedHotelResponse> {
   *   const {
   *     location, checkin, checkout, guests,
   *     minPrice, maxPrice, minRating,
   *     amenities, starRating,
   *     sortBy, sortOrder
   *   } = request.query;
   *   
   *   // Apply filters and custom sorting
   *   const results = await this.aggregator.searchAdvanced({
   *     location, checkin, checkout, guests,
   *     filters: { minPrice, maxPrice, minRating, amenities, starRating },
   *     sort: { by: sortBy, order: sortOrder }
   *   });
   *   
   *   return results;
   * }
   */

  /**
   * Future: Search suggestions (autocomplete)
   * 
   * async suggestions(
   *   request: FastifyRequest<{ Querystring: { q: string } }>,
   *   reply: FastifyReply
   * ): Promise<string[]> {
   *   const { q } = request.query;
   *   const suggestions = await this.searchService.getSuggestions(q);
   *   return suggestions;
   * }
   */

  /**
   * Future: Get hotel details
   * 
   * async getHotelDetails(
   *   request: FastifyRequest<{ Params: { id: string } }>,
   *   reply: FastifyReply
   * ): Promise<Hotel> {
   *   const { id } = request.params;
   *   const hotel = await this.hotelService.getById(id);
   *   
   *   if (!hotel) {
   *     reply.code(404);
   *     throw new Error('Hotel not found');
   *   }
   *   
   *   return hotel;
   * }
   */

  /**
   * Future: Save search (for user history)
   * 
   * async saveSearch(
   *   request: FastifyRequest<{ Body: HotelSearchQuery }>,
   *   reply: FastifyReply
   * ): Promise<{ id: string }> {
   *   const userId = request.user.id; // From auth middleware
   *   const searchId = await this.searchHistoryService.save(userId, request.body);
   *   return { id: searchId };
   * }
   */
}
