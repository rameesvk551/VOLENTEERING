// Main entry point for Discovery Engine

import { startServer } from './api/server';
import { logger } from './utils/logger';

async function main() {
  try {
    logger.info('Starting Discovery Engine...');
    logger.info(`Node version: ${process.version}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    await startServer();
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
