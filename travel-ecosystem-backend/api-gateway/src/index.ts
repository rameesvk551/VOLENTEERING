import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true 
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
      admin: '/api/admin'
    },
    health: '/health'
  });
});

// Auth Service - Public routes (no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
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
  target: process.env.BLOG_SERVICE_URL || 'http://localhost:4003',
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
app.use('/api/admin', authMiddleware, createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || 'http://localhost:4002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/admin': '/api/admin'
  },
  onProxyReq: (proxyReq, req: any) => {
    // Forward authenticated user info
    proxyReq.setHeader('X-User-Id', req.user.id);
    proxyReq.setHeader('X-User-Email', req.user.email);
    proxyReq.setHeader('X-User-Role', req.user.role);
  },
  onError: (err, req, res) => {
    console.error('Admin Service Proxy Error:', err);
    res.status(503).json({ 
      success: false, 
      message: 'Admin service unavailable',
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
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Auth Service: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`🔗 Blog Service: ${process.env.BLOG_SERVICE_URL}`);
  console.log(`🔗 Admin Service: ${process.env.ADMIN_SERVICE_URL}`);
});

export default app;
