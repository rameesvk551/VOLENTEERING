import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { Kafka, logLevel, type EachMessagePayload } from 'kafkajs';
import { HotelProvider } from './hotelProvider.js';
import { MetaSearchService } from './services/metaSearch.service.js';
import { ReservationService } from './services/reservation.service.js';
import { CacheService } from './services/cache.service.js';
import { EventEmitter } from './services/eventEmitter.service.js';
import { registerRoutes } from './routes/index.js';
import type { Hotel } from './hotelCatalog.js';

dotenv.config();

const fastify = Fastify({ 
  logger: true,
  trustProxy: true
});

// Initialize services
const eventEmitter = new EventEmitter();
const metaSearch = new MetaSearchService();
const reservationService = new ReservationService(eventEmitter);
const cache = new CacheService();
const provider = new HotelProvider();

const kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

await fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
  cache: 10000
});

// Health check
fastify.get('/health', async () => ({ 
  status: 'ok',
  service: 'hotel-discovery-booking-service',
  timestamp: new Date().toISOString(),
  circuitBreaker: provider.getCircuitBreakerState()
}));

// Legacy endpoint for backward compatibility
interface HotelQuery {
  city?: string;
  country?: string;
  limit?: string;
}

fastify.get('/hotels', async (request, reply) => {
  const { city, country, limit } = request.query as HotelQuery;

  if (!city) {
    reply.code(400);
    return { error: 'city is required' };
  }

  const hotels: Hotel[] = await provider.search({
    city,
    country,
    limit: limit ? Number(limit) : undefined
  });

  return {
    city,
    country,
    count: hotels.length,
    hotels
  };
});

// Register new routes
await registerRoutes(fastify, metaSearch, reservationService, cache);

const port = Number(process.env.PORT) || 4005;

interface HotelRequestMessage {
  correlationId?: string;
  replyTopic?: string;
  city?: string;
  country?: string;
  limit?: number;
}

async function startKafka(): Promise<void> {
  const brokers = (process.env.KAFKA_BROKERS ?? '')
    .split(',')
    .map((broker: string) => broker.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    fastify.log.warn('Kafka integration enabled but KAFKA_BROKERS is empty. Skipping Kafka consumer.');
    return;
  }

  const clientId = process.env.KAFKA_CLIENT_ID ?? 'hotel-service';
  const groupId = process.env.KAFKA_GROUP_ID ?? 'hotel-service-consumer';
  const requestTopic = process.env.HOTEL_REQUEST_TOPIC ?? 'hotel.requests';

  const kafka = new Kafka({ clientId, brokers, logLevel: logLevel.WARN });
  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId });

  await Promise.all([producer.connect(), consumer.connect()]);
  await consumer.subscribe({ topic: requestTopic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) {
        return;
      }

      let decoded: HotelRequestMessage | undefined;

      try {
        decoded = JSON.parse(message.value.toString()) as HotelRequestMessage;
        const { correlationId, replyTopic, city, country, limit } = decoded;

        if (!correlationId || !replyTopic || !city) {
          fastify.log.warn({
            msg: 'Received malformed hotel request payload, skipping.',
            correlationId,
            replyTopic
          });
          return;
        }

        const hotels = await provider.search({
          city,
          country,
          limit
        });

        const response = {
          correlationId,
          type: 'hotel',
          success: true,
          payload: hotels
        };

        await producer.send({
          topic: replyTopic,
          messages: [
            {
              key: correlationId,
              value: JSON.stringify(response)
            }
          ]
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to process Kafka hotel request');

        if (decoded?.correlationId && decoded.replyTopic) {
          await producer.send({
            topic: decoded.replyTopic,
            messages: [
              {
                key: decoded.correlationId,
                value: JSON.stringify({
                  correlationId: decoded.correlationId,
                  type: 'hotel',
                  success: false,
                  error: 'Hotel service failed to process request'
                })
              }
            ]
          });
        }
      }
    }
  });

  fastify.log.info(`Kafka consumer listening for hotel requests on topic ${requestTopic}`);
}

fastify
  .listen({ port, host: '0.0.0.0' })
  .then(async () => {
    fastify.log.info(`🏨 Hotel Discovery & Booking Service listening on port ${port}`);
    fastify.log.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect event emitter
    if (kafkaEnabled) {
      await eventEmitter.connect();
      
      startKafka().catch((error: unknown) => {
        fastify.log.error({ err: error }, 'Failed to initialize Kafka consumer');
      });
    }
  })
  .catch((error: unknown) => {
    fastify.log.error(error, 'Failed to start hotel service');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Shutting down gracefully...');
  await eventEmitter.disconnect();
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Shutting down gracefully...');
  await eventEmitter.disconnect();
  await fastify.close();
  process.exit(0);
});
