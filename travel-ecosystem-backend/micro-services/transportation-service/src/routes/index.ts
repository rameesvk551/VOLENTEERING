/**
 * Routes registration
 */

import type { FastifyInstance } from 'fastify';
import { transportRoutes } from './transport.routes';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health check (already in index.ts, but can add more detailed checks here)
  
  // Transport routes
  await app.register(transportRoutes, { prefix: '/api/v1/transport' });
}
