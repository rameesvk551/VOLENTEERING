/**
 * Domain Model: Unified Hotel Entity
 * 
 * This is the normalized representation used across the aggregation service.
 * All provider-specific schemas are transformed into this format.
 */

export interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  rating?: number;
  provider: string;
  address?: string;
  city?: string;
  country?: string;
  amenities?: string[];
  images?: string[];
  url?: string;
}

/**
 * Search Query Input
 * 
 * This represents the user's search request.
 * Can be extended to support more filters (e.g., amenities, star rating, etc.)
 */
export interface HotelSearchQuery {
  location: string;
  checkin: string;
  checkout: string;
  guests: number;
  cursor?: number;
  limit?: number;
}

/**
 * Paginated Response
 * 
 * Cursor-based pagination for infinite scroll UX.
 */
export interface PaginatedHotelResponse {
  hotels: Hotel[];
  cursor: number;
  hasMore: boolean;
  total: number;
}
