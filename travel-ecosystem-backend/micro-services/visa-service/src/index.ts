import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import { Kafka, logLevel, type EachMessagePayload } from 'kafkajs';
import { VisaProvider } from './visaProvider.js';
import type { VisaInfo } from './visaCatalog.js';

dotenv.config();

const fastify = Fastify({ logger: true });
const provider = new VisaProvider();
const kafkaEnabled = (process.env.KAFKA_ENABLED ?? 'true') !== 'false';

interface VisaQuery {
  from?: string;
  to?: string;
}

interface BulkVisaBody {
  from: string;
  destinations: string[];
}

fastify.get('/health', async () => ({ status: 'ok' }));

interface VisaRequestMessage {
  correlationId?: string;
  replyTopic?: string;
  from?: string;
  to?: string;
}

fastify.get('/visa', async (request: FastifyRequest<{ Querystring: VisaQuery }>, reply: FastifyReply) => {
  const { from, to } = request.query;

  if (!from || !to) {
    reply.code(400);
    return { error: 'from and to are required' };
  }

  const info: VisaInfo = await provider.getVisa(from, to);
  return info;
});

fastify.post('/visa/bulk', async (request: FastifyRequest<{ Body: BulkVisaBody }>, reply: FastifyReply) => {
  const { from, destinations } = request.body;

  if (!from || !Array.isArray(destinations) || destinations.length === 0) {
    reply.code(400);
    return { error: 'from and destinations are required' };
  }

  const infos = await provider.bulk(from, destinations);
  return {
    from,
    destinations,
    results: infos
  };
});

const port = Number(process.env.PORT) || 4003;

async function startKafka(): Promise<void> {
  const brokers = (process.env.KAFKA_BROKERS ?? '')
    .split(',')
    .map((broker: string) => broker.trim())
    .filter(Boolean);

  if (brokers.length === 0) {
    fastify.log.warn('Kafka integration enabled but KAFKA_BROKERS is empty. Skipping Kafka consumer.');
    return;
  }

  const clientId = process.env.KAFKA_CLIENT_ID ?? 'visa-service';
  const groupId = process.env.KAFKA_GROUP_ID ?? 'visa-service-consumer';
  const requestTopic = process.env.VISA_REQUEST_TOPIC ?? 'visa.requests';

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

      let decoded: VisaRequestMessage | undefined;

      try {
        decoded = JSON.parse(message.value.toString()) as VisaRequestMessage;
        const { correlationId, replyTopic, from, to } = decoded;

        if (!correlationId || !replyTopic || !from || !to) {
          fastify.log.warn('Received malformed visa request payload, skipping.', {
            correlationId,
            replyTopic
          });
          return;
        }

        const info = await provider.getVisa(from, to);

        const response = {
          correlationId,
          type: 'visa',
          success: true,
          payload: info
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
        fastify.log.error({ err: error }, 'Failed to process Kafka visa request');

        if (decoded?.correlationId && decoded.replyTopic) {
          await producer.send({
            topic: decoded.replyTopic,
            messages: [
              {
                key: decoded.correlationId,
                value: JSON.stringify({
                  correlationId: decoded.correlationId,
                  type: 'visa',
                  success: false,
                  error: 'Visa service failed to process request'
                })
              }
            ]
          });
        }
      }
    }
  });

  fastify.log.info(`Kafka consumer listening for visa requests on topic ${requestTopic}`);
}

fastify
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    fastify.log.info(`Visa service listening on port ${port}`);

    if (kafkaEnabled) {
      startKafka().catch((error: unknown) => {
        fastify.log.error({ err: error }, 'Failed to initialize Kafka consumer');
      });
    }
  })
  .catch((error: unknown) => {
    fastify.log.error(error, 'Failed to start visa service');
    process.exit(1);
  });
