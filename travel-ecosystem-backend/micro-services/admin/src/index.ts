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

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3002' }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/blog', blogRoutes);
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
