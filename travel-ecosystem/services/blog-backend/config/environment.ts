/**
 * Environment Configuration
 * Purpose: Centralized environment variable management
 * Architecture: As specified in claude.md - config layer
 *
 * Validates and exports all environment variables with type safety
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvironmentConfig {
  // Server
  nodeEnv: string;
  port: number;
  host: string;

  // Database
  mongodbUri: string;
  mongodbTestUri: string;

  // API
  apiPrefix: string;
  corsOrigin: string;

  // Logging
  logLevel: string;
  logFilePath: string;

  // Security
  jwtSecret: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // CMS
  cmsWebhookSecret?: string;
  cmsSyncEnabled: boolean;
}

/**
 * Validate and export environment configuration
 * Provides type-safe access to environment variables
 */
export const env: EnvironmentConfig = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nomadic-nook-blog',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/nomadic-nook-blog-test',

  // API
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CMS
  cmsWebhookSecret: process.env.CMS_WEBHOOK_SECRET,
  cmsSyncEnabled: process.env.CMS_SYNC_ENABLED === 'true',
};

/**
 * Validate required environment variables
 * Throws error if critical variables are missing in production
 */
export const validateEnvironment = (): void => {
  if (env.nodeEnv === 'production') {
    // TODO: Add production validation logic
    const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};
