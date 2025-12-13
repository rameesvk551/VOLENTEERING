import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { authMiddleware, optionalAuthMiddleware, type AuthRequest } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { validateAdminBlogQuery } from './middleware/validation.middleware.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const BLOG_SERVICE_URL = process.env.BLOG_SERVICE_URL || 'http://localhost:4003';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:4002';
const TOUR_SERVICE_URL = process.env.TOUR_SERVICE_URL || 'http://localhost:4004';

// Middleware
app.use(helmet());
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3002',
  'http://localhost:1001',
  'http://localhost:1002',
  'http://localhost:1003',
  'http://localhost:1004',
  'http://localhost:1005',
  'http://localhost:1006'
];

app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || defaultOrigins,
  credentials: true 
}));
app.use(compression());
app.use(morgan('dev'));
// NOTE: Do NOT use express.json() before proxies - it consumes the body
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'API Gateway is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Travel Ecosystem API Gateway',
    version: '1.0.0',
    services: {
      auth: '/api/auth',
      blog: '/api/blog',
      admin: '/api/admin',
      tours: '/api/tours'
    },
    health: '/health'
  });
});

// Auth Service - Public routes (no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying to Auth Service:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Auth Service Response:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err);
    res.status(503).json({ 
      success: false, 
      message: 'Auth service unavailable',
      error: err.message 
    });
  }
}));

// Blog Service - Public routes with optional auth
app.use('/api/blog', optionalAuthMiddleware, createProxyMiddleware({
  target: BLOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/blog': '/api/blog'
  },
  onProxyReq: (proxyReq, req: any) => {
    // Forward user info if authenticated
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('Blog Service Proxy Error:', err);
    res.status(503).json({ 
      success: false, 
      message: 'Blog service unavailable',
      error: err.message 
    });
  }
}));

// Admin Service - Protected routes (auth required)
const forwardAdminHeaders = (proxyReq: any, req: AuthRequest) => {
  if (!req.user) {
    return;
  }

  proxyReq.setHeader('X-User-Id', req.user.id);
  proxyReq.setHeader('X-User-Email', req.user.email);
  proxyReq.setHeader('X-User-Role', req.user.role);
};

const onAdminProxyError = (err: Error, req: Request, res: Response) => {
  console.error('Admin Service Proxy Error:', err);
  if (!res.headersSent) {
    res.status(503).json({
      success: false,
      message: 'Admin service unavailable',
      error: err.message
    });
  }
};

const adminServiceProxy = createProxyMiddleware({
  target: ADMIN_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req: AuthRequest) => forwardAdminHeaders(proxyReq, req),
  onError: onAdminProxyError
});

app.use('/api/admin', authMiddleware, validateAdminBlogQuery, adminServiceProxy);

const adminServicePaths = [
  '/api/users',
  '/api/trips',
  '/api/hosts',
  '/api/gear',
  '/api/bookings',
  '/api/finance',
  '/api/analytics'
];

adminServicePaths.forEach((path) => {
  app.use(path, authMiddleware, adminServiceProxy);
});

// Tour Service - Public routes with optional auth
app.use('/api/tours', optionalAuthMiddleware, createProxyMiddleware({
  target: TOUR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tours': '/api/tours'
  },
  onProxyReq: (proxyReq, req: any) => {
    // Forward user info if authenticated
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  onError: (err, req, res) => {
    console.error('Tour Service Proxy Error:', err);
    res.status(503).json({ 
      success: false, 
      message: 'Tour service unavailable',
      error: err.message 
    });
  }
}));

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`🔗 Blog Service: ${BLOG_SERVICE_URL}`);
  console.log(`🔗 Admin Service: ${ADMIN_SERVICE_URL}`);
  console.log(`🔗 Tour Service: ${TOUR_SERVICE_URL}`);
});

// Graceful error handling for server startup
server.on('error', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or set a different PORT environment variable.`);
    console.error(`Example: In PowerShell run: $env:PORT = 4001; npm run dev`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

export default app;
