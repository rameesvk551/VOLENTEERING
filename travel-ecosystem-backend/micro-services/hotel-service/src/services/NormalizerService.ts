import type { Hotel } from '../domain/Hotel.js';

/**
 * Normalizer Service
 * 
 * Transforms provider-specific schemas into the unified Hotel model.
 * In this MVP, providers already return the unified model, but in production
 * each provider would have a different schema that needs transformation.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, this service would have:
 *   - Provider-specific normalizer classes (Strategy Pattern)
 *   - Field mapping configurations (JSON or database)
 *   - Data validation and sanitization
 *   - Fallback values for missing fields
 *   - Currency conversion service integration
 *   - Coordinate validation and correction
 *   - Image URL validation and CDN optimization
 * 
 * Example:
 * ```
 * const providerANormalizer = new ProviderANormalizer();
 * const providerBNormalizer = new ProviderBNormalizer();
 * 
 * const normalized = this.normalizerMap[provider].normalize(rawData);
 * ```
 */
export class NormalizerService {
  /**
   * Normalizes hotels from any provider into the unified format
   * 
   * @param hotels - Raw hotels from provider
   * @param providerName - Provider identifier
   * @returns Normalized Hotel[]
   */
  normalize(hotels: Hotel[], providerName: string): Hotel[] {
    // In MVP, data is already normalized
    // In production, this would apply transformations based on provider
    
    return hotels.map((hotel) => ({
      ...hotel,
      // Ensure provider is set correctly
      provider: providerName,
      
      // Sanitize price (ensure it's a positive number)
      price: Math.max(0, hotel.price || 0),
      
      // Round coordinates to 4 decimal places for consistency
      lat: this.roundCoordinate(hotel.lat),
      lng: this.roundCoordinate(hotel.lng),
      
      // Normalize name (trim whitespace, title case)
      name: this.normalizeName(hotel.name),
      
      // Ensure rating is within valid range
      rating: hotel.rating ? Math.max(0, Math.min(5, hotel.rating)) : undefined,
    }));
  }

  /**
   * Round coordinate to 4 decimal places (~11 meters precision)
   * This helps with deduplication matching
   */
  private roundCoordinate(coord: number): number {
    return Math.round(coord * 10000) / 10000;
  }

  /**
   * Normalize hotel name for better matching
   */
  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  /**
   * Future: Convert prices to a standard currency
   * 
   * async convertCurrency(amount: number, from: string, to: string): Promise<number> {
   *   const rate = await this.currencyService.getRate(from, to);
   *   return amount * rate;
   * }
   */

  /**
   * Future: Validate and correct coordinates using geocoding service
   * 
   * async validateCoordinates(lat: number, lng: number, address: string): Promise<{lat: number, lng: number}> {
   *   const isValid = this.geoValidator.validate(lat, lng);
   *   if (!isValid) {
   *     return await this.geocodingService.geocode(address);
   *   }
   *   return { lat, lng };
   * }
   */
}
