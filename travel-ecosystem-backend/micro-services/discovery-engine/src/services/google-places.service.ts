// Google Places API Service for Real Attractions with Images & Coordinates
// Refactored to use constants and utility functions - Follows DRY and SoC principles

import axios from 'axios';
import { logger } from '@/utils/logger';
import { getEnvVar, isGooglePlacesConfigured } from '@/utils/env-config';
import {
  DEFAULT_SEARCH_RADIUS_METERS,
  DEFAULT_PLACE_LIMIT,
  SEARCH_KEYWORD_MONUMENTS,
  SEARCH_KEYWORD_PARKS,
  SEARCH_KEYWORD_RELIGIOUS,
  GOOGLE_PLACES_PHOTO_MAX_WIDTH,
  MAX_PHOTOS_PER_PLACE
} from '@/constants';

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
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    // Use centralized environment configuration
    this.apiKey = getEnvVar('GOOGLE_PLACES_API_KEY');
    
    if (!isGooglePlacesConfigured()) {
      logger.warn('⚠️ Google Places API key not configured');
    }
  }

  /**
   * Check if Google Places API is properly configured
   */
  isEnabled(): boolean {
    return isGooglePlacesConfigured();
  }

  /**
   * Search for tourist attractions in a city
   * Refactored to use constants instead of magic values
   */
  async searchAttractions(
    city: string,
    country: string,
    options?: {
      type?: string; // 'tourist_attraction', 'museum', 'park', 'point_of_interest'
      radius?: number; // in meters
      keyword?: string;
      limit?: number;
    }
  ): Promise<PlaceResult[]> {
    if (!this.isEnabled()) {
      logger.warn('Google Places API not enabled');
      return [];
    }

    try {
      // Get city coordinates first
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

      // Use constants for default values instead of hardcoded magic numbers
      const type = options?.type || 'tourist_attraction';
      const radius = options?.radius || DEFAULT_SEARCH_RADIUS_METERS;
      const keyword = options?.keyword || SEARCH_KEYWORD_MONUMENTS;
      const limit = options?.limit || DEFAULT_PLACE_LIMIT;
      
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

      // Check response status
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
   * Refactored to use constant for max width instead of magic number
   */
  private getPhotoUrls(photos: any[], maxPhotos: number = MAX_PHOTOS_PER_PLACE): string[] {
    const urls: string[] = [];

    for (const photo of photos.slice(0, maxPhotos)) {
      if (photo.photo_reference) {
        const photoUrl = `${this.baseUrl}/photo?maxwidth=${GOOGLE_PLACES_PHOTO_MAX_WIDTH}&photoreference=${photo.photo_reference}&key=${this.apiKey}`;
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
   * Refactored to use constants for search keywords instead of hardcoded strings
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

      // Fetch attractions in parallel using defined search keywords
      const [monuments, museums, parks, religious] = await Promise.all([
        this.searchAttractions(city, country, { 
          type: 'tourist_attraction',
          keyword: SEARCH_KEYWORD_MONUMENTS,
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'museum',
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'park',
          keyword: SEARCH_KEYWORD_PARKS,
          limit: 5
        }),
        this.searchAttractions(city, country, { 
          type: 'place_of_worship',
          keyword: SEARCH_KEYWORD_RELIGIOUS,
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
