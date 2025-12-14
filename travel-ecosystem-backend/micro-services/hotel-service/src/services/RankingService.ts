import type { Hotel } from '../domain/Hotel.js';

/**
 * Ranking Service
 * 
 * Sorts hotels based on multiple criteria to show the best results first.
 * Current strategy: Price ascending, then rating descending.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, ranking would be much more sophisticated:
 *   - ML-based personalized ranking (user preferences, history)
 *   - A/B testing different ranking strategies
 *   - Boost promoted/sponsored hotels
 *   - Distance from search location
 *   - Popularity score (booking frequency, reviews)
 *   - Availability and inventory levels
 *   - User's loyalty program memberships
 *   - Dynamic pricing signals
 *   - Seasonal adjustments
 *   - Real-time demand signals
 * 
 * Example production ranking:
 * ```
 * score = (
 *   baseScore * 0.3 +
 *   userPreferenceScore * 0.25 +
 *   popularityScore * 0.2 +
 *   priceScore * 0.15 +
 *   distanceScore * 0.1
 * )
 * ```
 */
export class RankingService {
  /**
   * Rank hotels by:
   * 1. Price (ascending - cheaper first)
   * 2. Rating (descending - higher rating first when price is same)
   * 
   * @param hotels - Array of hotels to rank
   * @returns Sorted array of hotels
   */
  rank(hotels: Hotel[]): Hotel[] {
    return [...hotels].sort((a, b) => {
      // Primary: Sort by price ascending (cheaper first)
      if (a.price !== b.price) {
        return a.price - b.price;
      }

      // Secondary: Sort by rating descending (higher rating first)
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }

      // Tertiary: Alphabetical by name for consistency
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Future: Personalized ranking based on user preferences
   * 
   * rankPersonalized(hotels: Hotel[], userProfile: UserProfile): Hotel[] {
   *   return hotels.sort((a, b) => {
   *     const scoreA = this.calculatePersonalizedScore(a, userProfile);
   *     const scoreB = this.calculatePersonalizedScore(b, userProfile);
   *     return scoreB - scoreA;
   *   });
   * }
   */

  /**
   * Future: ML-based ranking with multiple features
   * 
   * async rankML(hotels: Hotel[], context: SearchContext): Promise<Hotel[]> {
   *   const features = hotels.map(h => this.extractFeatures(h, context));
   *   const scores = await this.mlRankingModel.predict(features);
   *   
   *   return hotels
   *     .map((hotel, idx) => ({ hotel, score: scores[idx] }))
   *     .sort((a, b) => b.score - a.score)
   *     .map(item => item.hotel);
   * }
   */

  /**
   * Future: Calculate distance-based score
   * 
   * calculateDistanceScore(hotel: Hotel, userLocation: {lat: number, lng: number}): number {
   *   const distance = this.haversineDistance(
   *     userLocation.lat, userLocation.lng,
   *     hotel.lat, hotel.lng
   *   );
   *   
   *   // Convert to score (0-1, where 1 is closest)
   *   const maxDistance = 50; // km
   *   return Math.max(0, 1 - (distance / maxDistance));
   * }
   */

  /**
   * Future: Incorporate popularity metrics
   * 
   * async getPopularityScore(hotelId: string): Promise<number> {
   *   const stats = await this.analytics.getHotelStats(hotelId);
   *   
   *   return (
   *     stats.bookingCount * 0.4 +
   *     stats.viewCount * 0.3 +
   *     stats.reviewCount * 0.3
   *   ) / stats.maxPossibleScore;
   * }
   */

  /**
   * Future: Apply business rules (promotions, sponsorships)
   * 
   * applyBusinessRules(hotels: Hotel[]): Hotel[] {
   *   return hotels.map(hotel => {
   *     let boostedScore = hotel.score;
   *     
   *     // Boost sponsored hotels
   *     if (this.sponsoredHotelIds.has(hotel.id)) {
   *       boostedScore *= 1.2;
   *     }
   *     
   *     // Boost hotels with active promotions
   *     if (hotel.hasPromotion) {
   *       boostedScore *= 1.15;
   *     }
   *     
   *     return { ...hotel, score: boostedScore };
   *   });
   * }
   */
}
