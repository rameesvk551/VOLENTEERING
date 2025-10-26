// Google Places API Service for Real Attractions with Images & Coordinates

import axios from 'axios';
import { logger } from '@/utils/logger';

export interface PlaceResult {
  name: string;
  description: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photos: string[];
  types: string[];
  url: string;
  website?: string;
  phoneNumber?: string;
  openingHours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    
    if (!this.apiKey || this.apiKey === 'your_google_places_api_key_here') {
      logger.warn('⚠️ Google Places API key not configured');
    }
  }

  isEnabled(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_google_places_api_key_here';
  }

  /**
   * Search for tourist attractions in a city
   */
  async searchAttractions(
    city: string,
    country: string,
    options?: {
      type?: string; // 'tourist_attraction', 'museum', 'park', 'point_of_interest'
      radius?: number; // in meters, default 50000 (50km)
      keyword?: string;
      limit?: number;
    }
  ): Promise<PlaceResult[]> {
    if (!this.isEnabled()) {
      logger.warn('Google Places API not enabled');
      return [];
    }

    try {
      // First, get the city coordinates
      const cityCoords = await this.getCityCoordinates(city, country);
      
      if (!cityCoords) {
        logger.warn('Could not get city coordinates', { city, country });
        return [];
      }

      logger.info('🗺️ Searching attractions via Google Places', { 
        city, 
        country,
        coordinates: cityCoords 
      });

      // Search for nearby attractions
      const type = options?.type || 'tourist_attraction';
      const radius = options?.radius || 50000;
      const keyword = options?.keyword || 'famous landmarks monuments';
      
      const searchUrl = `${this.baseUrl}/nearbysearch/json`;
      const searchParams = {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: radius.toString(),
        type,
        keyword,
        key: this.apiKey
      };

      logger.debug('Places API request', { searchParams });

      const response = await axios.get(searchUrl, { params: searchParams });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        logger.error('Google Places API error', { 
          status: response.data.status,
          errorMessage: response.data.error_message 
        });
        return [];
      }

      const places = response.data.results || [];
      
      logger.info(`✅ Found ${places.length} attractions from Google Places`);

      // Get detailed information for each place
      const limit = options?.limit || 10;
      const detailedPlaces = await this.getPlaceDetails(
        places.slice(0, limit).map((p: any) => p.place_id)
      );

      return detailedPlaces;

    } catch (error: any) {
      logger.error('Google Places search failed', {
        error: error.message,
        city,
        country
      });
      return [];
    }
  }

  /**
   * Get city coordinates using Geocoding API
   */
  private async getCityCoordinates(
    city: string, 
    country: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json`;
      const params = {
        address: `${city}, ${country}`,
        key: this.apiKey
      };

      const response = await axios.get(geocodeUrl, { params });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      }

      return null;
    } catch (error: any) {
      logger.error('Geocoding failed', { error: error.message });
      return null;
    }
  }

  /**
   * Get detailed information for multiple places
   */
  private async getPlaceDetails(placeIds: string[]): Promise<PlaceResult[]> {
    const results: PlaceResult[] = [];

    for (const placeId of placeIds) {
      try {
        const detailsUrl = `${this.baseUrl}/details/json`;
        const params = {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,rating,user_ratings_total,photos,types,url,website,formatted_phone_number,opening_hours,editorial_summary',
          key: this.apiKey
        };

        const response = await axios.get(detailsUrl, { params });

        if (response.data.status === 'OK') {
          const place = response.data.result;
          
          // Get photo URLs
          const photos = this.getPhotoUrls(place.photos || []);

          results.push({
            name: place.name,
            description: place.editorial_summary?.overview || 
                        `${place.name} is a popular attraction in the area.`,
            placeId: placeId,
            coordinates: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0
            },
            address: place.formatted_address || '',
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            photos,
            types: place.types || [],
            url: place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            website: place.website,
            phoneNumber: place.formatted_phone_number,
            openingHours: place.opening_hours
          });
        }
      } catch (error: any) {
        logger.error('Failed to get place details', { 
          placeId, 
          error: error.message 
        });
      }
    }

    return results;
  }

  /**
   * Convert Google Places photo references to URLs
   */
  private getPhotoUrls(photos: any[], maxPhotos: number = 5): string[] {
    const urls: string[] = [];

    for (const photo of photos.slice(0, maxPhotos)) {
      if (photo.photo_reference) {
        const photoUrl = `${this.baseUrl}/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKey}`;
        urls.push(photoUrl);
      }
    }

    return urls;
  }

  /**
   * Search for specific landmarks or places by name
   */
  async searchByName(
    query: string,
    city?: string,
    country?: string
  ): Promise<PlaceResult[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const location = city && country ? ` in ${city}, ${country}` : '';
      const searchQuery = `${query}${location}`;

      const textSearchUrl = `${this.baseUrl}/textsearch/json`;
      const params = {
        query: searchQuery,
        key: this.apiKey
      };

      logger.info('🔍 Text search', { query: searchQuery });

      const response = await axios.get(textSearchUrl, { params });

      if (response.data.status === 'OK') {
        const places = response.data.results || [];
        const placeIds = places.slice(0, 10).map((p: any) => p.place_id);
        
        return await this.getPlaceDetails(placeIds);
      }

      return [];
    } catch (error: any) {
      logger.error('Text search failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get popular attractions for a city with proper categorization
   */
  async getPopularAttractions(
    city: string,
    country: string
  ): Promise<{
    monuments: PlaceResult[];
    museums: PlaceResult[];
    parks: PlaceResult[];
    religious: PlaceResult[];
  }> {
    if (!this.isEnabled()) {
      return { monuments: [], museums: [], parks: [], religious: [] };
    }

    try {
      logger.info('🏛️ Fetching popular attractions by category', { city, country });

      const [monuments, museums, parks, religious] = await Promise.all([
        this.searchAttractions(city, country, { 
          type: 'tourist_attraction',
          keyword: 'monument landmark historical',
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'museum',
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'park',
          keyword: 'famous park garden',
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'place_of_worship',
          keyword: 'famous temple mosque church',
          limit: 5
        })
      ]);

      logger.info('✅ Popular attractions fetched', {
        monuments: monuments.length,
        museums: museums.length,
        parks: parks.length,
        religious: religious.length
      });

      return { monuments, museums, parks, religious };

    } catch (error: any) {
      logger.error('Failed to fetch popular attractions', { error: error.message });
      return { monuments: [], museums: [], parks: [], religious: [] };
    }
  }
}
