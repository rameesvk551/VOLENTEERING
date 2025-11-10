// Environment configuration utilities
// Follows SoC by centralizing environment variable access and validation

import {
  KAFKA_ENABLED_DEFAULT,
  KAFKA_TOPIC_WEATHER_REQUESTS,
  KAFKA_TOPIC_HOTEL_REQUESTS,
  KAFKA_TOPIC_VISA_REQUESTS,
  KAFKA_TOPIC_TRAVEL_DATA_REQUESTS,
  KAFKA_TOPIC_DISCOVERY_RESPONSES,
  DEFAULT_WEATHER_SERVICE_URL,
  DEFAULT_HOTEL_SERVICE_URL,
  DEFAULT_VISA_SERVICE_URL,
  DEFAULT_TRAVEL_DATA_SERVICE_URL,
  KAFKA_DEFAULT_TIMEOUT_MS,
  CACHE_ENABLED_FLAG,
  DEFAULT_CACHE_TTL_SECONDS,
  LOG_LEVEL_DEFAULT,
  LOG_FORMAT_DEFAULT
} from '@/constants';

/**
 * Get environment variable with fallback
 * Follows KISS: Simple getter with default value
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Get environment variable as number
 * Separated concern: Type conversion
 */
export function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as boolean
 * Separated concern: Boolean parsing
 */
export function getEnvVarAsBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true';
}

/**
 * Check if caching is enabled
 */
export function isCachingEnabled(): boolean {
  return getEnvVar('ENABLE_CACHING') === CACHE_ENABLED_FLAG;
}

/**
 * Get cache TTL in seconds
 */
export function getCacheTTL(): number {
  return getEnvVarAsNumber('CACHE_TTL_QUERY_RESULT', DEFAULT_CACHE_TTL_SECONDS);
}

/**
 * Check if Kafka is enabled
 */
export function isKafkaEnabled(): boolean {
  return getEnvVar('KAFKA_ENABLED', KAFKA_ENABLED_DEFAULT) !== 'false';
}

/**
 * Get Kafka brokers as array
 */
export function getKafkaBrokers(): string[] {
  return getEnvVar('KAFKA_BROKERS', '')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

/**
 * Get Kafka topic configuration
 */
export function getKafkaTopics() {
  return {
    weatherRequests: getEnvVar('WEATHER_REQUEST_TOPIC', KAFKA_TOPIC_WEATHER_REQUESTS),
    hotelRequests: getEnvVar('HOTEL_REQUEST_TOPIC', KAFKA_TOPIC_HOTEL_REQUESTS),
    visaRequests: getEnvVar('VISA_REQUEST_TOPIC', KAFKA_TOPIC_VISA_REQUESTS),
    travelDataRequests: getEnvVar('TRAVEL_DATA_REQUEST_TOPIC', KAFKA_TOPIC_TRAVEL_DATA_REQUESTS),
    discoveryResponses: getEnvVar('DISCOVERY_REPLY_TOPIC', KAFKA_TOPIC_DISCOVERY_RESPONSES)
  };
}

/**
 * Get Kafka timeout in milliseconds
 */
export function getKafkaTimeout(): number {
  return getEnvVarAsNumber('KAFKA_REQUEST_TIMEOUT_MS', KAFKA_DEFAULT_TIMEOUT_MS);
}

/**
 * Get service URLs configuration
 */
export function getServiceUrls() {
  return {
    weather: getEnvVar('WEATHER_SERVICE_URL', DEFAULT_WEATHER_SERVICE_URL),
    hotel: getEnvVar('HOTEL_SERVICE_URL', DEFAULT_HOTEL_SERVICE_URL),
    visa: getEnvVar('VISA_SERVICE_URL', DEFAULT_VISA_SERVICE_URL),
    travelData: getEnvVar('TRAVEL_DATA_SERVICE_URL', DEFAULT_TRAVEL_DATA_SERVICE_URL)
  };
}

/**
 * Get logger configuration
 */
export function getLoggerConfig() {
  return {
    level: getEnvVar('LOG_LEVEL', LOG_LEVEL_DEFAULT),
    format: getEnvVar('LOG_FORMAT', LOG_FORMAT_DEFAULT)
  };
}

/**
 * Check if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  const apiKey = getEnvVar('OPENAI_API_KEY');
  return !!apiKey && apiKey !== 'your_openai_api_key_here';
}

/**
 * Check if Google Places API key is configured
 */
export function isGooglePlacesConfigured(): boolean {
  const apiKey = getEnvVar('GOOGLE_PLACES_API_KEY');
  return !!apiKey && apiKey !== 'your_google_places_api_key_here';
}
