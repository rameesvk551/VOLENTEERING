/**
 * Request Logging Middleware
 * Purpose: Log all incoming requests and responses
 * Architecture: As specified in claude.md - request/response logging with Winston
 *
 * Provides:
 * - Request/response logging
 * - Performance tracking
 * - User agent and IP logging
 */

import { Request, Response, NextFunction } from 'express';
// import { logger } from '../config/logger';

/**
 * Request logger middleware
 * Logs incoming requests with timestamp, method, URL, status, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // TODO: Implement with Winston
  // logger.info('Incoming request', {
  //   method: req.method,
  //   url: req.url,
  //   ip: req.ip,
  //   userAgent: req.get('user-agent'),
  // });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`
    );

    // TODO: Log with Winston
    // logger.info('Request completed', {
    //   method: req.method,
    //   url: req.url,
    //   statusCode: res.statusCode,
    //   duration: `${duration}ms`,
    // });
  });

  next();
};

/**
 * Performance monitoring middleware
 * Tracks slow requests and logs warnings
 */
export const performanceMonitor = (threshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (duration > threshold) {
        console.warn(`[SLOW REQUEST] ${req.method} ${req.url} took ${duration}ms`);
        // TODO: Log with Winston
        // logger.warn('Slow request detected', {
        //   method: req.method,
        //   url: req.url,
        //   duration: `${duration}ms`,
        // });
      }
    });

    next();
  };
};
