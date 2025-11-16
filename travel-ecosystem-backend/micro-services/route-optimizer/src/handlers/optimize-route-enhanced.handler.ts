/**
 * Enhanced Route Optimizer Handler with Persistence & Priority/Budget Constraints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RouteOptimizerService } from '../services/route-optimizer-v2.service';
import { optimizationJobRepository } from '../database/optimization-job.repository';

// Validation schemas
const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  imageUrl: z.string().optional(),
  priority: z.number().min(1).max(10).optional(),
  visitDuration: z.number().min(5).optional(),
});

const OptimizeRouteSchema = z.object({
  userId: z.string().optional(),
  places: z.array(PlaceSchema).min(2, 'At least 2 places required'),
  constraints: z.object({
    startLocation: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
    startTime: z.string().optional(),
    timeBudgetMinutes: z.number().min(30).optional(),
    travelTypes: z.array(z.string()).nonempty('At least one travel type required'),
    budget: z.number().min(0).optional(),
  }),
  options: z.object({
    includeRealtimeTransit: z.boolean(),
    algorithm: z.string().optional(),
    priorityWeighting: z.number().min(0).max(1).optional().default(0.3), // NEW: How much to weight priority
    strictBudget: z.boolean().optional().default(false), // NEW: Enforce budget strictly
  }),
});

export async function optimizeRouteHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();

  try {
    // Validate request
    const validatedPayload = OptimizeRouteSchema.parse(request.body);

    request.log.info({
      userId: validatedPayload.userId,
      placesCount: validatedPayload.places.length,
      travelTypes: validatedPayload.constraints.travelTypes,
      includeRealtimeTransit: validatedPayload.options.includeRealtimeTransit,
    }, 'Route optimization request received');

    // Run optimization
    const optimizer = new RouteOptimizerService();
    const result = await optimizer.optimizeRoute(validatedPayload);

    const processingTimeMs = Date.now() - startTime;

    // Persist to database
    try {
      await optimizationJobRepository.save(
        result.jobId,
        validatedPayload.userId,
        result,
        processingTimeMs,
        validatedPayload // Store request for debugging
      );
      request.log.info({ jobId: result.jobId }, 'Optimization job persisted to database');
    } catch (dbError) {
      request.log.warn({ error: dbError }, 'Failed to persist optimization job (non-critical)');
    }

    request.log.info({
      jobId: result.jobId,
      stopsCount: result.optimizedOrder.length,
      estimatedDuration: result.estimatedDurationMinutes,
      processingTimeMs,
    }, 'Route optimization completed');

    return reply.code(200).send({
      success: true,
      data: result,
      processingTime: `${processingTimeMs}ms`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      request.log.warn({ errors: error.errors }, 'Validation failed');
      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    request.log.error({ error }, 'Optimization failed');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get optimization job by ID
 */
export async function getOptimizationJobHandler(
  request: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const { jobId } = request.params;
    const job = await optimizationJobRepository.findById(jobId);

    if (!job) {
      return reply.code(404).send({
        success: false,
        error: 'Job not found',
      });
    }

    return reply.code(200).send({
      success: true,
      data: job,
    });
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch job');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get user's optimization history
 */
export async function getUserOptimizationsHandler(
  request: FastifyRequest<{ Querystring: { userId: string; limit?: string } }>,
  reply: FastifyReply
) {
  try {
    const { userId, limit } = request.query;

    if (!userId) {
      return reply.code(400).send({
        success: false,
        error: 'userId is required',
      });
    }

    const jobs = await optimizationJobRepository.findByUserId(
      userId,
      limit ? parseInt(limit, 10) : 20
    );

    return reply.code(200).send({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch user optimizations');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Get user statistics
 */
export async function getUserStatsHandler(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  try {
    const { userId } = request.params;
    const stats = await optimizationJobRepository.getUserStats(userId);

    return reply.code(200).send({
      success: true,
      data: stats,
    });
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch user stats');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Delete optimization job
 */
export async function deleteOptimizationJobHandler(
  request: FastifyRequest<{ Params: { jobId: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) {
  try {
    const { jobId } = request.params;
    const { userId } = request.query;

    const deleted = await optimizationJobRepository.deleteById(jobId, userId);

    if (!deleted) {
      return reply.code(404).send({
        success: false,
        error: 'Job not found or not authorized',
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    request.log.error({ error }, 'Failed to delete job');
    return reply.code(500).send({
      success: false,
      error: 'Internal server error',
    });
  }
}
