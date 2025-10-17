import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  mongodbUri: string;
  mongodbTestUri: string;

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // External APIs
  externalApis: {
    iata: {
      apiKey: string;
      endpoint: string;
    };
    restCountries: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // CORS
  corsOrigin: string[];

  // Logging
  logging: {
    level: string;
    file: string;
  };

  // Notifications
  notifications: {
    serviceUrl: string;
    apiKey: string;
  };
}

const config: EnvConfig = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-explore',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/visa-explore-test',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  externalApis: {
    iata: {
      apiKey: process.env.IATA_TIMATIC_API_KEY || '',
      endpoint: process.env.IATA_TIMATIC_ENDPOINT || 'https://api.iata.org/timatic/v1',
    },
    restCountries: process.env.REST_COUNTRIES_API || 'https://restcountries.com/v3.1',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  notifications: {
    serviceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5002/api/notifications',
    apiKey: process.env.NOTIFICATION_API_KEY || '',
  },
};

export default config;
