import { logger } from '@/utils/logger';

type EnvRecord = Record<string, string | undefined>;

const env: EnvRecord = ((globalThis as { process?: { env?: EnvRecord } }).process?.env) ?? {};

export interface KafkaTopicsConfig {
  weatherRequests: string;
  hotelRequests: string;
  visaRequests: string;
  travelDataRequests: string;
}

export interface KafkaConfig {
  enabled: boolean;
  clientId: string;
  groupId: string;
  brokers: string[];
  replyTopic: string;
  requestTimeoutMs: number;
  topics: KafkaTopicsConfig;
}

const defaultEnabled = (env.KAFKA_ENABLED ?? 'true') !== 'false';
const brokerList = (env.KAFKA_BROKERS ?? '')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

if (defaultEnabled && brokerList.length === 0) {
  logger.warn('Kafka enabled but KAFKA_BROKERS is empty; RPC client will stay disabled.');
}

export const kafkaConfig: KafkaConfig = {
  enabled: defaultEnabled && brokerList.length > 0,
  clientId: env.KAFKA_CLIENT_ID || 'discovery-engine',
  groupId: env.KAFKA_GROUP_ID || 'discovery-engine-rpc',
  brokers: brokerList,
  replyTopic: env.DISCOVERY_REPLY_TOPIC || 'discovery.responses',
  requestTimeoutMs: Number(env.KAFKA_REQUEST_TIMEOUT_MS || '8000'),
  topics: {
    weatherRequests: env.WEATHER_REQUEST_TOPIC || 'weather.requests',
    hotelRequests: env.HOTEL_REQUEST_TOPIC || 'hotel.requests',
    visaRequests: env.VISA_REQUEST_TOPIC || 'visa.requests',
    travelDataRequests: env.TRAVEL_DATA_REQUEST_TOPIC || 'travel-data.requests'
  }
};
