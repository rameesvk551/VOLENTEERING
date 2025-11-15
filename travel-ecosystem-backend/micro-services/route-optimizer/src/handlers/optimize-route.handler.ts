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
import { routeJobStore } from '../lib/route-job-store.js';

const PRIORITY_MIN = 1;
const PRIORITY_MAX = 10;
const DEFAULT_PRIORITY = 5;

type PriorityAdjustment = {
  index: number;
  original: number;
  normalized: number;
};

const normalizePriorityValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  const numericValue =
    typeof value === 'string' && value.trim() !== ''
      ? Number(value)
      : value;

  if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
    return DEFAULT_PRIORITY;
  }

  const rounded = Math.round(numericValue);
  if (rounded < PRIORITY_MIN) {
    return PRIORITY_MIN;
  }
  if (rounded > PRIORITY_MAX) {
    return PRIORITY_MAX;
  }
  return rounded;
};

const sanitizeOptimizeRoutePayload = (
  payload: unknown
): { payload: unknown; priorityAdjustments: PriorityAdjustment[] } => {
  if (!payload || typeof payload !== 'object') {
    return { payload, priorityAdjustments: [] };
  }

  const rawPayload = payload as Record<string, any>;
  if (!Array.isArray(rawPayload.places)) {
    return { payload: rawPayload, priorityAdjustments: [] };
  }

  const priorityAdjustments: PriorityAdjustment[] = [];

  const places = rawPayload.places.map((place: any, index: number) => {
    if (!place || typeof place !== 'object') {
      return place;
    }

    const sanitizedPlace = { ...place };
    const normalizedPriority = normalizePriorityValue(sanitizedPlace.priority);

    if (normalizedPriority === undefined) {
      if ('priority' in sanitizedPlace) {
        delete sanitizedPlace.priority;
      }
      return sanitizedPlace;
    }

    if (
      typeof sanitizedPlace.priority === 'number' &&
      !Number.isNaN(sanitizedPlace.priority) &&
      sanitizedPlace.priority !== normalizedPriority
    ) {
      priorityAdjustments.push({
        index,
        original: sanitizedPlace.priority,
        normalized: normalizedPriority,
      });
    }

    sanitizedPlace.priority = normalizedPriority;
    return sanitizedPlace;
  });

  return {
    payload: {
      ...rawPayload,
      places,
    },
    priorityAdjustments,
  };
};

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
    const { payload: sanitizedPayload, priorityAdjustments } = sanitizeOptimizeRoutePayload(
      request.body
    );

    if (priorityAdjustments.length > 0) {
      request.log.warn({
        msg: 'Clamped invalid place priorities to 1-10 range',
        adjustments: priorityAdjustments,
      });
    }

    // Validate request
    const validated = OptimizeRouteRequestSchema.parse(sanitizedPayload);

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

    routeJobStore.save(result.jobId, result, processingTime);

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

export async function getOptimizeRouteJobHandler(
  request: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  const { jobId } = request.params;

  if (!jobId) {
    return reply.status(400).send({
      success: false,
      error: 'jobId is required',
    });
  }

  const job = routeJobStore.get(jobId);
  if (!job) {
    return reply.status(404).send({
      success: false,
      error: 'Job not found or expired',
    });
  }

  return reply.status(200).send({
    success: true,
    job,
    cached: true,
  });
}
