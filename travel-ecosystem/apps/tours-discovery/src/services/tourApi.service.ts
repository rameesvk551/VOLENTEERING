import axios, { AxiosInstance } from 'axios';
import { Tour, TourSearchFilters, TourSearchResponse, RedirectResponse } from '../types/tour.types';

/**
 * Tour API Service
 * Communicates with the Tour Meta Search Service via API Gateway
 */
class TourApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    this.api = axios.create({
      baseURL: `${baseURL}/api/tours`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token if available
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[TourAPI] Request failed:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Search tours
   */
  async searchTours(filters: TourSearchFilters, page = 1, limit = 20): Promise<TourSearchResponse> {
    const offset = (page - 1) * limit;
    
    const params: any = {
      ...filters,
      limit,
      offset,
    };

    // Convert tags array to comma-separated string
    if (filters.tags && Array.isArray(filters.tags)) {
      params.tags = filters.tags.join(',');
    }

    const response = await this.api.get<TourSearchResponse>('/search', { params });
    return response.data;
  }

  /**
   * Get tour details
   */
  async getTourDetails(provider: string, productId: string): Promise<Tour> {
    const response = await this.api.get<{ success: boolean; data: Tour }>(`/${provider}/${productId}`);
    return response.data.data;
  }

  /**
   * Generate redirect URL for booking
   */
  async generateRedirect(provider: string, productId: string): Promise<RedirectResponse> {
    const response = await this.api.post<RedirectResponse>('/redirect', {
      provider,
      productId,
    });
    return response.data;
  }

  /**
   * Get service health
   */
  async getHealth() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const tourApi = new TourApiService();
