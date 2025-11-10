// Data transformation utilities
// Follows DRY principle by extracting repeated transformation logic

import type { StructuredData } from '@/types';
import {
  PLACE_CATEGORY_MUSEUM,
  PLACE_CATEGORY_PARK,
  PLACE_CATEGORY_RELIGIOUS,
  PLACE_CATEGORY_MONUMENT,
  PLACE_CATEGORY_ATTRACTION,
  PLACE_CATEGORY_PLACE,
  GOOGLE_PLACE_TYPE_MUSEUM,
  GOOGLE_PLACE_TYPE_PARK,
  GOOGLE_PLACE_TYPE_WORSHIP,
  GOOGLE_PLACE_TYPE_TOURIST_ATTRACTION,
  GOOGLE_PLACE_TYPE_POINT_OF_INTEREST,
  MAX_GOOGLE_RATING,
  NORMALIZED_RATING_MAX
} from '@/constants';

/**
 * Categorize Google Place by its types
 * Separated concern: Place categorization logic
 */
export function categorizeGooglePlaceByTypes(types: string[]): string {
  if (types.includes(GOOGLE_PLACE_TYPE_MUSEUM)) return PLACE_CATEGORY_MUSEUM;
  if (types.includes(GOOGLE_PLACE_TYPE_PARK)) return PLACE_CATEGORY_PARK;
  if (types.includes(GOOGLE_PLACE_TYPE_WORSHIP)) return PLACE_CATEGORY_RELIGIOUS;
  if (types.includes(GOOGLE_PLACE_TYPE_TOURIST_ATTRACTION)) return PLACE_CATEGORY_MONUMENT;
  if (types.includes(GOOGLE_PLACE_TYPE_POINT_OF_INTEREST)) return PLACE_CATEGORY_ATTRACTION;
  return PLACE_CATEGORY_PLACE;
}

/**
 * Normalize Google Places rating to 0-1 scale
 * Separated concern: Rating normalization
 */
export function normalizeRating(rating: number | undefined): number {
  if (!rating) return NORMALIZED_RATING_MAX * 0.8; // Default confidence
  return (rating / MAX_GOOGLE_RATING) * NORMALIZED_RATING_MAX;
}

/**
 * Convert coordinates from {lat, lng} to [lng, lat] format
 * Separated concern: Coordinate transformation
 */
export function convertCoordinatesToGeoJSON(coordinates: { lat: number; lng: number }): [number, number] {
  return [coordinates.lng, coordinates.lat];
}

/**
 * Categorize documents by type
 * Separated concern: Result categorization
 */
export function categorizeDocumentsByType(documents: StructuredData[]): {
  festivals: StructuredData[];
  attractions: StructuredData[];
  places: StructuredData[];
  events: StructuredData[];
} {
  return {
    festivals: documents.filter((d) => d.type === 'festival'),
    attractions: documents.filter((d) => d.type === 'attraction'),
    places: documents.filter((d) => d.type === 'place'),
    events: documents.filter((d) => d.type === 'event')
  };
}

/**
 * Format documents for summary generation
 * Separated concern: Document formatting
 */
export function formatDocumentsForSummary(documents: StructuredData[], maxDescriptionLength: number): string {
  return documents
    .map((doc, idx) => 
      `${idx + 1}. ${doc.title} (${doc.type})\n   ${doc.description.substring(0, maxDescriptionLength)}...`
    )
    .join('\n\n');
}

/**
 * Extract unique sources from documents
 * Separated concern: Source extraction
 */
export function extractUniqueSources(documents: StructuredData[]): string[] {
  return [...new Set(documents.map((d) => d.source.domain))];
}

/**
 * Truncate description to specified length
 * Separated concern: Text truncation
 */
export function truncateDescription(description: string, maxLength: number): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength);
}

/**
 * Merge and deduplicate documents by ID
 * Follows DRY principle: Centralized deduplication logic
 */
export function mergeAndDeduplicateDocuments(
  primaryResults: StructuredData[],
  secondaryResults: StructuredData[]
): StructuredData[] {
  const seen = new Set<string>();
  const merged: StructuredData[] = [];

  // Add primary results first (higher priority)
  for (const item of primaryResults) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  // Add secondary results
  for (const item of secondaryResults) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Convert MongoDB document to StructuredData format
 * Separated concern: Database document transformation
 */
export function convertMongoDocToStructuredData(doc: any): StructuredData {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    dates: doc.dates,
    metadata: doc.metadata,
    media: doc.media,
    source: doc.source,
    confidence: doc.confidence
  };
}
