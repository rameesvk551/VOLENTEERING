import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import { Kafka, logLevel, type EachMessagePayload } from 'kafkajs';
import { TravelProvider } from './travelProvider.js';
import type { LocalExperience, TravelArticle, TravelTip } from './staticData.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const provider = new TravelProvider();
const kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';

interface ArticleQuery {
  city?: string;
  country?: string;
  limit?: string;
}

interface TipsQuery {
  city?: string;
  country?: string;
}

interface ExperienceQuery {
  city?: string;
  country?: string;
  type?: string;
}

type TravelResource = 'articles' | 'tips' | 'experiences';

interface TravelDataRequestMessage {
  correlationId?: string;
  replyTopic?: string;
  resource?: TravelResource;
  city?: string;
  country?: string;
  limit?: number;
  type?: string;
}

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.get('/articles', async (request: FastifyRequest<{ Querystring: ArticleQuery }>, reply: FastifyReply) => {
  const { city, country, limit } = request.query;

  if (!city || !country) {
    reply.code(400);
    return { error: 'city and country are required' };
  }

  const articles: TravelArticle[] = await provider.getArticles({
    city,
    country,
    limit: limit ? Number(limit) : undefined
  });

  return {
    city,
    country,
    count: articles.length,
    articles
  };
});

fastify.get('/tips', async (request: FastifyRequest<{ Querystring: TipsQuery }>, reply: FastifyReply) => {
  const { city, country } = request.query;

  if (!city || !country) {
    reply.code(400);
    return { error: 'city and country are required' };
  }

  const data: TravelTip[] = provider.getTips(city, country);
  return {
    city,
    country,
    count: data.length,
    tips: data
  };
});

fastify.get('/experiences', async (request: FastifyRequest<{ Querystring: ExperienceQuery }>, reply: FastifyReply) => {
  const { city, country, type } = request.query;

  if (!city || !country) {
    reply.code(400);
    return { error: 'city and country are required' };
  }

  const data: LocalExperience[] = provider.getExperiences({ city, country, type });
  return {
    city,
    country,
    count: data.length,
    experiences: data
  };
});

const port = Number(process.env.PORT) || 4004;

async function startKafka(): Promise<void> {
  const brokers = (process.env.KAFKA_BROKERS ?? '')
    .split(',')
    .map((broker: string) => broker.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    fastify.log.warn('Kafka integration enabled but KAFKA_BROKERS is empty. Skipping Kafka consumer.');
    return;
  }

  const clientId = process.env.KAFKA_CLIENT_ID ?? 'travel-data-service';
  const groupId = process.env.KAFKA_GROUP_ID ?? 'travel-data-service-consumer';
  const requestTopic = process.env.TRAVEL_DATA_REQUEST_TOPIC ?? 'travel-data.requests';

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

      let decoded: TravelDataRequestMessage | undefined;

      try {
        decoded = JSON.parse(message.value.toString()) as TravelDataRequestMessage;
        const { correlationId, replyTopic, resource, city, country, limit, type } = decoded;

        if (!correlationId || !replyTopic || !resource || !city || !country) {
          fastify.log.warn('Received malformed travel-data request payload, skipping.', {
            correlationId,
            replyTopic,
            resource
          });
          return;
        }

        let payload: TravelArticle[] | TravelTip[] | LocalExperience[];

        switch (resource) {
          case 'articles':
            payload = await provider.getArticles({ city, country, limit });
            break;
          case 'tips':
            payload = provider.getTips(city, country);
            break;
          case 'experiences':
            payload = provider.getExperiences({ city, country, type });
            break;
          default:
            await producer.send({
              topic: replyTopic,
              messages: [
                {
                  key: correlationId,
                  value: JSON.stringify({
                    correlationId,
                    type: 'travel-data',
                    success: false,
                    error: `Unsupported resource: ${resource}`
                  })
                }
              ]
            });
            return;
        }

        await producer.send({
          topic: replyTopic,
          messages: [
            {
              key: correlationId,
              value: JSON.stringify({
                correlationId,
                type: resource,
                success: true,
                payload
              })
            }
          ]
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to process Kafka travel-data request');

        if (decoded?.correlationId && decoded.replyTopic) {
          await producer.send({
            topic: decoded.replyTopic,
            messages: [
              {
                key: decoded.correlationId,
                value: JSON.stringify({
                  correlationId: decoded.correlationId,
                  type: decoded.resource ?? 'travel-data',
                  success: false,
                  error: 'Travel data service failed to process request'
                })
              }
            ]
          });
        }
      }
    }
  });

  fastify.log.info(`Kafka consumer listening for travel data requests on topic ${requestTopic}`);
}

fastify
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    fastify.log.info(`Travel data service listening on port ${port}`);

    if (kafkaEnabled) {
      startKafka().catch((error: unknown) => {
        fastify.log.error({ err: error }, 'Failed to initialize Kafka consumer');
      });
    }
  })
  .catch((error: unknown) => {
    fastify.log.error(error, 'Failed to start travel data service');
    process.exit(1);
  });
