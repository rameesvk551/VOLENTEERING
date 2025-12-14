/**
 * Meta-Search Service
 * Orchestrates search across internal and external hotel sources
 * Normalizes, deduplicates, and ranks results
 */

import { Hotel, SearchQuery, SearchResult, HotelSource } from '../types/index.js';
import { db } from '../database/index.js';
import { HotelProvider } from '../hotelProvider.js';
import { findHotels } from '../hotelCatalog.js';

export class MetaSearchService {
  private externalProvider: HotelProvider;

  constructor() {
    this.externalProvider = new HotelProvider();
  }

  /**
   * Unified search across internal and external sources
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const { city, country, limit = 20, offset = 0 } = query;

    // Parallel search from both sources
    const [internalHotels, externalHotels] = await Promise.all([
      this.searchInternal(query),
      this.searchExternal(query)
    ]);

    // Normalize and merge results
    const normalized = this.normalizeHotels(internalHotels, externalHotels);

    // Deduplicate
    const deduplicated = this.deduplicateHotels(normalized);

    // Filter by criteria
    const filtered = this.filterHotels(deduplicated, query);

    // Rank and sort
    const ranked = this.rankHotels(filtered, query);

    // Apply pagination
    const total = ranked.length;
    const paginated = ranked.slice(offset, offset + limit);

    return {
      hotels: paginated,
      total,
      offset,
      limit
    };
  }

  /**
   * Search internal database
   */
  private async searchInternal(query: SearchQuery): Promise<Hotel[]> {
    const { city, country, location } = query;
    const searchCity = city || location;
    
    // Search in-memory database
    const dbHotels = db.searchHotels(searchCity, country);
    
    // Also search static catalog
    const catalogHotels = findHotels(searchCity || '');
    
    // Combine and mark as internal
    const allInternal = [...dbHotels, ...catalogHotels].map(hotel => ({
      ...hotel,
      source: HotelSource.INTERNAL
    }));

    return allInternal;
  }

  /**
   * Search external API
   */
  private async searchExternal(query: SearchQuery): Promise<Hotel[]> {
    try {
      const { city, country, location, limit } = query;
      const searchCity = city || location;

      if (!searchCity) {
        return [];
      }

      const results = await this.externalProvider.search({
        city: searchCity,
        country,
        limit
      });

      // Mark as external and add booking URL
      return results.map(hotel => ({
        ...hotel,
        source: HotelSource.EXTERNAL,
        externalBookingUrl: hotel.url
      }));
    } catch (error) {
      console.error('External search failed:', error);
      return [];
    }
  }

  /**
   * Normalize hotel data to consistent schema
   */
  private normalizeHotels(internal: Hotel[], external: Hotel[]): Hotel[] {
    const normalize = (hotel: Hotel): Hotel => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description || '',
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      coordinates: hotel.coordinates,
      rating: hotel.rating || 0,
      starRating: hotel.starRating,
      reviewCount: hotel.reviewCount,
      price: hotel.price,
      images: hotel.images || [],
      amenities: hotel.amenities || [],
      roomTypes: hotel.roomTypes || [],
      url: hotel.url,
      availability: hotel.availability ?? true,
      distanceFromCenter: hotel.distanceFromCenter,
      source: hotel.source,
      externalBookingUrl: hotel.externalBookingUrl
    });

    return [...internal, ...external].map(normalize);
  }

  /**
   * Deduplicate hotels based on name and location
   */
  private deduplicateHotels(hotels: Hotel[]): Hotel[] {
    const seen = new Map<string, Hotel>();

    for (const hotel of hotels) {
      const key = `${hotel.name.toLowerCase()}-${hotel.city.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.set(key, hotel);
      } else {
        // Prefer internal hotels over external
        const existing = seen.get(key)!;
        if (hotel.source === HotelSource.INTERNAL && existing.source === HotelSource.EXTERNAL) {
          seen.set(key, hotel);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Filter hotels by search criteria
   */
  private filterHotels(hotels: Hotel[], query: SearchQuery): Hotel[] {
    return hotels.filter(hotel => {
      // Price range
      if (query.minPrice && hotel.price.amount < query.minPrice) return false;
      if (query.maxPrice && hotel.price.amount > query.maxPrice) return false;

      // Rating
      if (query.minRating && hotel.rating < query.minRating) return false;

      // Star rating
      if (query.starRating && hotel.starRating !== query.starRating) return false;

      // Amenities
      if (query.amenities && query.amenities.length > 0) {
        const hasAllAmenities = query.amenities.every(amenity =>
          hotel.amenities.some(ha => ha.toLowerCase().includes(amenity.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }

  /**
   * Rank and sort hotels
   * Priority: Internal > Rating > Price
   */
  private rankHotels(hotels: Hotel[], query: SearchQuery): Hotel[] {
    return hotels.sort((a, b) => {
      // Prioritize internal hotels
      if (a.source === HotelSource.INTERNAL && b.source === HotelSource.EXTERNAL) return -1;
      if (a.source === HotelSource.EXTERNAL && b.source === HotelSource.INTERNAL) return 1;

      // Then by rating
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }

      // Then by price (lower first)
      return a.price.amount - b.price.amount;
    });
  }

  /**
   * Get hotel details by ID
   */
  async getHotelDetails(hotelId: string): Promise<Hotel | null> {
    // Try internal database first
    const internal = db.getHotelById(hotelId);
    if (internal) {
      return internal;
    }

    // Try catalog
    const allCatalog = findHotels('');
    const catalog = allCatalog.find(h => h.id === hotelId);
    if (catalog) {
      return {
        ...catalog,
        source: HotelSource.INTERNAL
      };
    }

    return null;
  }
}
