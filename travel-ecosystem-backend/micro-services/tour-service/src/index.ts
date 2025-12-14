import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import tourRoutes from './routes/tour.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4004');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:1001',
    'http://localhost:1002'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Tour Meta Search Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Tour Meta Search Service',
    description: 'Aggregates tours from multiple providers (GetYourGuide, Viator, Klook)',
    version: '1.0.0',
    endpoints: {
      search: 'GET /api/tours/search',
      details: 'GET /api/tours/:provider/:productId',
      redirect: 'POST /api/tours/redirect',
      conversion: 'POST /api/tours/conversion',
      health: 'GET /api/tours/health'
    },
    documentation: 'See README.md for full API documentation'
  });
});

// Tour routes
app.use('/api/tours', tourRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 Tour Meta Search Service');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/tours`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📦 Providers:');
  console.log('   • GetYourGuide');
  console.log('   • Viator');
  console.log('   • Klook (future-ready)');
  console.log('═══════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
