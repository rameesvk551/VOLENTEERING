import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import blogRoutes from './routes/blog.routes.js';
import commentRoutes from './routes/comment.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Connect to Database
connectDB();

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Blog service is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/blog', blogRoutes);
app.use('/api/blog/comments', commentRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`📝 Blog Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
