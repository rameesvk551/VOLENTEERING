// Centralized constants for the blog service
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  TEN_MIN: 600, // 10 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
};

export default { DEFAULT_PAGINATION, CACHE_TTL };
