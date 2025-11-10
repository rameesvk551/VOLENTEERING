import { randomUUID } from 'crypto';
import { Kafka, logLevel, type Consumer, type EachMessagePayload, type Producer } from 'kafkajs';
import { kafkaConfig } from '@/config/kafka';
import { logger } from '@/utils/logger';

interface PendingRequest {
  responseType: string;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

interface KafkaResponseMessage<T = unknown> {
  correlationId: string;
  type?: string;
  success: boolean;
  payload?: T;
  error?: string;
}

export class KafkaRpcClient {
  private enabled = kafkaConfig.enabled;
  private kafka?: Kafka;
  private producer?: Producer;
  private consumer?: Consumer;
  private setupPromise: Promise<void> | null = null;
  private readonly pending = new Map<string, PendingRequest>();

  isEnabled(): boolean {
    return this.enabled;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await this.ensureClient();
  }

  async sendRequest<T>(topic: string, payload: Record<string, unknown>, responseType: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      await this.ensureClient();
    } catch (error) {
      logger.error('Failed to prepare Kafka RPC client', error);
      return null;
    }

    if (!this.producer) {
      logger.warn('Kafka producer not available, request aborted', { topic });
      return null;
    }

    const correlationId = randomUUID();

    const message = {
      ...payload,
      correlationId,
      replyTopic: kafkaConfig.replyTopic
    };

    return await new Promise<T | null>((resolve) => {
      const timeout = setTimeout(() => {
        this.pending.delete(correlationId);
        logger.warn('Kafka RPC request timed out', { topic, correlationId, responseType });
        resolve(null);
      }, kafkaConfig.requestTimeoutMs);

      this.pending.set(correlationId, {
        responseType,
        resolve: (value: unknown) => {
          clearTimeout(timeout);
          resolve((value ?? null) as T | null);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          logger.error('Kafka RPC response reported failure', {
            topic,
            correlationId,
            responseType,
            error: error.message
          });
          resolve(null);
        },
        timeout
      });

      this.producer!
        .send({
          topic,
          messages: [
            {
              key: correlationId,
              value: JSON.stringify(message)
            }
          ]
        })
        .catch((error: unknown) => {
          clearTimeout(timeout);
          this.pending.delete(correlationId);
          logger.error('Failed to publish Kafka RPC request', {
            topic,
            correlationId,
            responseType,
            error
          });
          resolve(null);
        });
    });
  }

  private async ensureClient(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    if (this.setupPromise) {
      await this.setupPromise;
      return;
    }

    this.setupPromise = this.setup();

    try {
      await this.setupPromise;
    } catch (error) {
      this.setupPromise = null;
      this.enabled = false;
      throw error;
    }
  }

  private async setup(): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const { brokers, clientId, groupId, replyTopic } = kafkaConfig;

    if (brokers.length === 0) {
      logger.warn('Kafka RPC disabled because no brokers are configured.');
      this.enabled = false;
      return;
    }

    this.kafka = new Kafka({ clientId, brokers, logLevel: logLevel.WARN });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId });

    await Promise.all([this.producer.connect(), this.consumer.connect()]);

    await this.consumer.subscribe({ topic: replyTopic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) {
          return;
        }

        try {
          const decoded = JSON.parse(message.value.toString()) as KafkaResponseMessage;

          if (!decoded.correlationId) {
            logger.warn('Kafka RPC response missing correlationId, ignoring message.');
            return;
          }

          const pending = this.pending.get(decoded.correlationId);

          if (!pending) {
            logger.warn('No pending Kafka RPC handler for response', {
              correlationId: decoded.correlationId,
              responseType: decoded.type
            });
            return;
          }

          this.pending.delete(decoded.correlationId);

          if (decoded.success) {
            pending.resolve(decoded.payload ?? null);
          } else {
            pending.reject(new Error(decoded.error ?? 'Kafka RPC request failed.'));
          }
        } catch (error) {
          logger.error('Failed to process Kafka RPC response', error);
        }
      }
    });

    logger.info('Kafka RPC client ready', {
      brokers,
      replyTopic
    });
  }
}

export const kafkaRpcClient = new KafkaRpcClient();
