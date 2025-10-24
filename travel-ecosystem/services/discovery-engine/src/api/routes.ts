// API Routes for Discovery Engine

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DiscoveryChain } from '@/chains/discovery.chain';
import { KnowledgeGraph } from '@/graph/knowledge.graph';
import { Place } from '@/database/models';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import type {
  DiscoveryRequest,
  EntityDetailRequest,
  RecommendationRequest
} from '@/types';

// Request validation schemas
const DiscoveryRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    types: z.array(z.string()).optional(),
    budget: z.string().optional(),
    duration: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).optional(),
  preferences: z.object({
    interests: z.array(z.string()).optional(),
    pace: z.enum(['relaxed', 'moderate', 'fast']).optional()
  }).optional()
});

const RecommendationRequestSchema = z.object({
  baseEntity: z.string(),
  context: z.object({
    visitedPlaces: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    duration: z.number().optional()
  }).optional(),
  limit: z.number().min(1).max(50).optional()
});

export async function registerRoutes(fastify: FastifyInstance) {
  const discoveryChain = new DiscoveryChain();
  // Temporarily disabled until LangGraph compatibility is fixed
  // const knowledgeGraph = new KnowledgeGraph();

  /**
   * POST /api/v1/discover
   * Main discovery endpoint with natural language query
   */
  fastify.post<{ Body: DiscoveryRequest }>(
    '/api/v1/discover',
    {
      schema: {
        description: 'Discover travel destinations and experiences',
        tags: ['discovery'],
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            filters: { type: 'object' },
            preferences: { type: 'object' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: DiscoveryRequest }>, reply: FastifyReply) => {
      try {
        // Validate request
        const validated = DiscoveryRequestSchema.parse(request.body);

        logger.info('📨 API Request - Discovery Endpoint', {
          query: validated.query,
          filters: validated.filters || {},
          preferences: validated.preferences || {},
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date().toISOString()
        });

        // Execute discovery pipeline
        const result = await discoveryChain.execute(validated.query);

        // Get recommendations from knowledge graph
        // Temporarily disabled until LangGraph compatibility is fixed
        // const recommendations = await knowledgeGraph.query(result.entities);
        // result.recommendations = recommendations;

        logger.info('📤 API Response - Discovery Endpoint', {
          query: validated.query,
          totalResults: result.metadata.totalResults,
          processingTime: result.metadata.processingTime,
          cached: result.metadata.cached,
          statusCode: 200
        });

        return reply.code(200).send(result);
      } catch (error: any) {
        logger.error('❌ API Error - Discovery Endpoint', { 
          error: error.message,
          stack: error.stack,
          body: request.body
        });

        if (error.name === 'ZodError') {
          return reply.code(400).send({
            error: 'Invalid request',
            details: error.errors
          });
        }

        return reply.code(500).send({
          error: 'Discovery failed',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/entity/:id
   * Get detailed information about specific entity
   */
  fastify.get<{ Params: { id: string }; Querystring: { includeRecommendations?: boolean } }>(
    '/api/v1/entity/:id',
    {
      schema: {
        description: 'Get entity details',
        tags: ['entity'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const includeRecommendations = request.query.includeRecommendations !== false;

        logger.info('Entity detail request', { entityId: id });

        const entity = await Place.findById(id).lean();

        if (!entity) {
          return reply.code(404).send({
            error: 'Entity not found'
          });
        }

        const result: any = {
          id: entity._id.toString(),
          type: entity.type,
          title: entity.title,
          description: entity.description,
          location: entity.location,
          dates: entity.dates,
          metadata: entity.metadata,
          media: entity.media,
          source: entity.source,
          confidence: entity.confidence
        };

        if (includeRecommendations) {
          // Temporarily disabled until LangGraph compatibility is fixed
          // result.recommendations = await knowledgeGraph.getRelatedEntities(id, 10);
          result.recommendations = [];
        }

        return reply.code(200).send(result);
      } catch (error: any) {
        logger.error('Entity detail request failed:', error);
        return reply.code(500).send({
          error: 'Failed to fetch entity details',
          message: error.message
        });
      }
    }
  );

  /**
   * POST /api/v1/recommendations
   * Get personalized recommendations based on graph relationships
   */
  fastify.post<{ Body: RecommendationRequest }>(
    '/api/v1/recommendations',
    {
      schema: {
        description: 'Get personalized recommendations',
        tags: ['recommendations'],
        body: {
          type: 'object',
          required: ['baseEntity'],
          properties: {
            baseEntity: { type: 'string' },
            context: { type: 'object' },
            limit: { type: 'number' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Body: RecommendationRequest }>, reply: FastifyReply) => {
      try {
        const validated = RecommendationRequestSchema.parse(request.body);

        logger.info('Recommendation request', {
          baseEntity: validated.baseEntity
        });

        // Temporarily disabled until LangGraph compatibility is fixed
        // const recommendations = await knowledgeGraph.getRelatedEntities(
        //   validated.baseEntity,
        //   validated.limit || 10
        // );
        const recommendations: any[] = [];

        return reply.code(200).send({
          baseEntity: validated.baseEntity,
          recommendations
        });
      } catch (error: any) {
        logger.error('Recommendation request failed:', error);

        if (error.name === 'ZodError') {
          return reply.code(400).send({
            error: 'Invalid request',
            details: error.errors
          });
        }

        return reply.code(500).send({
          error: 'Failed to fetch recommendations',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/trending/:city
   * Get trending places/events for a city
   */
  fastify.get<{ Params: { city: string }; Querystring: { limit?: number } }>(
    '/api/v1/trending/:city',
    {
      schema: {
        description: 'Get trending content for a city',
        tags: ['trending'],
        params: {
          type: 'object',
          properties: {
            city: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { city } = request.params;
        const limit = request.query.limit || 20;

        logger.info('Trending request', { city });

        const trending = await Place.find({
          'location.city': new RegExp(city, 'i')
        })
          .sort({ 'metadata.popularity': -1, updatedAt: -1 })
          .limit(limit)
          .lean();

        const results = trending.map((item: any) => ({
          id: item._id.toString(),
          type: item.type,
          title: item.title,
          description: item.description.substring(0, 200),
          location: item.location,
          metadata: {
            category: item.metadata.category,
            popularity: item.metadata.popularity
          },
          media: { images: item.media.images.slice(0, 1) }
        }));

        return reply.code(200).send({
          city,
          trending: results,
          count: results.length
        });
      } catch (error: any) {
        logger.error('Trending request failed:', error);
        return reply.code(500).send({
          error: 'Failed to fetch trending content',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/search
   * Simple text search endpoint
   */
  fastify.get<{ Querystring: { q: string; limit?: number } }>(
    '/api/v1/search',
    {
      schema: {
        description: 'Text search for entities',
        tags: ['search'],
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string' },
            limit: { type: 'number' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { q, limit = 20 } = request.query;

        logger.info('Search request', { query: q });

        const results = await Place.find(
          { $text: { $search: q } },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit)
          .lean();

        const formatted = results.map((item: any) => ({
          id: item._id.toString(),
          type: item.type,
          title: item.title,
          description: item.description.substring(0, 200),
          location: item.location,
          metadata: item.metadata,
          media: { images: item.media.images.slice(0, 1) }
        }));

        return reply.code(200).send({
          query: q,
          results: formatted,
          count: formatted.length
        });
      } catch (error: any) {
        logger.error('Search request failed:', error);
        return reply.code(500).send({
          error: 'Search failed',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/health
   * Health check endpoint
   */
  fastify.get('/api/v1/health', async (request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  /**
   * GET /api/v1/stats
   * System statistics
   */
  fastify.get('/api/v1/stats', async (request, reply) => {
    try {
      const [totalPlaces, placesByType] = await Promise.all([
        Place.countDocuments(),
        Place.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      ]);

      const typeBreakdown: Record<string, number> = {};
      for (const item of placesByType) {
        typeBreakdown[item._id] = item.count;
      }

      return reply.code(200).send({
        database: {
          totalEntities: totalPlaces,
          entitiesByType: typeBreakdown
        },
        cache: {
          // Redis stats would go here
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage()
        }
      });
    } catch (error: any) {
      logger.error('Stats request failed:', error);
      return reply.code(500).send({
        error: 'Failed to fetch stats',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/admin/crawl
   * Trigger crawler job (admin endpoint)
   */
  fastify.post<{ Body: { city: string; country: string; types?: string[] } }>(
    '/api/v1/admin/crawl',
    {
      schema: {
        description: 'Trigger a crawler job',
        tags: ['admin'],
        body: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            types: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { city, country, types } = request.body;

        logger.info('Manual crawler trigger', { city, country, types });

        // Import crawler manager
        const { crawlerManager } = await import('@/crawlers');

        // Start crawling in background
        const result = await crawlerManager.crawlAndSave({
          city,
          country,
          types: types as ('events' | 'attractions')[]
        });

        return reply.code(200).send({
          status: 'completed',
          city,
          country,
          crawled: result.crawled,
          saved: result.saved
        });
      } catch (error: any) {
        logger.error('Crawler trigger failed:', error);
        return reply.code(500).send({
          error: 'Crawler failed',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/admin/crawler-stats
   * Get crawler statistics
   */
  fastify.get('/api/v1/admin/crawler-stats', async (request, reply) => {
    try {
      const { crawlerManager } = await import('@/crawlers');
      const stats = await crawlerManager.getStatistics();

      return reply.code(200).send(stats);
    } catch (error: any) {
      logger.error('Failed to get crawler stats:', error);
      return reply.code(500).send({
        error: 'Failed to fetch crawler stats',
        message: error.message
      });
    }
  });

  logger.info('API routes registered');
}
