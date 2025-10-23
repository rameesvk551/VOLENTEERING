// Type definitions for the Discovery Engine

export interface QueryEntities {
  city: string;
  country?: string;
  month?: string;
  year?: number;
  interests: string[];
  eventType: string[];
  duration?: number;
}

export interface Location {
  city: string;
  country?: string;
  area?: string;
  venue?: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface DateRange {
  start: string; // ISO 8601
  end: string;
  flexible: boolean;
}

export interface Metadata {
  category: string[];
  tags: string[];
  popularity: number; // 0-1
  cost?: string;
  duration?: string;
  crowdLevel?: 'low' | 'medium' | 'high' | 'very high';
  openingHours?: string;
  bestTimeToVisit?: string;
}

export interface Media {
  images: string[];
  videos?: string[];
  virtualTour?: string;
}

export interface Source {
  url: string;
  domain: string;
  crawledAt: string;
  lastUpdated: string;
}

export interface StructuredData {
  id: string;
  type: 'festival' | 'attraction' | 'event' | 'place' | 'experience';
  title: string;
  description: string;
  location: Location;
  dates?: DateRange;
  metadata: Metadata;
  media: Media;
  source: Source;
  embedding?: number[];
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Summary {
  headline: string;
  overview: string;
  highlights: string[];
  bestTime?: string;
  tips?: string[];
}

export interface DiscoveryResponse {
  query: string;
  entities: QueryEntities;
  summary: Summary;
  results: {
    festivals: StructuredData[];
    attractions: StructuredData[];
    places: StructuredData[];
    events: StructuredData[];
  };
  recommendations: Recommendation[];
  metadata: {
    totalResults: number;
    processingTime: number;
    cached: boolean;
    sources: string[];
    generatedAt?: string;
  };
}

export interface Recommendation {
  entity: StructuredData;
  reason: string;
  score: number;
  relationshipType: 'similar_to' | 'nearby' | 'related_to' | 'happens_during' | 'located_in';
  distance?: string;
}

// Graph Types
export type GraphNodeType = 'city' | 'place' | 'event' | 'category' | 'month' | 'tag';
export type GraphEdgeType = 'located_in' | 'happens_during' | 'related_to' | 'nearby' | 'similar_to';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: GraphEdgeType;
  weight: number; // 0-1
}

export interface GraphState {
  query: QueryEntities;
  nodes: GraphNode[];
  edges: GraphEdge[];
  recommendations: Recommendation[];
}

// Crawler Types
export interface CrawlerConfig {
  userAgent: string;
  rateLimit: number;
  concurrentRequests: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  respectRobotsTxt: boolean;
  source?: 'blog' | 'event' | 'tourism' | 'news';
  url?: string;
  schedule?: string;
  selectors?: {
    title: string;
    content: string;
    date: string;
    location: string;
    images: string;
  };
}

export interface CrawlResult {
  source: string;
  url: string;
  data: {
    name: string;
    description: string;
    type: 'event' | 'attraction' | 'accommodation' | 'transport';
    category: string;
    city: string;
    country: string;
    startDate: string | null;
    endDate: string | null;
    price: number | null;
    image: string | null;
    tags: string[];
    rating: number | null;
    reviewCount: number | null;
    coordinates: [number, number] | null;
    address: string | null;
    website: string | null;
    phone: string | null;
    openingHours: string | null;
    features: string[];
    accessibility: string[];
  };
}

export interface EventData {
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  price: number | null;
  category: string;
  tags: string[];
}

export interface RawData {
  url: string;
  title?: string;
  content?: string;
  date?: string;
  location?: string;
  images?: string[];
  extractedAt: Date;
}

// Cache Types
export interface CacheConfig {
  key: string;
  ttl: number;
  strategy: 'LRU' | 'LFU' | 'TTL';
}

// API Request Types
export interface DiscoveryRequest {
  query: string;
  filters?: {
    types?: string[];
    budget?: string;
    duration?: number;
    startDate?: string;
    endDate?: string;
  };
  preferences?: {
    interests?: string[];
    pace?: 'relaxed' | 'moderate' | 'fast';
  };
}

export interface EntityDetailRequest {
  entityId: string;
  includeRecommendations?: boolean;
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

// Database Model Types
export interface PlaceDocument extends StructuredData {
  _id: string;
  searchableText: string;
}

export interface QueryCacheDocument {
  _id: string;
  queryHash: string;
  query: QueryEntities;
  results: DiscoveryResponse;
  expiresAt: Date;
  createdAt: Date;
  hitCount: number;
}

export interface CrawlLogDocument {
  _id: string;
  source: string;
  url: string;
  status: 'success' | 'failed' | 'partial';
  itemsExtracted: number;
  errors: string[];
  duration: number;
  startedAt: Date;
  completedAt: Date;
}
