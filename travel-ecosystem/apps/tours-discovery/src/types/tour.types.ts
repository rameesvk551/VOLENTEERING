/**
 * Tour Types - Frontend
 * Matches backend unified tour schema
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
  originalAmount?: number;
  displayPrice: string;
}

export interface TourImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface TourRating {
  average: number;
  count: number;
}

export interface TourProvider {
  id: string;
  name: string;
  productId: string;
  url: string;
}

export interface TourDuration {
  value: number;
  unit: 'hours' | 'days' | 'minutes';
  displayText: string;
}

export interface TourCancellation {
  allowed: boolean;
  cutoffHours?: number;
  refundType?: 'full' | 'partial' | 'none';
  policy?: string;
}

export interface TourCategory {
  primary: string;
  tags: string[];
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

export interface Tour {
  id: string;
  normalizedAt: Date;
  title: string;
  description: string;
  shortDescription?: string;
  location: TourLocation;
  price: TourPrice;
  images: TourImage[];
  rating: TourRating;
  provider: TourProvider;
  duration: TourDuration;
  category: TourCategory;
  highlights: TourHighlight[];
  inclusions: string[];
  exclusions: string[];
  cancellation: TourCancellation;
  availability: TourAvailability;
  languages: string[];
  popularityScore?: number;
  lastUpdated?: Date;
}

export interface TourSearchFilters {
  location?: string;
  country?: string;
  date?: string;
  category?: string;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  durationMin?: number;
  durationMax?: number;
  durationUnit?: 'hours' | 'days';
  tags?: string[];
  sortBy?: 'popularity' | 'price' | 'rating' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

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
    searchQuery: TourSearchFilters;
    providersQueried: string[];
    providersSucceeded: string[];
    providersFailed: string[];
    cacheHit: boolean;
    responseTime: number;
  };
}

export interface RedirectResponse {
  success: boolean;
  data: {
    intentId: string;
    redirectUrl: string;
  };
}
