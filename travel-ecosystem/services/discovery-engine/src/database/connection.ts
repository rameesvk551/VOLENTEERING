// Database connection management

import mongoose from 'mongoose';
import Redis from 'ioredis';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { logger } from '@/utils/logger';

class DatabaseManager {
  private static instance: DatabaseManager;
  private mongoConnection: typeof mongoose | null = null;
  private redisClient: Redis | null = null;
  private weaviateClient: WeaviateClient | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // MongoDB Connection
  async connectMongoDB(): Promise<typeof mongoose> {
    if (this.mongoConnection) {
      return this.mongoConnection;
    }

    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_discovery';

      this.mongoConnection = await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('MongoDB connected successfully', {
        host: this.mongoConnection.connection.host,
        database: this.mongoConnection.connection.name
      });

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return this.mongoConnection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  // Redis Connection
  async connectRedis(): Promise<Redis> {
    if (this.redisClient) {
      return this.redisClient;
    }

    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.redisClient.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      this.redisClient.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      // Test connection
      await this.redisClient.ping();

      return this.redisClient;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  // Weaviate Connection
  async connectWeaviate(): Promise<WeaviateClient> {
    if (this.weaviateClient) {
      return this.weaviateClient;
    }

    try {
      const url = process.env.WEAVIATE_URL || 'http://localhost:8080';
      const apiKey = process.env.WEAVIATE_API_KEY;

      this.weaviateClient = weaviate.client({
        scheme: url.startsWith('https') ? 'https' : 'http',
        host: url.replace(/^https?:\/\//, ''),
        ...(apiKey && {
          apiKey: {
            apiKey
          }
        }),
        headers: {
          'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || ''
        }
      });

      // Test connection
      const result = await this.weaviateClient.misc.metaGetter().do();
      logger.info('Weaviate connected successfully', {
        version: result.version
      });

      return this.weaviateClient;
    } catch (error) {
      logger.error('Failed to connect to Weaviate:', error);
      throw error;
    }
  }

  // Initialize Weaviate Schema
  async initializeWeaviateSchema(): Promise<void> {
    if (!this.weaviateClient) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      // Check if schema exists
      const existingSchema = await this.weaviateClient.schema.getter().do();
      const hasClass = existingSchema.classes?.some(
        (c: any) => c.class === 'TravelContent'
      );

      if (hasClass) {
        logger.info('Weaviate schema already exists');
        return;
      }

      // Create schema
      const schema = {
        class: 'TravelContent',
        description: 'Travel places, events, festivals, and attractions',
        vectorizer: 'text2vec-openai',
        moduleConfig: {
          'text2vec-openai': {
            model: 'text-embedding-3-small',
            modelVersion: '3',
            type: 'text'
          }
        },
        properties: [
          {
            name: 'title',
            dataType: ['string'],
            description: 'Title of the content'
          },
          {
            name: 'description',
            dataType: ['string'],
            description: 'Full description'
          },
          {
            name: 'city',
            dataType: ['string'],
            description: 'City name'
          },
          {
            name: 'country',
            dataType: ['string'],
            description: 'Country name'
          },
          {
            name: 'type',
            dataType: ['string'],
            description: 'Content type (festival, attraction, etc.)'
          },
          {
            name: 'startDate',
            dataType: ['date'],
            description: 'Start date if applicable'
          },
          {
            name: 'endDate',
            dataType: ['date'],
            description: 'End date if applicable'
          },
          {
            name: 'category',
            dataType: ['string[]'],
            description: 'Categories/tags'
          },
          {
            name: 'tags',
            dataType: ['string[]'],
            description: 'Additional tags'
          },
          {
            name: 'popularity',
            dataType: ['number'],
            description: 'Popularity score 0-1'
          },
          {
            name: 'sourceUrl',
            dataType: ['string'],
            description: 'Original source URL'
          },
          {
            name: 'mongoId',
            dataType: ['string'],
            description: 'Reference to MongoDB document'
          }
        ]
      };

      await this.weaviateClient.schema.classCreator().withClass(schema).do();
      logger.info('Weaviate schema created successfully');
    } catch (error) {
      logger.error('Failed to initialize Weaviate schema:', error);
      throw error;
    }
  }

  // Connect all databases
  async connectAll(): Promise<void> {
    await Promise.all([
      this.connectMongoDB(),
      this.connectRedis(),
      this.connectWeaviate()
    ]);
    await this.initializeWeaviateSchema();
    logger.info('All database connections established');
  }

  // Convenience method for workers
  async connect(): Promise<void> {
    await this.connectAll();
  }

  // Check if connected
  isConnected(): boolean {
    return (
      this.mongoConnection !== null &&
      this.redisClient !== null &&
      this.weaviateClient !== null
    );
  }

  // Disconnect all
  async disconnectAll(): Promise<void> {
    if (this.mongoConnection) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }

    if (this.redisClient) {
      this.redisClient.disconnect();
      logger.info('Redis disconnected');
    }

    logger.info('All database connections closed');
  }

  // Convenience method
  async disconnect(): Promise<void> {
    await this.disconnectAll();
  }

  // Getters
  getMongo(): typeof mongoose {
    if (!this.mongoConnection) {
      throw new Error('MongoDB not connected');
    }
    return this.mongoConnection;
  }

  getRedis(): Redis {
    if (!this.redisClient) {
      throw new Error('Redis not connected');
    }
    return this.redisClient;
  }

  getWeaviate(): WeaviateClient {
    if (!this.weaviateClient) {
      throw new Error('Weaviate not connected');
    }
    return this.weaviateClient;
  }
}

export const dbManager = DatabaseManager.getInstance();
