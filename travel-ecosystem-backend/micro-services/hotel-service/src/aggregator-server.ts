import Fastify from 'fastify';
import dotenv from 'dotenv';
import { ProviderA } from './providers/ProviderA.js';
import { ProviderB } from './providers/ProviderB.js';
import { ProviderC } from './providers/ProviderC.js';
import { AggregatorService } from './services/AggregatorService.js';
import { registerHotelRoutes } from './api/routes.js';

// Load environment variables
dotenv.config();

/**
 * Hotel Aggregation Service - Main Entry Point
 * 
 * This is a clean, scalable MVP implementation that demonstrates:
 * ✅ Fetching from multiple providers
 * ✅ Normalization of different schemas
 * ✅ Deduplication using (name + lat + lng)
 * ✅ Ranking by price (ASC) and rating (DESC)
 * ✅ Cursor-based pagination
 * ✅ SOLID principles
 * ✅ Clean architecture
 * 
 * 🚀 SCALABILITY NOTES:
 * This MVP is designed to scale from 3 providers to 100+ providers.
 * 
 * To scale this service, you would:
 * 
 * 1. DISTRIBUTED FETCHING (Kafka/Redis Queue)
 *    - Move provider fetching to worker processes
 *    - Use message queue (Kafka/Redis) for job distribution
 *    - Workers consume jobs and fetch from providers in parallel
 *    - Results are published back to aggregator via queue
 * 
 * 2. CACHING LAYER (Redis)
 *    - Cache search results for 5-15 minutes
 *    - Use location + dates as cache key
 *    - Implement cache warming for popular searches
 *    - Use Redis Cluster for high availability
 * 
 * 3. RATE LIMITING & CIRCUIT BREAKERS
 *    - Implement per-provider rate limiting
 *    - Add circuit breaker pattern (Hystrix, Resilience4j)
 *    - Graceful degradation when providers fail
 *    - Fallback to cached data
 * 
 * 4. DATABASE & INDEXING
 *    - Store provider mappings in PostgreSQL
 *    - Index hotels in ElasticSearch for advanced filtering
 *    - Use Redis for real-time inventory
 *    - Implement data pipelines for batch updates
 * 
 * 5. STREAMING & REAL-TIME UPDATES
 *    - Use Server-Sent Events (SSE) for progressive results
 *    - WebSocket connections for real-time price updates
 *    - gRPC streaming for internal service communication
 * 
 * 6. MONITORING & OBSERVABILITY
 *    - Distributed tracing (OpenTelemetry, Jaeger)
 *    - Metrics collection (Prometheus + Grafana)
 *    - Logging aggregation (ELK stack)
 *    - Alerting (PagerDuty, Opsgenie)
 *    - Error tracking (Sentry)
 * 
 * 7. INFRASTRUCTURE
 *    - Kubernetes for container orchestration
 *    - Horizontal pod autoscaling based on CPU/memory
 *    - Load balancing (NGINX, AWS ALB)
 *    - CDN for static assets
 *    - Multi-region deployment for global coverage
 * 
 * 8. ADVANCED FEATURES
 *    - ML-based personalized ranking
 *    - A/B testing framework
 *    - Dynamic pricing algorithms
 *    - Fraud detection
 *    - Recommendation engine
 */

// Initialize Fastify server
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Initialize providers (SOLID: Dependency Injection)
const providers = [
  new ProviderA(),
  new ProviderB(),
  new ProviderC(),
];

// Initialize aggregator service
const aggregator = new AggregatorService(providers);

// Register routes
registerHotelRoutes(server, aggregator);

// Start server
const PORT = parseInt(process.env.PORT || '4002', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await server.listen({ port: PORT, host: HOST });
    
    console.log('\n🚀 Hotel Aggregation Service Started!');
    console.log(`📡 Server listening on http://${HOST}:${PORT}`);
    console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🔍 Search endpoint: http://${HOST}:${PORT}/search`);
    console.log(`\n🏨 Active Providers: ${providers.map(p => p.getName()).join(', ')}`);
    console.log('\n📖 Example Request:');
    console.log(`   GET http://${HOST}:${PORT}/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=20`);
    console.log('\n⏳ Waiting for requests...\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Start the server
start();

/**
 * PRODUCTION CHECKLIST:
 * 
 * □ Add authentication and authorization
 * □ Implement rate limiting (per IP, per user)
 * □ Add request validation (Zod, Joi)
 * □ Set up monitoring and alerting
 * □ Implement distributed tracing
 * □ Add Redis caching layer
 * □ Set up message queue (Kafka/Redis)
 * □ Implement circuit breakers
 * □ Add database for provider mappings
 * □ Set up ElasticSearch for advanced search
 * □ Configure CORS properly
 * □ Add compression middleware
 * □ Implement API versioning
 * □ Set up CI/CD pipeline
 * □ Add automated tests (unit, integration, e2e)
 * □ Configure secrets management (Vault, AWS Secrets Manager)
 * □ Set up container orchestration (Kubernetes)
 * □ Implement health checks for all dependencies
 * □ Add performance benchmarking
 * □ Set up load testing
 * □ Configure auto-scaling policies
 * □ Implement disaster recovery plan
 */
