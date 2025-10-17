import mongoose from 'mongoose';
import Redis from 'ioredis';
import config from './env';
import logger from '../utils/logger';

/**
 * MongoDB Connection
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = config.nodeEnv === 'test' ? config.mongodbTestUri : config.mongodbUri;

    await mongoose.connect(mongoUri, {
      maxPoolSize: 50,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * Redis Connection
 */
export const connectRedis = (): Redis => {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redis.on('connect', () => {
    logger.info(`Redis connected: ${config.redis.host}:${config.redis.port}`);
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', () => {
    logger.info('Redis reconnecting...');
  });

  return redis;
};

/**
 * Graceful shutdown
 */
export const closeConnections = async (redis: Redis): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    await redis.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing connections:', error);
  }
};

export default { connectDB, connectRedis, closeConnections };
