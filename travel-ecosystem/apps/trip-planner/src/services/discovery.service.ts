// Discovery Engine Service - Connects Trip Planner to Discovery Engine Backend

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_DISCOVERY_API_URL || 'http://localhost:3000/api/v1';

export interface DiscoveryRequest {
  city: string;
  country: string;
  month?: string;
  interests?: string[];
  duration?: number;
  fromCountryCode?: string;
}

export interface Attraction {
  id?: string;
  placeId?: string; // Backend uses placeId
  name: string;
  description: string;
  address: string;
  category?: string;
  rating?: number;
  userRatingsTotal?: number;
  photos: string[];
  location?: { // Frontend format
    lat: number;
    lng: number;
  };
  coordinates?: { // Backend format
    lat: number;
    lng: number;
  };
  types: string[];
  priceLevel?: number;
  openingHours?: {
    openNow?: boolean;
    open_now?: boolean; // Backend uses snake_case
    weekdayText?: string[];
    weekday_text?: string[]; // Backend uses snake_case
  };
}

export interface WeatherData {
  city: string;
  country: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    temp: { min: number; max: number };
    description: string;
    icon: string;
  }>;
}

export interface VisaInfo {
  from: string;
  to: string;
  required: boolean;
  type?: string;
  duration?: string;
  processingTime?: string;
  cost?: string;
  notes?: string[];
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface TravelData {
  safety: {
    level: string;
    warnings: string[];
    tips: string[];
  };
  currency: {
    code: string;
    name: string;
    exchangeRate?: number;
  };
  language: string[];
  timezone: string;
  bestTimeToVisit: string[];
}

export interface DiscoveryResponse {
  query: DiscoveryRequest;
  attractions: Attraction[];
  weather: WeatherData | null;
  visa: VisaInfo | null;
  hotels: Hotel[];
  travelData: TravelData | null;
  metadata: {
    totalResults: number;
    processingTime: number;
    sources: string[];
    timestamp: string;
  };
}

export interface TrendingRequest {
  city: string;
  limit?: number;
}

export interface EntityDetailsRequest {
  entityId: string;
}

export interface RecommendationRequest {
  baseEntity: string;
  context?: {
    visitedPlaces?: string[];
    interests?: string[];
    duration?: number;
  };
  limit?: number;
}

class DiscoveryService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 Discovery API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ Discovery API Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        const errorMsg = error.response?.data?.message || error.message || 'API request failed';
        console.error('❌ Response Error:', errorMsg, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Main discovery endpoint - gets attractions, weather, hotels, visa info
   */
  async discover(request: DiscoveryRequest): Promise<DiscoveryResponse> {
    try {
      const response = await this.api.post<DiscoveryResponse>('/discover', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Discovery request failed');
    }
  }

  /**
   * Get attractions for a city
   */
  async getAttractions(city: string, country: string, interests?: string[]): Promise<Attraction[]> {
    try {
      const response = await this.api.get<{ attractions: Attraction[] }>('/attractions', {
        params: { city, country, interests },
      });
      return response.data.attractions;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attractions');
    }
  }

  /**
   * Get weather data for a city
   */
  async getWeather(city: string, country?: string): Promise<WeatherData> {
    try {
      const response = await this.api.get<WeatherData>('/weather', {
        params: { city, country },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weather');
    }
  }

  /**
   * Get visa requirements
   */
  async getVisaInfo(from: string, to: string): Promise<VisaInfo> {
    try {
      const response = await this.api.get<VisaInfo>('/visa', {
        params: { from, to },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch visa info');
    }
  }

  /**
   * Get hotels for a city
   */
  async getHotels(city: string, country: string, limit?: number): Promise<Hotel[]> {
    try {
      const response = await this.api.get<{ hotels: Hotel[] }>('/hotels', {
        params: { city, country, limit },
      });
      return response.data.hotels;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hotels');
    }
  }

  /**
   * Get trending places in a city
   */
  async getTrending(city: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await this.api.get(`/trending/${city}`, {
        params: { limit },
      });
      return response.data.trending || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending');
    }
  }

  /**
   * Get entity details by ID
   */
  async getEntityDetails(entityId: string): Promise<any> {
    try {
      const response = await this.api.get(`/entity/${entityId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch entity details');
    }
  }

  /**
   * Get recommendations based on an entity
   */
  async getRecommendations(request: RecommendationRequest): Promise<any[]> {
    try {
      const response = await this.api.post('/recommendations', request);
      return response.data.recommendations || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return response.data;
    } catch (error: any) {
      throw new Error('Discovery Engine is not available');
    }
  }
}

// Export singleton instance
export const discoveryService = new DiscoveryService();

// Export class for testing
export default DiscoveryService;
