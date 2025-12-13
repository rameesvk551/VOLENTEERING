/**
 * Configuration constants for tour service
 */

// Default search parameters
export const DEFAULT_LOCATION = 'Paris';
export const DEFAULT_COUNTRY = 'France';

// Popularity score weights
export const POPULARITY_RATING_WEIGHT = 0.6;
export const POPULARITY_REVIEW_WEIGHT = 0.4;

// Normalization constants
export const MAX_REVIEW_COUNT_FOR_NORMALIZATION = 10000;

// Cache TTL (in seconds)
export const DEFAULT_CACHE_TTL_SEARCH = 300;  // 5 minutes
export const DEFAULT_CACHE_TTL_DETAILS = 600; // 10 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
