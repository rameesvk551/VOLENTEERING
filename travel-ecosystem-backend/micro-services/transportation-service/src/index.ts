/**
 * Transportation Service - Main Entry Point
 * Multimodal transport routing with GTFS integration
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { registerRoutes } from '@/routes';
import { testConnection, ensurePostGIS, closePool } from '@/database/connection';
import { redis, closeRedis } from '@/cache/redis';
import { gtfsRtService } from '@/services/gtfs-rt.service';

const fastify = Fastify({
  logger: logger as any,
  trustProxy: true,
  requestIdHeader: 'x-request-id'
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: true,
      credentials: true
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: false
    });

    await fastify.register(rateLimit, {
      max: config.rateLimitMax,
      timeWindow: config.rateLimitWindow
    });

    // Connect to database
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    await ensurePostGIS();
    logger.info('Database connected with PostGIS');

    // Redis is auto-connected on import
    logger.info('Redis connected');

    // Register routes
    await registerRoutes(fastify);
    logger.info('Routes registered');

    // Start GTFS-RT polling if configured
    if (config.gtfsRtVehiclePositionsUrl) {
      await gtfsRtService.startPolling();
      logger.info('GTFS-RT polling started');
    }

    // Health check
    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    });

    // Start server
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0'
    });

    logger.info(`Transportation Service running on port ${config.port}`);
  } catch (error) {
    logger.error({ error, message: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }, 'Failed to start server');
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  gtfsRtService.stopPolling();
  await fastify.close();
  await closePool();
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  gtfsRtService.stopPolling();
  await fastify.close();
  await closePool();
  await closeRedis();
  process.exit(0);
});

start();
