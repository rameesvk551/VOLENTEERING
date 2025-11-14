/**
 * Transport API routes
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { getCache, setCache } from '@/cache/redis';
import { config } from '@/config';
import type { Leg } from '@/types/gtfs.types';

// Request schema
const multiModalRouteSchema = z.object({
  origin: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  destination: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number()
  }),
  departureTime: z.string().optional(),
  preferences: z.object({
    modes: z.array(z.enum(['transit', 'walking', 'cycling', 'driving', 'escooter'])).optional(),
    maxWalkDistance: z.number().optional(),
    maxTransfers: z.number().optional(),
    budget: z.enum(['budget', 'balanced', 'premium']).optional()
  }).optional()
});

export async function transportRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /multi-modal-route
   * Get multimodal transport options for a single leg
   */
  app.post('/multi-modal-route', async (request, reply) => {
    try {
      const data = multiModalRouteSchema.parse(request.body);
      const { origin, destination, departureTime, preferences } = data;

      // Generate cache key
      const cacheKey = `route:${origin.lat},${origin.lng}:${destination.lat},${destination.lng}:${departureTime || 'now'}:${JSON.stringify(preferences || {})}`;

      // Check cache
      const cached = await getCache<Leg[]>(cacheKey);
      if (cached) {
        logger.info({ cacheKey }, 'Cache hit for multimodal route');
        return reply.send({
          success: true,
          data: cached,
          cached: true
        });
      }

      // TODO: Implement actual routing logic
      // For now, return mock data structure
      const legs: Leg[] = [
        {
          origin,
          destination,
          steps: [
            {
              mode: 'transit',
              from: origin.name,
              to: destination.name,
              distance: 5000,
              duration: 900,
              route: 'Bus 42',
              routeColor: '#FF5733',
              departureTime: departureTime || new Date().toISOString(),
              arrivalTime: new Date(Date.now() + 900000).toISOString(),
              stops: 8,
              delay: 0
            }
          ],
          totalDistance: 5000,
          totalDuration: 900,
          estimatedCost: 2.50
        }
      ];

      // Cache the result
      await setCache(cacheKey, legs, config.redisCacheTtlStatic);

      return reply.send({
        success: true,
        data: legs,
        cached: false
      });
    } catch (err) {
      logger.error({ err }, 'Error in multi-modal-route');
      
      if (err instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request data',
          details: err.errors
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /nearby-stops
   * Get nearby transit stops
   */
  app.get('/nearby-stops', async (request, reply) => {
    try {
      const { lat, lng, radius = 800 } = request.query as { lat: string; lng: string; radius?: string };

      if (!lat || !lng) {
        return reply.status(400).send({
          success: false,
          error: 'Missing required parameters: lat, lng'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusMeters = parseInt(radius as string, 10);

      // Cache key
      const cacheKey = `nearby-stops:${latitude},${longitude}:${radiusMeters}`;

      // Check cache
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.info({ cacheKey }, 'Cache hit for nearby stops');
        return reply.send({
          success: true,
          data: cached,
          cached: true
        });
      }

      // Query database using PostGIS
      const { pool } = await import('@/database/connection');
      const result = await pool.query(`
        SELECT 
          stop_id,
          stop_name,
          stop_lat,
          stop_lon,
          ST_Distance(
            stop_location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) as distance
        FROM stops
        WHERE ST_DWithin(
          stop_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ORDER BY distance
        LIMIT 20
      `, [longitude, latitude, radiusMeters]);

      const stops = result.rows.map(row => ({
        stopId: row.stop_id,
        name: row.stop_name,
        lat: parseFloat(row.stop_lat),
        lng: parseFloat(row.stop_lon),
        distance: Math.round(row.distance)
      }));

      // Cache the result
      await setCache(cacheKey, stops, config.redisCacheTtlStatic);

      return reply.send({
        success: true,
        data: stops,
        cached: false
      });
    } catch (err) {
      logger.error({ err }, 'Error in nearby-stops');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /routes
   * Get all available routes
   */
  app.get('/routes', async (request, reply) => {
    try {
      const cacheKey = 'routes:all';

      // Check cache
      const cached = await getCache(cacheKey);
      if (cached) {
        return reply.send({
          success: true,
          data: cached,
          cached: true
        });
      }

      const { pool } = await import('@/database/connection');
      const result = await pool.query(`
        SELECT 
          r.route_id,
          r.route_short_name,
          r.route_long_name,
          r.route_type,
          r.route_color,
          r.route_text_color,
          a.agency_name
        FROM routes r
        LEFT JOIN agencies a ON r.agency_id = a.agency_id
        ORDER BY r.route_sort_order, r.route_short_name
      `);

      const routes = result.rows.map(row => ({
        routeId: row.route_id,
        shortName: row.route_short_name,
        longName: row.route_long_name,
        type: row.route_type,
        color: row.route_color,
        textColor: row.route_text_color,
        agency: row.agency_name
      }));

      // Cache for 1 hour
      await setCache(cacheKey, routes, 3600);

      return reply.send({
        success: true,
        data: routes,
        cached: false
      });
    } catch (err) {
      logger.error({ err }, 'Error in routes');
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
}
