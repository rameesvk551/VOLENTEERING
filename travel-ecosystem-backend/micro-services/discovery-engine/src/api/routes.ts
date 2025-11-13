// API Routes for Discovery Engine - NO AI, ONLY API ORCHESTRATION
// Refactored to use constants and helper functions - Follows DRY and SoC principles

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DiscoveryOrchestrator } from '@/orchestrator/discovery.orchestrator';
import { Place } from '@/database/models';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import {
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_SERVER_ERROR,
  DEFAULT_HOTEL_LIMIT,
  DEFAULT_ARTICLE_LIMIT,
  DEFAULT_TRENDING_LIMIT,
  DEFAULT_SEARCH_LIMIT,
  MAX_DESCRIPTION_LENGTH
} from '@/constants';
import { truncateDescription } from '@/utils/data-transformers';

// Request validation schemas - Simplified for direct API calls
const DiscoveryRequestSchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  month: z.string().optional(),
  interests: z.array(z.string()).optional(),
  duration: z.number().optional(),
  fromCountryCode: z.string().length(2).optional() // For visa requirements (e.g., 'US', 'IN')
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
  const orchestrator = new DiscoveryOrchestrator();
  await orchestrator.initialize();

  /**
   * POST /api/v1/discover
   * Main discovery endpoint - Orchestrates multiple API calls
   * Returns: Attractions, Weather, Hotels, Visa Info, Travel Data
   */
  fastify.post(
    '/api/v1/discover',
    {
      schema: {
        description: 'Discover travel information: attractions, weather, hotels, visa, travel data',
        tags: ['discovery'],
        body: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string', description: 'City name (e.g., "Delhi", "Paris")' },
            country: { type: 'string', description: 'Country name (e.g., "India", "France")' },
            month: { type: 'string', description: 'Optional month (e.g., "October")' },
            interests: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Optional interests (e.g., ["food", "culture", "history"])'
            },
            duration: { type: 'number', description: 'Optional trip duration in days' },
            fromCountryCode: { 
              type: 'string', 
              description: 'Optional 2-letter country code for visa check (e.g., "US", "IN")'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              query: { type: 'object' },
              attractions: { type: 'array' },
              weather: { type: 'object' },
              visa: { type: 'object' },
              hotels: { type: 'array' },
              travelData: { type: 'object' },
              metadata: { type: 'object' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        // Validate request
        const validated = DiscoveryRequestSchema.parse(request.body);

        logger.info('📨 API Request - Discovery Orchestrator', {
          city: validated.city,
          country: validated.country,
          interests: validated.interests || [],
          fromCountry: validated.fromCountryCode,
          ip: request.ip,
          timestamp: new Date().toISOString()
        });

        // Execute orchestrator - fetches from all APIs
        const result = await orchestrator.discover(validated);

        logger.info('📤 API Response - Discovery Orchestrator', {
          city: validated.city,
          attractions: result.attractions.length,
          hotels: result.hotels.length,
          hasWeather: !!result.weather,
          hasVisa: !!result.visa,
          processingTime: result.metadata.processingTime,
          sources: result.metadata.sources,
          statusCode: 200
        });

        return reply.code(HTTP_STATUS_OK).send(result);
      } catch (error: any) {
        logger.error('❌ API Error - Discovery Orchestrator', { 
          error: error.message,
          stack: error.stack,
          body: request.body
        });

        if (error.name === 'ZodError') {
          return reply.code(HTTP_STATUS_BAD_REQUEST).send({
            error: 'Invalid request',
            details: error.errors
          });
        }

        return reply.code(HTTP_STATUS_SERVER_ERROR).send({
          error: 'Discovery orchestration failed',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/attractions
   * Get attractions for a city using Google Places API
   */
  fastify.get(
    '/api/v1/attractions',
    {
      schema: {
        description: 'Get real attractions from Google Places',
        tags: ['attractions'],
        querystring: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            interests: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country, interests } = request.query;
        logger.info('Attractions request', { city, country });

        const { GooglePlacesService } = await import('@/services/google-places.service');
        const placesService = new GooglePlacesService();
        
        const attractions = await placesService.getPopularAttractions(city, country);
        const all = [...attractions.monuments, ...attractions.museums, ...attractions.parks, ...attractions.religious];

        return reply.code(200).send({ city, country, attractions: all, count: all.length });
      } catch (error: any) {
        logger.error('Attractions request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch attractions', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/weather
   * Get weather data for a city
   */
  fastify.get(
    '/api/v1/weather',
    {
      schema: {
        description: 'Get weather data from OpenWeather API',
        tags: ['weather'],
        querystring: {
          type: 'object',
          required: ['city'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country } = request.query;
        logger.info('Weather request', { city, country });

        const { WeatherService } = await import('@/services/weather.service');
        const weatherService = new WeatherService();
        
        const weather = await weatherService.getWeatherData(city, country);

        if (!weather) {
          return reply.code(404).send({ error: 'Weather data not found' });
        }

        return reply.code(200).send(weather);
      } catch (error: any) {
        logger.error('Weather request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch weather', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/visa
   * Get visa requirements
   */
  fastify.get(
    '/api/v1/visa',
    {
      schema: {
        description: 'Get visa requirements',
        tags: ['visa'],
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', description: 'From country code (e.g., US, IN)' },
            to: { type: 'string', description: 'To country code (e.g., IN, FR)' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { from, to } = request.query;
        logger.info('Visa request', { from, to });

        const { VisaService } = await import('@/services/visa.service');
        const visaService = new VisaService();
        
        const visa = await visaService.getVisaRequirements(from, to);

        if (!visa) {
          return reply.code(404).send({ error: 'Visa information not found' });
        }

        return reply.code(200).send(visa);
      } catch (error: any) {
        logger.error('Visa request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch visa info', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/hotels
   * Get hotels for a city
   */
  fastify.get(
    '/api/v1/hotels',
    {
      schema: {
        description: 'Get hotel listings',
        tags: ['hotels'],
        querystring: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            limit: { type: 'number' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country, limit } = request.query;
        logger.info('Hotels request', { city, country });

        const { HotelService } = await import('@/services/hotel.service');
        const hotelService = new HotelService();
        
        const hotels = await hotelService.searchHotels(city, country, { limit: limit || 10 });

        return reply.code(200).send({ city, country, hotels, count: hotels.length });
      } catch (error: any) {
        logger.error('Hotels request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch hotels', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/travel-articles
   * Get travel articles and guides
   */
  fastify.get(
    '/api/v1/travel-articles',
    {
      schema: {
        description: 'Get travel articles and guides',
        tags: ['travel-data'],
        querystring: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            limit: { type: 'number' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country, limit } = request.query;
        logger.info('Travel articles request', { city, country });

        const { TravelCrawlerService } = await import('@/services/travel-crawler.service');
        const crawlerService = new TravelCrawlerService();
        
        const articles = await crawlerService.crawlTravelArticles(city, country, { limit: limit || 10 });

        return reply.code(200).send({ city, country, articles, count: articles.length });
      } catch (error: any) {
        logger.error('Travel articles request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch articles', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/travel-tips
   * Get travel tips
   */
  fastify.get(
    '/api/v1/travel-tips',
    {
      schema: {
        description: 'Get travel tips for a destination',
        tags: ['travel-data'],
        querystring: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country } = request.query;
        logger.info('Travel tips request', { city, country });

        const { TravelCrawlerService } = await import('@/services/travel-crawler.service');
        const crawlerService = new TravelCrawlerService();
        
        const tips = await crawlerService.getTravelTips(city, country);

        return reply.code(200).send({ city, country, tips, count: tips.length });
      } catch (error: any) {
        logger.error('Travel tips request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch tips', message: error.message });
      }
    }
  );

  /**
   * GET /api/v1/local-experiences
   * Get local experiences and activities
   */
  fastify.get(
    '/api/v1/local-experiences',
    {
      schema: {
        description: 'Get local experiences and activities',
        tags: ['travel-data'],
        querystring: {
          type: 'object',
          required: ['city', 'country'],
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            type: { type: 'string', description: 'food, activity, cultural, shopping' }
          }
        }
      }
    },
    async (request: any, reply) => {
      try {
        const { city, country, type } = request.query;
        logger.info('Local experiences request', { city, country, type });

        const { TravelCrawlerService } = await import('@/services/travel-crawler.service');
        const crawlerService = new TravelCrawlerService();
        
        const experiences = await crawlerService.getLocalExperiences(city, country, type);

        return reply.code(200).send({ city, country, experiences, count: experiences.length });
      } catch (error: any) {
        logger.error('Local experiences request failed:', error);
        return reply.code(500).send({ error: 'Failed to fetch experiences', message: error.message });
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
