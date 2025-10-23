# 🔍 Discovery Engine - Production Ready

AI-powered travel discovery and recommendation engine with web crawling capabilities.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

- 🤖 **AI-Powered Discovery**: Natural language query processing with OpenAI GPT-4o-mini
- 🌐 **Multi-Source Crawling**: TimeOut, Eventbrite, TripAdvisor, Lonely Planet, Atlas Obscura
- 🔍 **Semantic Search**: Vector embeddings with Weaviate
- 📊 **Knowledge Graph**: Context-aware recommendations with LangGraph
- ⚡ **High Performance**: Fastify API with Redis caching
- 🔄 **Background Workers**: BullMQ job queue for crawling and ETL
- 🎯 **Type-Safe**: Full TypeScript implementation
- 🐳 **Docker Ready**: Complete Docker Compose setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- OpenAI API key

### 1. Installation

```bash
# Clone and navigate
cd travel-ecosystem/services/discovery-engine

# Install dependencies
make install
# or: npm install && npx playwright install chromium
```

### 2. Configuration

```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
WEAVIATE_URL=http://localhost:8080
```

### 3. Start Services

```bash
# Start MongoDB, Redis, and Weaviate
make services-start
# or: docker-compose up -d
```

### 4. Test the Crawler

```bash
# Test single source
make test-crawl
# or: npm run crawl:test -- -s timeout -c "Delhi" -C "India"
```

### 5. Run Your First Crawl

```bash
# Crawl a city
make crawl-delhi
# or: npm run crawl -- -c "Delhi" -C "India"
```

### 6. Start the API

```bash
# Development mode with hot reload
make dev
# or: npm run dev

# Production mode
make start
# or: npm run build && npm start
```

API will be available at: `http://localhost:3000`

## 📖 Documentation

- **[CRAWLER_QUICKSTART.md](./CRAWLER_QUICKSTART.md)** - Get started in 5 minutes
- **[CRAWLER_README.md](./CRAWLER_README.md)** - Complete crawler documentation
- **[WORKFLOW.md](./WORKFLOW.md)** - System architecture and data flow
- **[RESEARCH_GUIDE.md](./RESEARCH_GUIDE.md)** - Technology deep dive
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built

## 🛠️ Usage

### Makefile Commands

```bash
make help              # Show all available commands
make install           # Install dependencies
make setup             # Complete setup
make services-start    # Start Docker services
make services-stop     # Stop Docker services
make dev               # Start development server
make build             # Build for production
make test-crawl        # Test crawler
make crawl-delhi       # Crawl Delhi
make crawl-batch       # Batch crawl multiple cities
make stats             # Show statistics
make health            # Check service health
make clean             # Clean build artifacts
```

### CLI Commands

```bash
# Crawl single city
npm run crawl -- -c "Paris" -C "France"

# With date filter
npm run crawl -- -c "Delhi" -C "India" --start-date 2025-10-01 --end-date 2025-10-31

# Test specific source
npm run crawl:test -- -s timeout -c "Tokyo" -C "Japan"

# Batch crawl
npm run cli -- crawl-batch -f cities.example.json

# View statistics
npm run crawl:stats

# Clear cache
npm run cli -- clear-cache --all
```

### API Endpoints

#### Discovery
```bash
# Natural language query
POST /api/v1/discover
{
  "query": "Best food festivals in Delhi this October"
}

# Search
GET /api/v1/search?q=food+festival

# Get recommendations
POST /api/v1/recommendations
{
  "baseEntity": "place-id",
  "limit": 10
}
```

#### Admin
```bash
# Trigger crawler
POST /api/v1/admin/crawl
{
  "city": "Delhi",
  "country": "India",
  "types": ["events", "attractions"]
}

# Get statistics
GET /api/v1/admin/crawler-stats

# Health check
GET /api/v1/health
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Fastify API Server              │
│  (Discovery, Search, Recommendations)   │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐     ┌──────────────┐
│LangChain│     │  LangGraph   │
│  Chain  │     │Knowledge Graph│
└────┬────┘     └──────┬───────┘
     │                 │
     └────────┬────────┘
              ▼
┌─────────────────────────────────┐
│         Data Layer               │
│  MongoDB | Redis | Weaviate     │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐     ┌──────────┐
│Crawler  │     │   ETL    │
│ Worker  │     │ Worker   │
└─────────┘     └──────────┘
```

## 🔧 Production Deployment

### Using Docker

```bash
# Start all services
make production-start

# Stop all services
make production-stop

# View logs
make services-logs

# Check health
make health
```

### Manual Deployment

```bash
# Build
npm run build

# Start API
NODE_ENV=production node dist/index.js &

# Start workers
npm run worker:crawler &
npm run worker:etl &
```

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Databases
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
WEAVIATE_URL=http://localhost:8080

# Crawler
CRAWLER_RATE_LIMIT=10
CRAWLER_CONCURRENT_REQUESTS=5
CRAWLER_WORKER_CONCURRENCY=2

# Cache
CACHE_TTL_QUERY_RESULT=3600
CACHE_TTL_ENTITY_DETAIL=86400

# Features
ENABLE_STREAMING=true
ENABLE_GRAPH_RECOMMENDATIONS=true
ENABLE_CACHING=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| API Response Time | < 500ms (cached) |
| API Response Time | < 3s (uncached) |
| Events per city | 30-60 items |
| Attractions per city | 40-80 items |
| Crawl time per city | 2-5 minutes |
| Success rate | 85-95% |

## 🧪 Testing

```bash
# Run all tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Test crawler
make test-crawl
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker restart discovery-mongodb

# Check logs
docker logs discovery-mongodb
```

### Redis Connection Failed
```bash
# Check Redis
docker exec discovery-redis redis-cli ping

# Restart Redis
docker restart discovery-redis
```

### Crawler Not Working
```bash
# Check Playwright
npx playwright install chromium

# Clear cache
make clear-cache

# Test individual source
npm run crawl:test -- -s timeout -c "Delhi" -C "India"
```

### Build Errors
```bash
# Clean and reinstall
make clean
make install
npm run build
```

## 📝 API Examples

### cURL Examples

```bash
# Discovery
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Best food festivals in Delhi this October"}'

# Search
curl "http://localhost:3000/api/v1/search?q=food+festival&limit=10"

# Trigger Crawler
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "country": "France"}'

# Health Check
curl http://localhost:3000/api/v1/health

# Statistics
curl http://localhost:3000/api/v1/stats
```

### JavaScript/TypeScript Examples

```typescript
// Discovery
const response = await fetch('http://localhost:3000/api/v1/discover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Best cultural events in Delhi this October'
  })
});
const data = await response.json();

// Trigger Crawler
await fetch('http://localhost:3000/api/v1/admin/crawl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    city: 'Delhi',
    country: 'India',
    types: ['events', 'attractions']
  })
});
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Run linter before committing: `npm run lint`
5. Ensure type safety: `npm run type-check`

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **LangChain** - LLM orchestration
- **Playwright** - Browser automation
- **Fastify** - High-performance API
- **OpenAI** - Language models and embeddings
- **BullMQ** - Job queue system

## 📞 Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Email: support@travel-ecosystem.com

---

**Built with ❤️ for Travel Discovery**
