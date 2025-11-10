import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import { Kafka, logLevel, type EachMessagePayload } from 'kafkajs';
import { HotelProvider } from './hotelProvider.js';
import type { Hotel } from './hotelCatalog.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const provider = new HotelProvider();
const kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';

interface HotelQuery {
  city?: string;
  country?: string;
  limit?: string;
}

interface HotelRequestMessage {
  correlationId?: string;
  replyTopic?: string;
  city?: string;
  country?: string;
  limit?: number;
}

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.get('/hotels', async (request: FastifyRequest<{ Querystring: HotelQuery }>, reply: FastifyReply) => {
  const { city, country, limit } = request.query;

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

const port = Number(process.env.PORT) || 4002;

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
          fastify.log.warn('Received malformed hotel request payload, skipping.', {
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
  .then(() => {
    fastify.log.info(`Hotel service listening on port ${port}`);

    if (kafkaEnabled) {
      startKafka().catch((error: unknown) => {
        fastify.log.error({ err: error }, 'Failed to initialize Kafka consumer');
      });
    }
  })
  .catch((error: unknown) => {
    fastify.log.error(error, 'Failed to start hotel service');
    process.exit(1);
  });
