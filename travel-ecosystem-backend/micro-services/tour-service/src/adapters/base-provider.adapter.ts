import { Tour, TourSearchQuery } from '../models/tour.model.js';

/**
 * Base Provider Adapter Interface
 * All tour provider adapters must implement this interface
 */
export interface ITourProvider {
  /**
   * Provider identification
   */
  readonly providerId: string;
  readonly providerName: string;

  /**
   * Search tours based on query parameters
   * @param query Search parameters
   * @returns Promise of normalized tour array
   */
  search(query: TourSearchQuery): Promise<Tour[]>;

  /**
   * Get detailed information about a specific tour
   * @param productId Provider's product ID
   * @returns Promise of normalized tour
   */
  getDetails(productId: string): Promise<Tour | null>;

  /**
   * Generate redirect URL with affiliate tracking
   * @param productId Provider's product ID
   * @param metadata Additional tracking parameters
   * @returns Redirect URL
   */
  generateRedirectUrl(productId: string, metadata?: Record<string, any>): string;

  /**
   * Check if provider is available/healthy
   * @returns Promise of boolean
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Provider Response Interface
 * Wrapper for provider responses with metadata
 */
export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: Error;
  provider: string;
  responseTime: number;
  fromCache: boolean;
}

/**
 * Base Provider Error
 */
export class ProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public originalError?: any
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'ProviderError';
  }
}
