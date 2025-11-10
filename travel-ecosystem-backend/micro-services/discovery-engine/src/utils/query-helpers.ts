// Query helper utilities - Centralized query building and filtering logic
// Follows DRY and SoC principles by extracting repeated MongoDB query patterns

import type { QueryEntities } from '@/types';
import { REGEX_CASE_INSENSITIVE, MONTH_INDEX_OFFSET } from '@/constants';

/**
 * Build MongoDB query for city search
 * Separated concern: City filtering logic
 */
export function buildCityQuery(city: string): Record<string, unknown> {
  return {
    'location.city': new RegExp(city, REGEX_CASE_INSENSITIVE)
  };
}

/**
 * Build MongoDB date range query
 * Separated concern: Date filtering logic
 */
export function buildDateRangeQuery(month: string, year: number): Record<string, unknown> | null {
  if (!month || !year) {
    return null;
  }

  const monthNum = new Date(`${month} 1, ${year}`).getMonth() + MONTH_INDEX_OFFSET;
  const startDate = new Date(year, monthNum - MONTH_INDEX_OFFSET, 1);
  const endDate = new Date(year, monthNum, 0);

  return {
    'dates.start': { $gte: startDate },
    'dates.end': { $lte: endDate }
  };
}

/**
 * Build MongoDB interests filter query
 * Separated concern: Interest/category filtering logic
 */
export function buildInterestsQuery(interests: string[]): Record<string, unknown> | null {
  if (!interests || interests.length === 0) {
    return null;
  }

  return {
    $or: [
      { 'metadata.category': { $in: interests } },
      { 'metadata.tags': { $in: interests } }
    ]
  };
}

/**
 * Build MongoDB event type filter query
 * Separated concern: Event type filtering logic
 */
export function buildEventTypeQuery(eventTypes: string[], maxTypesForFilter: number): Record<string, unknown> | null {
  // Only apply type filter if it's specific (not too many types)
  if (!eventTypes || eventTypes.length === 0 || eventTypes.length >= maxTypesForFilter) {
    return null;
  }

  return { type: { $in: eventTypes } };
}

/**
 * Combine query fragments into a single MongoDB query
 * Follows KISS principle: Simple query aggregation
 */
export function combineQueryFragments(fragments: Array<Record<string, unknown> | null>): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  for (const fragment of fragments) {
    if (fragment) {
      Object.assign(query, fragment);
    }
  }

  return query;
}

/**
 * Normalize entity object keys for consistent processing
 * Separated concern: Data normalization
 */
export function normalizeEntities(entities: QueryEntities): Record<string, unknown> {
  return {
    city: entities.city?.toLowerCase(),
    country: entities.country?.toLowerCase(),
    month: entities.month?.toLowerCase(),
    interests: entities.interests?.sort(),
    eventType: entities.eventType?.sort()
  };
}

/**
 * Check if interests match place types
 * Separated concern: Interest matching logic
 */
export function doesPlaceMatchInterests(placeTypes: string[], interests: string[]): boolean {
  if (!interests || interests.length === 0) {
    return true;
  }

  const typesString = placeTypes.join(' ').toLowerCase();
  return interests.some((interest) => typesString.includes(interest.toLowerCase()));
}
