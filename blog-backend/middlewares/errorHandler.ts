/**
 * Error Handling Middleware
 * Purpose: Centralized error handling and consistent error responses
 * Architecture: As specified in claude.md - error middleware for all routes
 *
 * Provides:
 * - Custom error classes
 * - Error response formatting
 * - Error logging integration
 * - Environment-specific error details
 */

import { Request, Response, NextFunction } from 'express';
// import { logger } from '../config/logger';

/**
 * Custom API Error class
 * Extends Error with HTTP status code
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error
 * 404 error for missing resources
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

/**
 * Validation Error
 * 400 error for invalid input
 */
export class ValidationError extends ApiError {
  constructor(message = 'Invalid input') {
    super(400, message);
  }
}

/**
 * Unauthorized Error
 * 401 error for authentication failures
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

/**
 * Error response formatter
 * Formats error for consistent API responses
 */
const formatErrorResponse = (err: any, isDevelopment: boolean) => {
  const response: any = {
    status: 'error',
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace in development
  if (isDevelopment) {
    response.stack = err.stack;
  }

  return response;
};

/**
 * Global error handling middleware
 * Catches all errors and sends formatted response
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  // logger.error('Error occurred:', {
  //   message: err.message,
  //   stack: err.stack,
  //   path: req.path,
  //   method: req.method,
  // });

  console.error('[ERROR]', err.message, err.stack);

  // Send error response
  const errorResponse = formatErrorResponse(err, isDevelopment);
  res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Catches all undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
