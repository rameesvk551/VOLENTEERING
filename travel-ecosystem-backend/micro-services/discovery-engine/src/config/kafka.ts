// Kafka configuration - Refactored to use centralized utilities
// Follows DRY principle by using shared environment config utilities

import { logger } from '@/utils/logger';
import {
  getEnvVar,
  isKafkaEnabled,
  getKafkaBrokers,
  getKafkaTopics,
  getKafkaTimeout
} from '@/utils/env-config';
import {
  KAFKA_DEFAULT_CLIENT_ID,
  KAFKA_DEFAULT_RPC_GROUP_ID
} from '@/constants';

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

// Check Kafka availability - Simplified using utility functions
const kafkaEnabled = isKafkaEnabled();
const brokerList = getKafkaBrokers();

// Warn if Kafka is enabled but no brokers configured
if (kafkaEnabled && brokerList.length === 0) {
  logger.warn('Kafka enabled but KAFKA_BROKERS is empty; RPC client will stay disabled.');
}

// Get Kafka topics configuration
const topics = getKafkaTopics();

// Build Kafka configuration object - All values from centralized utilities
export const kafkaConfig: KafkaConfig = {
  enabled: kafkaEnabled && brokerList.length > 0,
  clientId: getEnvVar('KAFKA_CLIENT_ID', KAFKA_DEFAULT_CLIENT_ID),
  groupId: getEnvVar('KAFKA_GROUP_ID', KAFKA_DEFAULT_RPC_GROUP_ID),
  brokers: brokerList,
  replyTopic: topics.discoveryResponses,
  requestTimeoutMs: getKafkaTimeout(),
  topics: {
    weatherRequests: topics.weatherRequests,
    hotelRequests: topics.hotelRequests,
    visaRequests: topics.visaRequests,
    travelDataRequests: topics.travelDataRequests
  }
};
