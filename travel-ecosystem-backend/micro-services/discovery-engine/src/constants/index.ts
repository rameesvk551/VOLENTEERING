// Centralized constants for the Discovery Engine
// Follows DRY principle by avoiding magic numbers and strings throughout the codebase

// Cache Configuration
export const CACHE_ENABLED_FLAG = 'true';
export const CACHE_KEY_VERSION = 'v1';
export const CACHE_KEY_PREFIX_QUERY = 'query:';
export const DEFAULT_CACHE_TTL_SECONDS = 3600; // 1 hour

// Search and Query Limits
export const MAX_SEARCH_RESULTS = 30;
export const MIN_RESULTS_FOR_RERANK = 10;
export const DEFAULT_RECOMMENDATION_LIMIT = 10;
export const MAX_PHOTOS_PER_PLACE = 5;
export const MAX_DESCRIPTION_LENGTH = 200;

// API Timeouts and Limits
export const KAFKA_DEFAULT_TIMEOUT_MS = 8000;
export const DEFAULT_HOTEL_LIMIT = 10;
export const DEFAULT_ARTICLE_LIMIT = 5;
export const DEFAULT_TRENDING_LIMIT = 20;
export const DEFAULT_SEARCH_LIMIT = 20;

// Photo and Media
export const GOOGLE_PLACES_PHOTO_MAX_WIDTH = 800;

// Regex Patterns
export const REGEX_CASE_INSENSITIVE = 'i';

// HTTP Status Codes
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_SERVER_ERROR = 500;

// Kafka Topics (defaults)
export const KAFKA_TOPIC_WEATHER_REQUESTS = 'weather.requests';
export const KAFKA_TOPIC_HOTEL_REQUESTS = 'hotel.requests';
export const KAFKA_TOPIC_VISA_REQUESTS = 'visa.requests';
export const KAFKA_TOPIC_TRAVEL_DATA_REQUESTS = 'travel-data.requests';
export const KAFKA_TOPIC_DISCOVERY_RESPONSES = 'discovery.responses';

// Service URLs (defaults)
export const DEFAULT_WEATHER_SERVICE_URL = 'http://localhost:4001';
export const DEFAULT_HOTEL_SERVICE_URL = 'http://localhost:4002';
export const DEFAULT_VISA_SERVICE_URL = 'http://localhost:4003';
export const DEFAULT_TRAVEL_DATA_SERVICE_URL = 'http://localhost:4004';

// Kafka Client Configuration
export const KAFKA_DEFAULT_CLIENT_ID = 'discovery-engine';
export const KAFKA_DEFAULT_GROUP_ID = 'discovery-engine-consumer';
export const KAFKA_DEFAULT_RPC_GROUP_ID = 'discovery-engine-rpc';
export const KAFKA_ENABLED_DEFAULT = 'true';

// Logger Configuration
export const LOG_LEVEL_DEFAULT = 'info';
export const LOG_FORMAT_DEFAULT = 'json';
export const LOG_FILE_MAX_SIZE_BYTES = 5242880; // 5MB
export const LOG_FILE_MAX_FILES = 5;
export const LOG_DIR_NAME = 'logs';
export const LOG_FILE_ERROR = 'logs/error.log';
export const LOG_FILE_COMBINED = 'logs/combined.log';

// Service Metadata
export const SERVICE_NAME = 'discovery-engine';

// Place Categories
export const PLACE_CATEGORY_MUSEUM = 'museum';
export const PLACE_CATEGORY_PARK = 'park';
export const PLACE_CATEGORY_RELIGIOUS = 'religious';
export const PLACE_CATEGORY_MONUMENT = 'monument';
export const PLACE_CATEGORY_ATTRACTION = 'attraction';
export const PLACE_CATEGORY_PLACE = 'place';

// Google Places Types
export const GOOGLE_PLACE_TYPE_MUSEUM = 'museum';
export const GOOGLE_PLACE_TYPE_PARK = 'park';
export const GOOGLE_PLACE_TYPE_WORSHIP = 'place_of_worship';
export const GOOGLE_PLACE_TYPE_TOURIST_ATTRACTION = 'tourist_attraction';
export const GOOGLE_PLACE_TYPE_POINT_OF_INTEREST = 'point_of_interest';

// Entity Types
export const ENTITY_TYPE_FESTIVAL = 'festival';
export const ENTITY_TYPE_ATTRACTION = 'attraction';
export const ENTITY_TYPE_EVENT = 'event';
export const ENTITY_TYPE_PLACE = 'place';
export const ENTITY_TYPE_EXPERIENCE = 'experience';

// Search Keywords
export const SEARCH_KEYWORD_MONUMENTS = 'monument landmark historical';
export const SEARCH_KEYWORD_PARKS = 'famous park garden';
export const SEARCH_KEYWORD_RELIGIOUS = 'famous temple mosque church';

// Date Configuration
export const MONTH_INDEX_OFFSET = 1; // JavaScript months are 0-indexed

// Crowd Levels
export const CROWD_LEVEL_LOW = 'low';
export const CROWD_LEVEL_MEDIUM = 'medium';
export const CROWD_LEVEL_HIGH = 'high';
export const CROWD_LEVEL_VERY_HIGH = 'very high';

// Relationship Types
export const RELATIONSHIP_SIMILAR_TO = 'similar_to';
export const RELATIONSHIP_NEARBY = 'nearby';
export const RELATIONSHIP_RELATED_TO = 'related_to';
export const RELATIONSHIP_HAPPENS_DURING = 'happens_during';
export const RELATIONSHIP_LOCATED_IN = 'located_in';

// Rating Normalization
export const MAX_GOOGLE_RATING = 5;
export const NORMALIZED_RATING_MAX = 1;
export const DEFAULT_CONFIDENCE_SCORE = 0.8;

// Array Limits for Filters
export const MAX_EVENT_TYPES_FOR_SPECIFIC_FILTER = 3;

// Default Values
export const DEFAULT_SEARCH_RADIUS_METERS = 50000; // 50km
export const DEFAULT_PLACE_LIMIT = 10;
export const DEFAULT_POPULARITY_SCORE = 0;
