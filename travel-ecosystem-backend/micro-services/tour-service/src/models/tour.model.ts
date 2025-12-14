/**
 * Unified Tour Schema
 * Normalizes data from multiple tour providers (GetYourGuide, Viator, Klook)
 */

export interface TourLocation {
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export interface TourPrice {
  amount: number;
  currency: string;
  originalAmount?: number; // For discounted prices
  displayPrice: string; // Formatted price with currency symbol
}

export interface TourImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface TourRating {
  average: number;
  count: number;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface TourProvider {
  id: string; // 'getyourguide' | 'viator' | 'klook'
  name: string;
  productId: string; // Original product ID from provider
  url: string; // Direct booking URL on provider's site
}

export interface TourDuration {
  value: number;
  unit: 'hours' | 'days' | 'minutes';
  displayText: string; // e.g., "2 hours", "Full day"
}

export interface TourCancellation {
  allowed: boolean;
  cutoffHours?: number; // Hours before tour to cancel
  refundType?: 'full' | 'partial' | 'none';
  policy?: string;
}

export interface TourCategory {
  primary: string; // e.g., 'Adventure', 'Cultural', 'Food & Drink'
  tags: string[]; // e.g., ['water sports', 'family-friendly', 'outdoor']
}

export interface TourAvailability {
  isAvailable: boolean;
  nextAvailableDate?: string;
  spotsLeft?: number;
}

export interface TourHighlight {
  text: string;
  icon?: string;
}

/**
 * Unified Tour Model
 */
export interface Tour {
  // Internal metadata
  id: string; // Internal UUID for tracking
  normalizedAt: Date;
  
  // Basic information
  title: string;
  description: string;
  shortDescription?: string;
  
  // Location
  location: TourLocation;
  
  // Pricing
  price: TourPrice;
  
  // Media
  images: TourImage[];
  
  // Rating & Reviews
  rating: TourRating;
  
  // Provider information
  provider: TourProvider;
  
  // Tour details
  duration: TourDuration;
  category: TourCategory;
  highlights: TourHighlight[];
  inclusions: string[];
  exclusions: string[];
  
  // Booking info
  cancellation: TourCancellation;
  availability: TourAvailability;
  
  // Language
  languages: string[];
  
  // Additional metadata
  popularityScore?: number; // Internal ranking score
  lastUpdated?: Date;
}

/**
 * Search Query Interface
 */
export interface TourSearchQuery {
  location?: string; // City or destination name
  country?: string;
  date?: string; // ISO date string
  category?: string;
  duration?: {
    min?: number;
    max?: number;
    unit?: 'hours' | 'days';
  };
  price?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  minRating?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'rating' | 'popularity' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search Response Interface
 */
export interface TourSearchResponse {
  success: boolean;
  data: {
    tours: Tour[];
    total: number;
    limit: number;
    offset: number;
    aggregations?: {
      providers: { [key: string]: number };
      categories: { [key: string]: number };
      priceRange: { min: number; max: number };
    };
  };
  metadata: {
    searchQuery: TourSearchQuery;
    providersQueried: string[];
    providersSucceeded: string[];
    providersFailed: string[];
    cacheHit: boolean;
    responseTime: number;
  };
}

/**
 * Redirect Intent Interface
 * Used to track user's booking intent before redirect
 */
export interface RedirectIntent {
  intentId: string;
  userId?: string;
  tourId: string;
  provider: string;
  redirectUrl: string;
  timestamp: Date;
  metadata?: {
    searchQuery?: TourSearchQuery;
    userAgent?: string;
    referrer?: string;
  };
}

/**
 * Analytics Event Interface
 */
export interface AnalyticsEvent {
  eventType: 'search' | 'view' | 'click' | 'redirect' | 'conversion';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  tourId?: string;
  provider?: string;
  metadata?: Record<string, any>;
}

/**
 * Provider Configuration
 */
export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiUrl: string;
  affiliateId?: string;
  timeout: number;
  maxRetries: number;
  priority: number; // Higher priority providers are queried first
}

/**
 * Cache Key Generator
 */
export const generateCacheKey = (query: TourSearchQuery): string => {
  const normalized = {
    location: query.location?.toLowerCase().trim(),
    country: query.country?.toLowerCase().trim(),
    date: query.date,
    category: query.category?.toLowerCase().trim(),
    minRating: query.minRating,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
  return JSON.stringify(normalized);
};
