import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tripRoutes from './routes/trip.routes.js';
import hostRoutes from './routes/host.routes.js';
import gearRoutes from './routes/gear.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import blogRoutes from './routes/blog.routes.js';
import financeRoutes from './routes/finance.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3002',
  'http://localhost:1001',
  'http://localhost:1002',
  'http://localhost:1003',
  'http://localhost:1004',
  'http://localhost:1005',
  'http://localhost:1006'
];

// Middleware
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(compression());
app.use(morgan('dev'));
// Increase payload limit to 10MB for handling large requests (blog posts, images, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Travel Ecosystem Admin Service API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trips: '/api/trips',
      hosts: '/api/hosts',
      gear: '/api/gear',
      bookings: '/api/bookings',
      blog: '/api/blog',
      finance: '/api/finance',
      analytics: '/api/analytics',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/gear', gearRoutes);
app.use('/api/bookings', bookingRoutes);
// Mount blog admin routes both under historical path and current gateway path
app.use('/api/blog', blogRoutes);
app.use('/api/admin', blogRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
    availableEndpoints: ['/api/auth', '/api/users', '/api/trips', '/api/hosts', '/api/gear', '/api/bookings', '/api/blog', '/api/finance', '/api/analytics']
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Admin Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
