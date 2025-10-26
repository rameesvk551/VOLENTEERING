// Simplified server for development without full dependencies
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

// Simple logger
const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args)
};

// Mock discovery data generator
function generateMockDiscoveryData(query: string) {
  const cities = ['Paris', 'Tokyo', 'New York', 'London', 'Barcelona', 'Dubai', 'Singapore', 'Rome', 'Bali', 'Sydney'];
  const countries = ['France', 'Japan', 'USA', 'UK', 'Spain', 'UAE', 'Singapore', 'Italy', 'Indonesia', 'Australia'];
  const categories = ['Cultural', 'Adventure', 'Beach', 'Historical', 'Modern', 'Nature'];
  
  const results = cities.map((city, index) => ({
    id: `dest-${index + 1}`,
    type: 'attraction' as const,
    title: city,
    description: `Discover the amazing ${city}! Experience world-class attractions, vibrant culture, and unforgettable memories in one of the world's most popular destinations.`,
    location: {
      city: city,
      country: countries[index],
      coordinates: { 
        lat: 40.7128 + (Math.random() * 40 - 20), 
        lng: -74.0060 + (Math.random() * 180 - 90) 
      }
    },
    metadata: {
      category: [categories[index % categories.length]],
      tags: ['popular', 'must-visit', 'tourist-friendly', 'photo-worthy'],
      popularity: 8 + Math.random() * 2,
      cost: `$${1000 + Math.floor(Math.random() * 3000)} - $${3000 + Math.floor(Math.random() * 3000)}`,
      duration: `${3 + Math.floor(Math.random() * 7)} days`
    },
    media: {
      images: [
        `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`,
        `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}`
      ]
    }
  }));

  return {
    query,
    entities: {
      city: 'Global',
      interests: ['travel', 'tourism', 'exploration'],
      eventType: []
    },
    summary: {
      headline: `Top Travel Destinations`,
      overview: `Explore amazing destinations around the world. From bustling cities to serene beaches, discover your next adventure.`,
      highlights: [
        'World-class attractions',
        'Rich cultural experiences',
        'Diverse cuisine options',
        'Photo-worthy locations',
        'Something for every traveler'
      ],
      bestTime: 'Year-round',
      tips: [
        'Book accommodations in advance',
        'Check visa requirements',
        'Learn basic local phrases',
        'Pack according to season'
      ]
    },
    results: {
      festivals: [],
      attractions: results.slice(0, 8),
      places: results.slice(8, 16),
      events: []
    },
    recommendations: [],
    metadata: {
      totalResults: results.length,
      processingTime: 450,
      cached: false,
      sources: ['Mock Data Provider']
    }
  };
}

async function startSimpleServer() {
  try {
    const fastify = Fastify({
      logger: false,
      trustProxy: true
    });

    // Register CORS
    await fastify.register(cors, {
      origin: '*',
      credentials: true
    });

    // Health check
    fastify.get('/health', async () => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: 'simple',
        message: 'Discovery Engine running in development mode'
      };
    });

    // Main discovery endpoint
    fastify.post('/api/v1/discover', async (request, reply) => {
      try {
        const { query, filters } = request.body as any;
        
        logger.info('Discovery request received', { query, filters });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = generateMockDiscoveryData(query);
        
        return reply.code(200).send(result);
      } catch (error: any) {
        logger.error('Discovery error', { error: error.message });
        return reply.code(500).send({
          error: 'Discovery failed',
          message: error.message
        });
      }
    });

    // Entity details endpoint
    fastify.get('/api/v1/entity/:id', async (request, reply) => {
      const { id } = request.params as any;
      
      return reply.code(200).send({
        id,
        type: 'attraction',
        title: 'Sample Destination',
        description: 'Detailed information about this destination',
        location: {
          city: 'Sample City',
          country: 'Sample Country',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        metadata: {
          category: ['Cultural'],
          tags: ['popular', 'must-visit'],
          popularity: 8.5,
          cost: '$2000-4000',
          duration: '5-7 days'
        },
        media: {
          images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34']
        }
      });
    });

    // Trending endpoint
    fastify.get('/api/v1/trending/:city', async (request, reply) => {
      const { city } = request.params as any;
      const { limit = 10 } = request.query as any;
      
      const trending = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `trending-${i + 1}`,
        title: `Trending Place ${i + 1} in ${city}`,
        score: 9 - (i * 0.1)
      }));
      
      return reply.code(200).send({ trending });
    });

    // Error handler
    fastify.setErrorHandler((error, request, reply) => {
      logger.error('Request error:', {
        error: error.message,
        url: request.url,
        method: request.method
      });

      reply.status(error.statusCode || 500).send({
        error: error.name,
        message: error.message
      });
    });

    await fastify.listen({ port: PORT, host: HOST });

    logger.info(`🚀 Simple Discovery Engine running on http://${HOST}:${PORT}`);
    logger.info('📝 Mode: Development (Using mock data)');
    logger.info('💡 Tip: Configure .env with real API keys for full functionality');

    return fastify;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if run directly
startSimpleServer();
