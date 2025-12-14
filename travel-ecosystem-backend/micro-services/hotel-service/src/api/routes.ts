import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { HotelController } from './HotelController.js';
import type { AggregatorService } from '../services/AggregatorService.js';

/**
 * Hotel Routes
 * 
 * Registers all hotel-related API endpoints.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, routing would include:
 *   - API versioning (v1, v2)
 *   - Rate limiting middleware
 *   - Authentication middleware
 *   - Request validation schemas
 *   - OpenAPI/Swagger documentation
 *   - CORS configuration
 *   - Compression middleware
 *   - Health check endpoints for load balancers
 *   - Metrics endpoints (Prometheus)
 */
export function registerHotelRoutes(
  server: FastifyInstance,
  aggregator: AggregatorService
): void {
  const controller = new HotelController(aggregator);

  /**
   * Health check endpoint
   * Used by load balancers and monitoring systems
   */
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'hotel-aggregation-service',
      version: '1.0.0',
    };
  });

  /**
   * Main search endpoint
   * 
   * GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=20
   * 
   * Query Parameters:
   * - location: string (required) - City or location to search
   * - checkin: string (required) - Check-in date (YYYY-MM-DD)
   * - checkout: string (required) - Check-out date (YYYY-MM-DD)
   * - guests: number (required) - Number of guests
   * - cursor: number (optional) - Pagination cursor (default: 0)
   * - limit: number (optional) - Results per page (default: 20, max: 100)
   * 
   * Response:
   * {
   *   hotels: Hotel[],
   *   cursor: number,
   *   hasMore: boolean,
   *   total: number
   * }
   */
  server.get('/search', async (request, reply) => {
    return controller.search(request, reply);
  });

  /**
   * Future: Advanced search with filters
   * 
   * server.get('/search/advanced', async (request, reply) => {
   *   return controller.searchAdvanced(request, reply);
   * });
   */

  /**
   * Future: Search suggestions/autocomplete
   * 
   * server.get('/suggestions', async (request, reply) => {
   *   return controller.suggestions(request, reply);
   * });
   */

  /**
   * Future: Get hotel by ID
   * 
   * server.get('/hotels/:id', async (request, reply) => {
   *   return controller.getHotelDetails(request, reply);
   * });
   */

  /**
   * Future: Save search to user history
   * 
   * server.post('/search/save', {
   *   preHandler: authMiddleware
   * }, async (request, reply) => {
   *   return controller.saveSearch(request, reply);
   * });
   */
}
