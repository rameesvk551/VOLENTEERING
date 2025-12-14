/**
 * PostgreSQL connection pool
 */

import { Pool } from 'pg';
import { config } from '@/config';
import { logger } from '@/utils/logger';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.databasePoolSize,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
  process.exit(-1);
});

// Enable PostGIS extension
export async function ensurePostGIS(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    logger.info('PostGIS extension enabled');
  } catch (err) {
    logger.error({ err }, 'Failed to enable PostGIS');
    throw err;
  } finally {
    client.release();
  }
}

// Test connection with ping
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW() as now');
    logger.info({ time: result.rows[0].now }, 'Database connection successful');
    return true;
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  logger.info('Database pool closed');
}
