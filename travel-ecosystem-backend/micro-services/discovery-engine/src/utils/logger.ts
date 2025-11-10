// Winston logger configuration
// Refactored to use constants - Follows DRY and avoids magic numbers

import winston from 'winston';
import fs from 'fs';
import {
  LOG_LEVEL_DEFAULT,
  LOG_FORMAT_DEFAULT,
  LOG_FILE_ERROR,
  LOG_FILE_COMBINED,
  LOG_FILE_MAX_SIZE_BYTES,
  LOG_FILE_MAX_FILES,
  LOG_DIR_NAME,
  SERVICE_NAME
} from '@/constants';
import { getLoggerConfig } from './env-config';

// Get logger configuration from environment with proper defaults
const { level: logLevel, format: logFormat } = getLoggerConfig();

// Define log formats - Separated concern: Format configuration
const formats = {
  json: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  pretty: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      }
    )
  )
};

// Create logger instance with centralized configuration
export const logger = winston.createLogger({
  level: logLevel,
  format: formats[logFormat as 'json' | 'pretty'] || formats.json,
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: LOG_FILE_ERROR,
      level: 'error',
      maxsize: LOG_FILE_MAX_SIZE_BYTES,
      maxFiles: LOG_FILE_MAX_FILES
    }),
    new winston.transports.File({
      filename: LOG_FILE_COMBINED,
      maxsize: LOG_FILE_MAX_SIZE_BYTES,
      maxFiles: LOG_FILE_MAX_FILES
    })
  ]
});

// Create logs directory if it doesn't exist - Separated concern: Directory setup
if (!fs.existsSync(LOG_DIR_NAME)) {
  fs.mkdirSync(LOG_DIR_NAME);
}
