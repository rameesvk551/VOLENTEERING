/**
 * Redis client for caching and queues
 */

import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    logger.error({ err }, 'Redis connection error');
    return true;
  }
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Helper to get cached data with JSON parsing
export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  
  try {
    return JSON.parse(cached) as T;
  } catch {
    return cached as T;
  }
}

// Helper to set cached data with JSON stringifying
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  await redis.quit();
  logger.info('Redis connection closed');
}
