import type { Hotel, HotelSearchQuery } from '../domain/Hotel.js';

/**
 * IHotelProvider Interface (SOLID: Interface Segregation & Dependency Inversion)
 * 
 * Every provider must implement this contract.
 * This allows easy addition of new providers without modifying existing code.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, providers would have:
 *   - Rate limiting configuration
 *   - Circuit breaker patterns
 *   - Retry policies with exponential backoff
 *   - Caching strategies (Redis)
 *   - Timeout configurations
 *   - Health check endpoints
 *   - Provider-specific authentication
 * 
 * Example future providers:
 * - Booking.com API
 * - Expedia API
 * - Agoda API
 * - Hotels.com API
 * - Airbnb API
 * - Custom B2B partner APIs
 */
export interface IHotelProvider {
  /**
   * Provider name for tracking and debugging
   */
  getName(): string;

  /**
   * Fetches hotels from the provider's API/database
   * 
   * @param query - Search parameters
   * @returns Promise<Hotel[]> - Provider-specific results (will be normalized)
   * 
   * Note: In production, this would return a provider-specific type
   * that gets normalized by the NormalizerService.
   */
  search(query: HotelSearchQuery): Promise<Hotel[]>;
}
