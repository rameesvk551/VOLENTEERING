/**
 * Blog Backend Server
 * Purpose: Main Express application entry point
 * Architecture: RESTful API with middleware stack
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import { env, validateEnvironment } from './config/environment';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { requestLogger, performanceMonitor } from './middlewares/requestLogger';
import { securityHeaders, corsConfig } from './middlewares/security';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import postRoutes from './routes/postRoutes';

// Validate environment variables
validateEnvironment();

// Create Express app
const app: Application = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware stack
app.use(cors(corsConfig));
app.use(securityHeaders);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);
app.use(performanceMonitor(1000)); // Warn on requests > 1s

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.nodeEnv,
  });
});

// API Routes
app.use(`${env.apiPrefix}/posts`, postRoutes);

// CMS Webhook endpoint (optional)
app.post(`${env.apiPrefix}/webhook/cms-sync`, (req: Request, res: Response) => {
  logger.info('CMS sync webhook received', { body: req.body });
  res.status(200).json({ message: 'Webhook received' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start listening
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on http://${env.host}:${env.port}`);
      logger.info(`📚 Environment: ${env.nodeEnv}`);
      logger.info(`🔗 API: http://${env.host}:${env.port}${env.apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;