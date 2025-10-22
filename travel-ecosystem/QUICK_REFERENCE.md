# Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start databases
docker-compose up -d

# 2. Start backend (Terminal 1)
cd services/discovery-engine
npm install && npm run dev

# 3. Start frontend (Terminal 2)
cd apps/trip-planner
npm install && npm run dev

# 4. Open browser
# http://localhost:5004/ai-discovery
```

---

## 📁 Key Files

### Backend
```
services/discovery-engine/src/
├── chains/discovery.chain.ts       # LangChain AI pipeline
├── graph/knowledge.graph.ts        # LangGraph recommendations
├── api/routes.ts                   # API endpoints
├── database/models.ts              # MongoDB schemas
└── utils/seed-data.ts             # Sample data
```

### Frontend
```
apps/trip-planner/src/
├── components/discovery/
│   ├── DiscoverySearch.tsx         # Main search UI
│   ├── ResultCard.tsx              # Result display
│   └── RecommendationCarousel.tsx  # Recommendations
├── hooks/useDiscovery.ts           # API integration
└── pages/DiscoveryPage.tsx         # Discovery page
```

---

## 🔧 Common Commands

### Backend
```bash
cd services/discovery-engine

npm run dev          # Start development server
npm run build        # Build for production
npm run seed         # Seed sample data
npm run type-check   # TypeScript validation
npm run lint         # Code linting
```

### Frontend
```bash
cd apps/trip-planner

npm run dev          # Start dev server (port 5004)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Code linting
```

### Docker
```bash
docker-compose up -d              # Start all databases
docker-compose down               # Stop all databases
docker-compose ps                 # Check status
docker-compose logs mongodb       # View MongoDB logs
docker-compose restart weaviate   # Restart Weaviate
```

---

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5004 | Trip planner app |
| **Discovery** | http://localhost:5004/ai-discovery | AI search |
| **Backend** | http://localhost:3000 | API server |
| **Health** | http://localhost:3000/api/v1/health | Health check |
| **Stats** | http://localhost:3000/api/v1/stats | System stats |

---

## 🔑 Environment Variables

### Backend (.env)
```bash
OPENAI_API_KEY=sk-...              # REQUIRED
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
WEAVIATE_URL=http://localhost:8080
PORT=3000
ENABLE_CACHING=true
```

### Frontend (.env)
```bash
VITE_DISCOVERY_API_URL=http://localhost:3000/api/v1
```

---

## 📡 API Endpoints

### Discovery
```bash
# Main search
POST /api/v1/discover
Body: { "query": "Delhi in October" }

# Entity details
GET /api/v1/entity/:id

# Recommendations
POST /api/v1/recommendations
Body: { "baseEntity": "entity-id" }

# Trending
GET /api/v1/trending/:city?limit=20

# Text search
GET /api/v1/search?q=query

# Health & stats
GET /api/v1/health
GET /api/v1/stats
```

---

## 🐛 Quick Troubleshooting

### "Cannot connect to MongoDB"
```bash
docker ps | grep mongo
docker-compose restart mongodb
```

### "OpenAI API error"
```bash
# Check API key
cat services/discovery-engine/.env | grep OPENAI_API_KEY
```

### "Port already in use"
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "CORS error"
```bash
# Add to backend .env
ALLOWED_ORIGINS=http://localhost:5004
```

---

## 🎨 UI Components Usage

### Use Discovery Hook
```typescript
import { useDiscovery } from '@/hooks/useDiscovery';

const { results, isLoading, search } = useDiscovery();

// Search
await search("Paris food tours");

// Results available in:
// - results.festivals
// - results.attractions
// - results.places
// - results.events
```

### Add Result to Trip
```typescript
import { useTripStore } from '@/store/tripStore';

const addDestination = useTripStore(state => state.addDestination);

addDestination({
  id: result.id,
  name: result.title,
  location: result.location.city,
  // ... more fields
});
```

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Query latency (cached) | < 100ms |
| Query latency (cold) | < 3s |
| Cache hit rate | > 85% |
| Cost per query | < $0.001 |

---

## 🔍 Debugging Tips

### Check Logs
```bash
# Backend logs (console)
cd services/discovery-engine && npm run dev

# Database logs
docker logs travel-mongodb
docker logs travel-redis
docker logs travel-weaviate
```

### Test API Directly
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Discovery
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Delhi in October"}'
```

### Check Database
```bash
# MongoDB
docker exec -it travel-mongodb mongosh
> use travel_discovery
> db.places.find().limit(5)

# Redis
docker exec -it travel-redis redis-cli
> KEYS *
> GET query:...

# Weaviate
curl http://localhost:8080/v1/schema
```

---

## 📦 Database Schema Quick Ref

### MongoDB Collections
- `places` - Travel destinations/events
- `query_cache` - Cached query results
- `crawl_logs` - Crawler execution logs

### Weaviate Classes
- `TravelContent` - Vector embeddings for semantic search

### Redis Keys
- `query:{hash}:v1` - Query result cache
- `entity:{id}:v1` - Entity detail cache
- `rate-limit:{ip}` - Rate limiting

---

## 🎯 Example Queries

```bash
# Natural language queries
"Delhi in October"
"Best food festivals in Paris"
"3 day trip to Tokyo for history lovers"
"Beach resorts in Bali"
"Museums in New York"
"Cherry blossoms in Japan"
"Christmas markets in Germany"
"Wine tours in Tuscany"
```

---

## 🚀 Deployment Checklist

- [ ] Set production API keys
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Setup MongoDB replica set
- [ ] Configure Redis persistence
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Setup SSL/TLS certificates
- [ ] Configure CDN for static assets
- [ ] Setup CI/CD pipeline
- [ ] Add error tracking (Sentry)

---

## 📚 Documentation Links

- **Architecture**: [docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md](docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md)
- **Setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Summary**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **README**: [README.md](README.md)

---

## 💡 Tips

1. **Cache Hit Rate**: Monitor Redis logs to see cache performance
2. **Cost Optimization**: Enable caching to reduce OpenAI costs by 90%
3. **Performance**: Add indexes to MongoDB for frequently queried fields
4. **Development**: Use Docker Compose for consistent dev environment
5. **Testing**: Use Postman/Thunder Client for API testing

---

## 📞 Support

- Check logs first (console and Docker)
- Review [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section
- Verify all environment variables are set
- Ensure Docker containers are running

---

**Quick Reference v1.0**
*Last Updated: 2025-10-21*
