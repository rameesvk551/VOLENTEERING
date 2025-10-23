// Fastify server setup

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { registerRoutes } from './routes';
import { dbManager } from '@/database/connection';
import { logger } from '@/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

export async function createServer() {
  const fastify = Fastify({
    logger: false, // We use Winston
    trustProxy: true,
    bodyLimit: 1048576 * 2 // 2MB
  });

  // Register CORS
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  });

  // Register rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    cache: 10000,
    allowList: ['127.0.0.1'],
    redis: dbManager.getRedis(),
    nameSpace: 'rate-limit:',
    continueExceeding: true,
    skipOnError: true
  });

  // Register WebSocket for streaming
  if (process.env.ENABLE_STREAMING === 'true') {
    await fastify.register(websocket);
  }

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register API routes
  await registerRoutes(fastify);

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    logger.error('Request error:', {
      error: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method
    });

    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: error.name,
      message: error.message,
      statusCode
    });
  });

  // Not found handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404
    });
  });

  return fastify;
}

export async function startServer() {
  try {
    // Connect to databases
    logger.info('Connecting to databases...');
    await dbManager.connectAll();

    // Create and start server
    const server = await createServer();

    await server.listen({ port: PORT, host: HOST });

    logger.info(`Server listening on http://${HOST}:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('Discovery Engine is ready!');

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`${signal} received, shutting down gracefully...`);

        await server.close();
        await dbManager.disconnectAll();

        logger.info('Server stopped');
        process.exit(0);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}
