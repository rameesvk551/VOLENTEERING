/**
 * Configuration loader
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3008', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/gtfs',
  databasePoolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisCacheTtlRealtime: parseInt(process.env.REDIS_CACHE_TTL_REALTIME || '60', 10),
  redisCacheTtlStatic: parseInt(process.env.REDIS_CACHE_TTL_STATIC || '300', 10),
  
  // Google Maps
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  
  // GTFS
  gtfsFeedUrls: process.env.GTFS_FEED_URLS?.split(',') || [],
  gtfsUpdateCron: process.env.GTFS_UPDATE_CRON || '0 3 * * *',
  
  // GTFS-RT
  gtfsRtVehiclePositionsUrl: process.env.GTFS_RT_VEHICLE_POSITIONS_URL || '',
  gtfsRtTripUpdatesUrl: process.env.GTFS_RT_TRIP_UPDATES_URL || '',
  gtfsRtPollInterval: parseInt(process.env.GTFS_RT_POLL_INTERVAL || '15000', 10),
  
  // Routing
  maxWalkDistanceMeters: parseInt(process.env.MAX_WALK_DISTANCE_METERS || '800', 10),
  maxTransfers: parseInt(process.env.MAX_TRANSFERS || '3', 10),
  raptorTimeoutMs: parseInt(process.env.RAPTOR_TIMEOUT_MS || '5000', 10),
  
  // Rate limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
