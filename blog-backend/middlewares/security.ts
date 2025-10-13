/**
 * Security Middleware
 * Purpose: Security headers, rate limiting, and input sanitization
 * Architecture: As specified in claude.md - security best practices
 *
 * Provides:
 * - Rate limiting
 * - CORS configuration
 * - Security headers (helmet)
 * - Input sanitization
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting configuration
 * Prevents abuse and DDoS attacks
 */
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Rate limiter middleware
 * TODO: Implement with express-rate-limit
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  // TODO: Implement rate limiting logic
  // const limiter = rateLimit(rateLimitConfig);
  next();
};

/**
 * CORS configuration
 * Allows cross-origin requests from frontend
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Security headers middleware
 * TODO: Implement with helmet
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // TODO: Use helmet for security headers
  // helmet({
  //   contentSecurityPolicy: {...},
  //   hsts: {...},
  // })

  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * Input sanitization
 * Removes potentially dangerous characters
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // TODO: Implement input sanitization
  // Use libraries like xss-clean or express-mongo-sanitize
  next();
};

/**
 * API key validation (for CMS webhooks)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.CMS_WEBHOOK_SECRET;

  if (!expectedKey) {
    return next(); // Skip if not configured
  }

  if (apiKey !== expectedKey) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  next();
};
