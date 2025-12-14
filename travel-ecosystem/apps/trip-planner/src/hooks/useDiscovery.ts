// Custom hook for AI-powered discovery

import { useState, useCallback, useRef } from 'react';
import { discoveryService } from '../services/discovery.service';
import type { DiscoveryResponse } from '../services/discovery.service';

export interface QueryEntities {
  city: string;
  country?: string;
  month?: string;
  year?: number;
  interests: string[];
  eventType: string[];
  duration?: number;
}

export interface Summary {
  headline: string;
  overview: string;
  highlights: string[];
  bestTime?: string;
  tips?: string[];
}

export interface Location {
  city: string;
  country?: string;
  coordinates: { lat: number; lng: number };
}

export interface Metadata {
  category: string[];
  tags: string[];
  popularity: number;
  cost?: string;
  duration?: string;
}

export interface Media {
  images: string[];
}

export interface DiscoveryEntity {
  id: string;
  type: 'festival' | 'attraction' | 'event' | 'place' | 'experience';
  title: string;
  description: string;
  location: Location;
  dates?: {
    start: string;
    end: string;
  };
  metadata: Metadata;
  media: Media;
}

export interface Recommendation {
  entity: DiscoveryEntity;
  reason: string;
  score: number;
  relationshipType: string;
  distance?: string;
}

export interface DiscoveryResult {
  query: string;
  entities: QueryEntities;
  summary: Summary;
  results: {
    festivals: DiscoveryEntity[];
    attractions: DiscoveryEntity[];
    places: DiscoveryEntity[];
    events: DiscoveryEntity[];
  };
  recommendations: Recommendation[];
  metadata: {
    totalResults: number;
    processingTime: number;
    cached: boolean;
    sources: string[];
  };
}

// Dummy data for testing
// 

// Transform backend response to frontend format
const transformBackendResponse = (backendResponse: DiscoveryResponse, query: string): DiscoveryResult => {
  const { attractions, weather, hotels, travelData } = backendResponse;

  // Extract entities from query
  const queryParts = query.split(',').map(part => part.trim());
  const city = queryParts[0] || query;
  const country = queryParts[1] || '';

  // Transform attractions to the frontend format
  console.log('🔍 Transforming attractions:', { 
    count: attractions?.length || 0, 
    sample: attractions?.[0],
    allAttractions: attractions 
  });

  const createStableId = (attr: any, index: number) => {
    if (attr.placeId) return attr.placeId;
    if (attr.id) return attr.id;

    const base = attr.name || `attraction-${index}`;
    const locationHint = attr.address || `${attr.coordinates?.lat ?? ''}-${attr.coordinates?.lng ?? ''}`;
    return `${base}-${locationHint}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      || `attraction-${index}`;
  };

  const transformedAttractions: DiscoveryEntity[] = (attractions || []).map((attr: any, index: number) => ({
    id: createStableId(attr, index),
    type: 'attraction' as const,
    title: attr.name,
    description: attr.description || 'No description available',
    location: {
      city: attr.address?.split(',')[0] || city,
      country,
      coordinates: attr.coordinates || attr.location || { lat: 0, lng: 0 },
    },
    metadata: {
      category: attr.types || (attr.category ? [attr.category] : []),
      tags: attr.types || [],
      popularity: attr.rating || 0,
      cost: attr.priceLevel ? `${'$'.repeat(attr.priceLevel)}` : 'Free',
      duration: '1-2 hours',
    },
    media: {
      images: attr.photos || [],
    },
  }));

  console.log('✅ Transformed attractions:', { 
    count: transformedAttractions.length, 
    sample: transformedAttractions[0] 
  });

  // Transform hotels to places
  const transformedHotels: DiscoveryEntity[] = hotels.map(hotel => ({
    id: hotel.id,
    type: 'place' as const,
    title: hotel.name,
    description: `${hotel.rating}-star hotel`,
    location: {
      city,
      country,
      coordinates: hotel.location,
    },
    metadata: {
      category: ['hotel', 'accommodation'],
      tags: ['hotel', 'stay'],
      popularity: hotel.rating || 0,
      cost: '$'.repeat(hotel.priceLevel || 2),
    },
    media: {
      images: hotel.photos || [],
    },
  }));

  return {
    query,
    entities: {
      city,
      country,
      interests: [],
      eventType: [],
    },
    summary: {
      headline: `Discover ${city}${country ? ', ' + country : ''}`,
      overview: weather?.current?.description 
        ? `Current weather: ${weather.current.description}, ${weather.current.temp}°C. Perfect time to explore!`
        : `Explore the best attractions and experiences in ${city}.`,
      highlights: [
        `${attractions.length} top attractions`,
        `${hotels.length} recommended hotels`,
        weather?.current?.temp ? `Current temperature: ${weather.current.temp}°C` : '',
        travelData?.bestTimeToVisit?.[0] || 'Great destination year-round',
      ].filter(Boolean),
      bestTime: travelData?.bestTimeToVisit?.join(', '),
      tips: travelData?.safety?.tips || [],
    },
    results: {
      festivals: [],
      attractions: transformedAttractions,
      places: transformedHotels,
      events: [],
    },
    recommendations: [],
    metadata: {
      totalResults: attractions.length + hotels.length,
      processingTime: backendResponse.metadata.processingTime || 0,
      cached: false,
      sources: backendResponse.metadata.sources || ['Discovery Engine'],
    },
  };
};

export const useDiscovery = () => {
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [entities, setEntities] = useState<QueryEntities | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequestRef = useRef<string | null>(null);

  const search = useCallback(async (query: string, filters?: any) => {
    // Prevent duplicate simultaneous requests
    const requestKey = `${query}-${JSON.stringify(filters)}`;
    if (activeRequestRef.current === requestKey) {
      console.warn('🚫 Duplicate request blocked:', requestKey);
      return results;
    }

    activeRequestRef.current = requestKey;
    try {
      setIsLoading(true);
      setError(null);

      // Parse the query to extract city and country
      // You can implement a more sophisticated parser
      const queryParts = query.split(',').map(part => part.trim());
      const city = queryParts[0] || query;
      const country = queryParts[1] || '';

      // Call the discovery service
      const response = await discoveryService.discover({
        city,
        country,
        month: filters?.month,
        interests: filters?.interests || [],
        duration: filters?.duration,
        fromCountryCode: filters?.fromCountryCode,
      });

      console.log('📥 Discovery API Response:', {
        hasAttractions: !!response.attractions,
        attractionsCount: response.attractions?.length || 0,
        attractionsSample: response.attractions?.[0],
        fullResponse: response
      });

      // Transform the backend response to match the frontend DiscoveryResult format
      const data: DiscoveryResult = transformBackendResponse(response, query);

      setResults(data);
      setEntities(data.entities);
      setSummary(data.summary);
      setRecommendations(data.recommendations || []);

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      console.error('API call failed:', errorMessage);
      
      // Return empty result structure on error
      const emptyResult: DiscoveryResult = {
        query,
        entities: {
          city: query,
          interests: [],
          eventType: [],
        },
        summary: {
          headline: `Search for ${query}`,
          overview: 'Unable to fetch results. Please try again.',
          highlights: [],
        },
        results: {
          festivals: [],
          attractions: [],
          places: [],
          events: [],
        },
        recommendations: [],
        metadata: {
          totalResults: 0,
          processingTime: 0,
          cached: false,
          sources: [],
        },
      };
      
      setResults(emptyResult);
      setEntities(emptyResult.entities);
      setSummary(emptyResult.summary);
      setRecommendations([]);
      
      return emptyResult;
    } finally {
      setIsLoading(false);
      activeRequestRef.current = null; // Clear active request
    }
  }, [results]);

  const getEntityDetails = useCallback(async (entityId: string) => {
    try {
      return await discoveryService.getEntityDetails(entityId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch entity details');
    }
  }, []);

  const getRecommendations = useCallback(async (baseEntityId: string, context?: any) => {
    try {
      return await discoveryService.getRecommendations({
        baseEntity: baseEntityId,
        context
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch recommendations');
    }
  }, []);

  const getTrending = useCallback(async (city: string, limit: number = 20) => {
    try {
      return await discoveryService.getTrending(city, limit);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch trending');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setEntities(null);
    setSummary(null);
    setRecommendations([]);
    setError(null);
  }, []);

  // Helper method for searching destinations specifically
  const searchDestinations = useCallback(async (query: string, filters?: any) => {
    return search(query, filters);
  }, [search]);

  return {
    results,
    entities,
    summary,
    recommendations,
    isLoading,
    error,
    search,
    searchDestinations,
    getEntityDetails,
    getRecommendations,
    getTrending,
    clearResults
  };
};
