/**
 * Route Optimizer Endpoint - NEW FORMAT
 * POST /api/optimize-route
 * 
 * This endpoint handles the FIRST step: User selects attractions → Backend optimizes
 * 
 * What this endpoint DOES:
 * ✔ Build distance matrix
 * ✔ Run TSP / 2-opt optimization
 * ✔ Run RAPTOR if public transport included
 * ✔ Apply constraints (budget, time window, opening hours)
 * ✔ Return optimized ORDER only
 * 
 * What this endpoint DOES NOT DO:
 * ❌ Calculate detailed transport options (that comes later)
 * ❌ Generate polylines
 * ❌ Generate PDF
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RouteOptimizerService } from '../services/route-optimizer-v2.service.js';

// Validation schemas
const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  imageUrl: z.string().optional(),
  priority: z.number().min(1).max(10).optional(),
  visitDuration: z.number().min(0).optional(), // minutes
});

const OptimizeRouteRequestSchema = z.object({
  userId: z.string().optional(),
  places: z.array(PlaceSchema).min(2, 'At least 2 places required'),
  constraints: z.object({
    startLocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    startTime: z.string().optional(), // ISO 8601
    timeBudgetMinutes: z.number().positive().optional(),
    travelTypes: z.array(
      z.enum(['PUBLIC_TRANSPORT', 'WALKING', 'DRIVING', 'CYCLING', 'E_SCOOTER'])
    ).min(1),
    budget: z.number().positive().optional(),
  }),
  options: z.object({
    includeRealtimeTransit: z.boolean(),
    algorithm: z.enum(['TSP_2OPT', 'RAPTOR', 'GREEDY', 'GENETIC', 'auto']).optional(),
  }),
});

type OptimizeRouteRequest = z.infer<typeof OptimizeRouteRequestSchema>;

// Initialize service (singleton)
const routeOptimizer = new RouteOptimizerService();

/**
 * Main handler
 */
export async function optimizeRouteHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();

  try {
    // Validate request
    const validated = OptimizeRouteRequestSchema.parse(request.body);

    request.log.info({
      msg: 'Route optimization request received',
      userId: validated.userId,
      placesCount: validated.places.length,
      travelTypes: validated.constraints.travelTypes,
      budget: validated.constraints.budget,
    });

    // Call optimization service
    const result = await routeOptimizer.optimizeRoute(validated);

    const processingTime = Date.now() - startTime;

    request.log.info({
      msg: 'Route optimization completed',
      jobId: result.jobId,
      stopsCount: result.optimizedOrder.length,
      estimatedDuration: result.estimatedDurationMinutes,
      totalDistance: result.totalDistanceMeters,
      processingTime: `${processingTime}ms`,
    });

    return reply.status(200).send({
      success: true,
      ...result,
      processingTime: `${processingTime}ms`,
    });
  } catch (error: any) {
    request.log.error({
      msg: 'Route optimization failed',
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid request data',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      error: 'Route optimization failed',
      message: error.message,
    });
  }
}
