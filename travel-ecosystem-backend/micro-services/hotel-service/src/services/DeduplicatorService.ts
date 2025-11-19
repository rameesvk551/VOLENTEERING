import type { Hotel } from '../domain/Hotel.js';

/**
 * Deduplication Service
 * 
 * Removes duplicate hotels from merged provider results.
 * Uses (name + lat + lng) as the unique key.
 * When duplicates are found, keeps the one with the best price.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, deduplication would be more sophisticated:
 *   - Use fuzzy string matching for hotel names (Levenshtein distance)
 *   - Maintain a provider ID mapping database (hotel_mappings table)
 *   - Use ML-based entity resolution for better accuracy
 *   - Consider phone numbers, addresses, official IDs
 *   - Integrate with a master hotel database (e.g., from GDS systems)
 *   - Use Bloom filters for fast duplicate detection at scale
 *   - Store deduplication rules in a configuration service
 * 
 * Example production approach:
 * ```
 * // Check provider mapping first
 * const mappedId = await this.mappingService.getMasterHotelId(hotel.provider, hotel.id);
 * if (mappedId) return mappedId;
 * 
 * // Fallback to fuzzy matching
 * const similarHotels = await this.fuzzyMatcher.findSimilar(hotel);
 * if (similarHotels.length > 0 && similarity > 0.85) {
 *   return similarHotels[0].id;
 * }
 * ```
 */
export class DeduplicatorService {
  /**
   * Remove duplicate hotels from the list
   * 
   * @param hotels - Array of hotels from multiple providers
   * @returns Deduplicated array of hotels
   */
  deduplicate(hotels: Hotel[]): Hotel[] {
    const uniqueMap = new Map<string, Hotel>();

    for (const hotel of hotels) {
      const key = this.generateUniqueKey(hotel);

      const existing = uniqueMap.get(key);

      if (!existing) {
        // First time seeing this hotel
        uniqueMap.set(key, hotel);
      } else {
        // Duplicate found - keep the one with better price or rating
        const better = this.selectBetter(existing, hotel);
        uniqueMap.set(key, better);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Generate a unique key for a hotel based on:
   * - Normalized name (lowercase, trimmed)
   * - Rounded latitude (4 decimals = ~11m precision)
   * - Rounded longitude (4 decimals = ~11m precision)
   * 
   * This allows matching hotels from different providers that are
   * at the same location with the same name.
   */
  private generateUniqueKey(hotel: Hotel): string {
    const name = hotel.name.toLowerCase().trim();
    const lat = hotel.lat.toFixed(4);
    const lng = hotel.lng.toFixed(4);
    
    return `${name}|${lat}|${lng}`;
  }

  /**
   * Select the better hotel when duplicates are found
   * 
   * Priority:
   * 1. Lower price (better deal for user)
   * 2. Higher rating (if prices are equal)
   * 3. First one encountered (if both are equal)
   */
  private selectBetter(hotelA: Hotel, hotelB: Hotel): Hotel {
    // Prefer lower price
    if (hotelA.price < hotelB.price) {
      return hotelA;
    }
    if (hotelB.price < hotelA.price) {
      return hotelB;
    }

    // If prices are equal, prefer higher rating
    const ratingA = hotelA.rating || 0;
    const ratingB = hotelB.rating || 0;

    if (ratingA > ratingB) {
      return hotelA;
    }
    if (ratingB > ratingA) {
      return hotelB;
    }

    // If both price and rating are equal, keep the first one
    return hotelA;
  }

  /**
   * Future: Use fuzzy string matching for better name comparison
   * 
   * private calculateNameSimilarity(name1: string, name2: string): number {
   *   // Use Levenshtein distance or other fuzzy matching algorithm
   *   // Return similarity score between 0 and 1
   *   return levenshtein.similarity(name1, name2);
   * }
   */

  /**
   * Future: Check provider mapping database
   * 
   * async getMasterHotelId(provider: string, providerId: string): Promise<string | null> {
   *   const mapping = await this.db.hotelMappings.findOne({
   *     provider,
   *     providerId
   *   });
   *   return mapping?.masterHotelId || null;
   * }
   */

  /**
   * Future: Use ML-based entity resolution
   * 
   * async findDuplicatesML(hotels: Hotel[]): Promise<Map<string, string[]>> {
   *   const features = hotels.map(h => this.extractFeatures(h));
   *   const predictions = await this.mlModel.predict(features);
   *   return this.groupDuplicates(predictions);
   * }
   */
}
