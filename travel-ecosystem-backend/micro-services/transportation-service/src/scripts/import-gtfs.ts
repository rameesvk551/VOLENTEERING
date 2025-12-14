/**
 * Script to import GTFS feed
 * Usage: npm run gtfs:import
 */

import { gtfsService } from '../services/gtfs.service';
import { config } from '../config';
import { logger } from '../utils/logger';
import { testConnection, ensurePostGIS, closePool } from '../database/connection';
import { closeRedis } from '../cache/redis';

async function main() {
  try {
    logger.info('Starting GTFS import script');

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      logger.error('Database connection failed');
      process.exit(1);
    }

    // Ensure PostGIS is enabled
    await ensurePostGIS();

    // Import feeds
    for (const feedUrl of config.gtfsFeedUrls) {
      logger.info({ feedUrl }, 'Importing GTFS feed');
      await gtfsService.importFeed(feedUrl);
    }

    logger.info('All GTFS feeds imported successfully');
  } catch (err) {
    logger.error({ err }, 'GTFS import failed');
    process.exit(1);
  } finally {
    await closePool();
    await closeRedis();
  }
}

main();
