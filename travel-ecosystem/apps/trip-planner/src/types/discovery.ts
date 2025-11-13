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

export type DiscoveryEntityType = 'festival' | 'attraction' | 'event' | 'place' | 'experience';

export interface DiscoveryEntity {
  id: string;
  type: DiscoveryEntityType;
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

export interface PaginatedDiscoveryRequest {
  query: string;
  cursor?: string | null;
  limit?: number;
  type: 'attractions' | 'blogs';
  filters?: Record<string, unknown>;
}

export interface PaginatedDiscoveryResponse<T> {
  items: T[];
  nextCursor: string | null;
  totalCount?: number;
  hasMore?: boolean;
}

export interface BlogFeedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  publishedAt?: string;
  source?: string;
}

export interface PrefetchSuggestionPayload {
  query: string;
  cursor?: string | null;
  type: 'attractions' | 'blogs';
}

export interface DiscoveryFilters {
  month?: string;
  interests?: string[];
  duration?: number;
  fromCountryCode?: string;
  budget?: string;
}

