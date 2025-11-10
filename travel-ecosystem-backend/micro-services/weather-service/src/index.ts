import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import { Kafka, logLevel, type EachMessagePayload } from 'kafkajs';
import { WeatherProvider, type WeatherPayload } from './weatherProvider.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

const provider = new WeatherProvider();
const kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';

fastify.get('/health', async () => ({ status: 'ok' }));

interface WeatherQuery {
  city?: string;
  country?: string;
}

interface WeatherRequestMessage {
  correlationId?: string;
  replyTopic?: string;
  city?: string;
  country?: string;
}

fastify.get('/weather', async (request: FastifyRequest<{ Querystring: WeatherQuery }>, reply: FastifyReply) => {
  const { city, country } = request.query;

  if (!city) {
    reply.code(400);
    return { error: 'city is required' };
  }

  const data: WeatherPayload | null = await provider.getWeather(city, country);

  if (!data) {
    reply.code(502);
    return { error: 'Failed to fetch weather data' };
  }

  return data;
});

const port = Number(process.env.PORT) || 4001;

async function startKafka(): Promise<void> {
  const brokers = (process.env.KAFKA_BROKERS ?? '')
    .split(',')
    .map((broker: string) => broker.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    fastify.log.warn('Kafka integration enabled but KAFKA_BROKERS is empty. Skipping Kafka consumer.');
    return;
  }

  const clientId = process.env.KAFKA_CLIENT_ID ?? 'weather-service';
  const groupId = process.env.KAFKA_GROUP_ID ?? 'weather-service-consumer';
  const requestTopic = process.env.WEATHER_REQUEST_TOPIC ?? 'weather.requests';

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

      let decoded: WeatherRequestMessage | undefined;

      try {
        decoded = JSON.parse(message.value.toString()) as WeatherRequestMessage;
        const { correlationId, replyTopic, city, country } = decoded;

        if (!correlationId || !replyTopic || !city) {
          fastify.log.warn('Received malformed weather request payload, skipping.', {
            correlationId,
            replyTopic
          });
          return;
        }

        const payload = await provider.getWeather(city, country);

        const response = {
          correlationId,
          type: 'weather',
          success: Boolean(payload),
          payload,
          error: payload ? undefined : 'Failed to fetch weather data'
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
        fastify.log.error({ err: error }, 'Failed to process Kafka weather request');

        if (decoded?.correlationId && decoded.replyTopic) {
          await producer.send({
            topic: decoded.replyTopic,
            messages: [
              {
                key: decoded.correlationId,
                value: JSON.stringify({
                  correlationId: decoded.correlationId,
                  type: 'weather',
                  success: false,
                  error: 'Weather service failed to process request'
                })
              }
            ]
          });
        }
      }
    }
  });

  fastify.log.info(`Kafka consumer listening for weather requests on topic ${requestTopic}`);
}

fastify
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    fastify.log.info(`Weather service listening on port ${port}`);

    if (kafkaEnabled) {
      startKafka().catch((error: unknown) => {
        fastify.log.error({ err: error }, 'Failed to initialize Kafka consumer');
      });
    }
  })
  .catch((error: unknown) => {
    fastify.log.error(error, 'Failed to start weather service');
    process.exit(1);
  });
