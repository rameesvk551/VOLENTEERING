/**
 * Route Optimizer Microservice
 * Fast, advanced route optimization using graph algorithms
 * NO AI/ML - Pure algorithmic optimization
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { RouteOptimizerService, TravelMethod, TravelType } from './services/route-optimizer.service';
import { Attraction } from './algorithms/tsp-solver';
import { z } from 'zod';
import dotenv from 'dotenv';
import { getOptimizeRouteJobHandler, optimizeRouteHandler } from './handlers/optimize-route.handler.js';
import {
  optimizeRouteHandler as optimizeRouteEnhancedHandler,
  getOptimizationJobHandler,
  getUserOptimizationsHandler,
  getUserStatsHandler,
  deleteOptimizationJobHandler,
} from './handlers/optimize-route-enhanced.handler.js';
import { connectDB, closeDB } from './database/connection.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
fastify.register(cors, {
  origin: true,
});

const enableLegacyOptimizeRoute = process.env.ENABLE_LEGACY_OPTIMIZE_ROUTE === 'true';

// Initialize service
const routeOptimizer = new RouteOptimizerService();

// Validation schemas
const AttractionSchema = z.object({
  name: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  image: z.string().url().optional(),
  priority: z.number().min(1).max(10).optional(),
  visitDuration: z.number().min(0).optional(), // in minutes
});

const OptimizeRouteSchema = z.object({
  attractions: z.array(AttractionSchema).min(2),
  budget: z.number().positive().optional(),
  travelType: z.enum(['budget', 'comfort', 'luxury', 'speed']),
  travelMethod: z.enum(['walk', 'bike', 'ride', 'drive', 'public_transport']),
  startTime: z.string().optional(),
  algorithm: z.enum(['nearest_neighbor', '2opt', 'christofides', 'genetic', 'priority', 'simulated_annealing', 'time_windows', 'multi_modal', 'advanced', 'auto']).optional(),
  multiModal: z.boolean().optional(),
  considerTimeWindows: z.boolean().optional(),
});

if (enableLegacyOptimizeRoute) {
  fastify.log.warn('ENABLE_LEGACY_OPTIMIZE_ROUTE=true → registering legacy /api/optimize-route handler');

  /**
   * POST /api/optimize-route (LEGACY)
   * Main route optimization endpoint used by legacy clients
   */
  fastify.post<{
    Body: {
      attractions: Attraction[];
      budget?: number;
      travelType: TravelType;
      travelMethod: TravelMethod;
      startTime?: string;
      algorithm?: string;
    };
  }>('/api/optimize-route', async (request, reply) => {
    try {
      const validated = OptimizeRouteSchema.parse(request.body);

      fastify.log.info({
        msg: 'Route optimization request (legacy)',
        attractions: validated.attractions.length,
        travelMethod: validated.travelMethod,
        travelType: validated.travelType,
        budget: validated.budget,
      });

      const startTime = Date.now();

      const result = await routeOptimizer.optimizeRoute(validated.attractions, {
        budget: validated.budget,
        travelType: validated.travelType,
        travelMethod: validated.travelMethod,
        startTime: validated.startTime,
        algorithm: validated.algorithm === 'auto' ? undefined : (validated.algorithm as any),
        multiModal: validated.multiModal,
        considerTimeWindows: validated.considerTimeWindows,
      });

      const processingTime = Date.now() - startTime;

      fastify.log.info({
        msg: 'Route optimization completed (legacy)',
        algorithm: result.algorithm,
        totalDistance: result.totalDistance,
        processingTime: `${processingTime}ms`,
      });

      return reply.code(200).send({
        success: true,
        data: result,
        stats: routeOptimizer.getRouteStats(result),
        processingTime: `${processingTime}ms`,
      });
    } catch (error: any) {
      fastify.log.error({ msg: 'Route optimization failed (legacy)', error: error.message });

      if (error.name === 'ZodError') {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Route optimization failed',
        message: error.message,
      });
    }
  });
} else {
  fastify.log.info('Legacy /api/optimize-route handler disabled (set ENABLE_LEGACY_OPTIMIZE_ROUTE=true to re-enable)');
}

/**
 * POST /api/compare-algorithms
 * Compare different optimization algorithms
 */
fastify.post<{
  Body: {
    attractions: Attraction[];
    budget?: number;
    travelType: TravelType;
    travelMethod: TravelMethod;
  };
}>('/api/compare-algorithms', async (request, reply) => {
  try {
    const validated = OptimizeRouteSchema.omit({ algorithm: true }).parse(request.body);

    fastify.log.info({
      msg: 'Algorithm comparison request',
      attractions: validated.attractions.length,
    });

    const results = await routeOptimizer.compareAlgorithms(validated.attractions, {
      budget: validated.budget,
      travelType: validated.travelType,
      travelMethod: validated.travelMethod,
    });

    const comparison = Object.entries(results).map(([algo, result]) => ({
      algorithm: algo,
      totalDistance: result.totalDistance,
      totalDuration: result.totalDuration,
      estimatedCost: result.estimatedCost,
      numberOfStops: result.optimizedRoute.length,
    }));

    return reply.code(200).send({
      success: true,
      comparison,
      details: results,
    });
  } catch (error: any) {
    fastify.log.error({ msg: 'Algorithm comparison failed', error: error.message });

    return reply.code(500).send({
      success: false,
      error: 'Algorithm comparison failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/optimize-route (V2 - NEW ARCHITECTURE)
 * Frontend → Backend route optimization
 * Returns ONLY optimized order, no transport details
 */
fastify.post('/api/v1/optimize-route', optimizeRouteHandler);
fastify.get('/api/v1/optimize-route/:jobId', getOptimizeRouteJobHandler);

/**
 * POST /api/v2/optimize-route (V3 - ENHANCED WITH PERSISTENCE & TRANSPORT)
 * Enhanced route optimization with MongoDB persistence and real transport details
 */
fastify.post('/api/v2/optimize-route', optimizeRouteEnhancedHandler);
fastify.get('/api/v2/optimize-route/:jobId', getOptimizationJobHandler);
fastify.get('/api/v2/optimizations', getUserOptimizationsHandler);
fastify.get('/api/v2/optimizations/stats/:userId', getUserStatsHandler);
fastify.delete('/api/v2/optimize-route/:jobId', deleteOptimizationJobHandler);
fastify.log.info('Registered enhanced optimize route handler on /api/v2/optimize-route (with transport & persistence)');

if (!enableLegacyOptimizeRoute) {
  fastify.post('/api/optimize-route', optimizeRouteHandler);
  fastify.get('/api/optimize-route/:jobId', getOptimizeRouteJobHandler);
  fastify.log.info('Registered new optimize route handler on /api/optimize-route (alias for /api/v1/optimize-route)');
} else {
  fastify.log.warn('Legacy handler active. New clients must call /api/v1/optimize-route to use the V2 schema.');
}

/**
 * GET /api/health
 * Health check
 */
fastify.get('/api/health', async (request, reply) => {
  return reply.code(200).send({
    status: 'healthy',
    service: 'route-optimizer',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/travel-methods
 * Get available travel methods and their parameters
 */
fastify.get('/api/travel-methods', async (request, reply) => {
  return reply.code(200).send({
    methods: {
      walk: { speedKmh: 5, costPerKm: 0, ideal: 'short distances (< 5km)' },
      bike: { speedKmh: 15, costPerKm: 0, ideal: 'medium distances (< 15km)' },
      ride: { speedKmh: 40, costPerKm: 1.5, ideal: 'convenience (1-100km)' },
      drive: { speedKmh: 50, costPerKm: 0.5, ideal: 'long distances' },
      public_transport: { speedKmh: 30, costPerKm: 0.3, ideal: 'cost-effective (0.5-50km)' },
    },
    travelTypes: {
      budget: 'Cost-optimized, basic comfort',
      comfort: 'Balance of cost and comfort',
      luxury: 'Premium experience, higher cost',
      speed: 'Fastest routes, higher cost',
    },
  });
});

/**
 * POST /api/insert-attraction
 * Real-time route update: Insert new attraction into existing route
 */
fastify.post<{
  Body: {
    currentRoute: Attraction[];
    newAttraction: Attraction;
    travelType: TravelType;
    travelMethod: TravelMethod;
  };
}>('/api/insert-attraction', async (request, reply) => {
  try {
    const { currentRoute, newAttraction, travelType, travelMethod } = request.body;

    fastify.log.info({
      msg: 'Real-time route insertion request',
      currentRouteSize: currentRoute.length,
      newAttraction: newAttraction.name,
    });

    const result = await routeOptimizer.insertAttractionIntoRoute(
      currentRoute,
      newAttraction,
      { travelType, travelMethod }
    );

    return reply.code(200).send({
      success: true,
      data: result,
      stats: routeOptimizer.getRouteStats(result),
    });
  } catch (error: any) {
    fastify.log.error({ msg: 'Route insertion failed', error: error.message });

    return reply.code(500).send({
      success: false,
      error: 'Route insertion failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/algorithms
 * Get available optimization algorithms
 */
fastify.get('/api/algorithms', async (request, reply) => {
  return reply.code(200).send({
    algorithms: {
      nearest_neighbor: {
        description: 'Greedy algorithm, fast O(n²)',
        bestFor: 'Quick results, any size',
        complexity: 'O(n²)',
      },
      '2opt': {
        description: 'Local search optimization',
        bestFor: 'Small to medium datasets (< 20 attractions)',
        complexity: 'O(n²) per iteration',
      },
      christofides: {
        description: 'Guarantees 1.5x optimal solution',
        bestFor: 'Medium datasets (10-20 attractions)',
        complexity: 'O(n³)',
      },
      genetic: {
        description: 'Evolutionary algorithm',
        bestFor: 'Large datasets (> 15 attractions)',
        complexity: 'O(n * population * generations)',
      },
      priority: {
        description: 'Priority-based clustering',
        bestFor: 'When attractions have different priorities',
        complexity: 'O(n log n + n²)',
      },
      simulated_annealing: {
        description: 'Probabilistic optimization technique',
        bestFor: 'Finding near-optimal solutions, medium datasets',
        complexity: 'O(n * iterations)',
      },
      time_windows: {
        description: 'Considers opening/closing hours',
        bestFor: 'Attractions with time constraints',
        complexity: 'O(n²)',
      },
      multi_modal: {
        description: 'Optimizes transport mode per segment',
        bestFor: 'Mixed distance routes (walk + transit + drive)',
        complexity: 'O(n²)',
      },
      advanced: {
        description: 'Combines nearest neighbor + 2-opt',
        bestFor: 'Best quality for small-medium datasets',
        complexity: 'O(n²)',
      },
      auto: {
        description: 'Automatically selects best algorithm',
        bestFor: 'General use',
        complexity: 'Adaptive',
      },
    },
  });
});

// Start server
const start = async () => {
  try {
    const PORT = parseInt(process.env.PORT || '3007', 10);
    const HOST = process.env.HOST || '0.0.0.0';

    // Connect to MongoDB
    try {
      await connectDB();
      fastify.log.info('✅ MongoDB persistence layer ready');
    } catch (dbError: any) {
      fastify.log.warn({ error: dbError?.message }, '⚠️  MongoDB connection failed - persistence disabled');
    }

    await fastify.listen({ port: PORT, host: HOST });

    fastify.log.info(`🚀 Route Optimizer Service running on port ${PORT}`);
    fastify.log.info(`📍 Health check: http://localhost:${PORT}/api/health`);
    fastify.log.info(`🗺️  Optimize route: POST http://localhost:${PORT}/api/optimize-route`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  await closeDB();
  process.exit(0);
});
