# Transportation Service - Quick Reference

## 🚀 Start Development

```bash
# Install dependencies (if not done)
npm install

# Start PostgreSQL + Redis
docker-compose up -d postgres redis

# Apply database schema
docker exec -i gtfs-postgres psql -U gtfs -d gtfs < src/database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your GTFS feed URLs

# Import GTFS data
npm run gtfs:import

# Start development server
npm run dev
```

Server runs on: **http://localhost:3008**

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:3008/health
```

### Nearby Stops (PostGIS)
```bash
curl "http://localhost:3008/api/v1/transport/nearby-stops?lat=43.6452&lng=-79.3806&radius=800"
```

### All Routes
```bash
curl http://localhost:3008/api/v1/transport/routes
```

### Multimodal Route (⚠️ Mock data - RAPTOR not implemented)
```bash
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"name": "Union Station", "lat": 43.6452, "lng": -79.3806},
    "destination": {"name": "CN Tower", "lat": 43.6426, "lng": -79.3871},
    "preferences": {
      "modes": ["transit", "walking"],
      "maxWalkDistance": 800,
      "budget": "balanced"
    }
  }'
```

## 🛠️ Development Commands

```bash
npm run dev          # Development with auto-reload (tsx watch)
npm run build        # Build TypeScript to dist/
npm start            # Production mode (node dist/index.js)
npm run gtfs:import  # Import GTFS feeds
npm run lint         # ESLint
npm test             # Run tests (when implemented)
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f transportation-service

# Rebuild after code changes
docker-compose build transportation-service

# Access PostgreSQL
docker exec -it gtfs-postgres psql -U gtfs -d gtfs

# Access Redis
docker exec -it gtfs-redis redis-cli
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server entry point |
| `src/config.ts` | Environment configuration |
| `src/routes/transport.routes.ts` | API endpoints |
| `src/services/gtfs-rt.service.ts` | GTFS-RT realtime polling |
| `src/services/gtfs.service.ts` | GTFS import |
| `src/database/schema.sql` | PostgreSQL + PostGIS schema |
| `.env.example` | Environment variables template |
| `docker-compose.yml` | Development stack |

## 🔧 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://gtfs:gtfs123@localhost:5432/gtfs
REDIS_URL=redis://localhost:6379
GTFS_FEED_URLS=https://example.com/gtfs.zip

# Optional GTFS-RT
GTFS_RT_VEHICLE_POSITIONS_URL=https://example.com/vehicle-positions
GTFS_RT_TRIP_UPDATES_URL=https://example.com/trip-updates
GTFS_RT_POLL_INTERVAL=15000  # milliseconds

# Optional Google Maps fallback
GOOGLE_MAPS_API_KEY=your-key
```

## 🗃️ Database Queries

```sql
-- Count stops
SELECT COUNT(*) FROM stops;

-- Find nearby stops (PostGIS)
SELECT stop_id, stop_name, 
  ST_Distance(
    stop_location,
    ST_SetSRID(ST_MakePoint(-79.3806, 43.6452), 4326)::geography
  ) as distance
FROM stops
WHERE ST_DWithin(
  stop_location,
  ST_SetSRID(ST_MakePoint(-79.3806, 43.6452), 4326)::geography,
  800
)
ORDER BY distance
LIMIT 10;

-- List all routes
SELECT route_id, route_short_name, route_long_name 
FROM routes 
ORDER BY route_sort_order;

-- Recent vehicle positions
SELECT vehicle_id, trip_id, latitude, longitude, timestamp
FROM vehicle_positions
WHERE timestamp > (EXTRACT(EPOCH FROM NOW()) - 300)
ORDER BY timestamp DESC
LIMIT 20;
```

## 🧪 Testing Redis Cache

```bash
# Access Redis CLI
docker exec -it gtfs-redis redis-cli

# Check cached keys
KEYS gtfs-rt:*
KEYS route:*

# Get cached vehicle positions
GET gtfs-rt:vehicle-positions

# Check TTL
TTL gtfs-rt:vehicle-positions

# Clear all cache
FLUSHDB
```

## 📊 Performance Monitoring

```bash
# PostgreSQL connections
docker exec gtfs-postgres psql -U gtfs -d gtfs -c "SELECT count(*) FROM pg_stat_activity;"

# Redis memory usage
docker exec gtfs-redis redis-cli INFO memory

# Service logs
docker-compose logs -f transportation-service | grep "Updated vehicle positions"
```

## 🐛 Troubleshooting

### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec gtfs-postgres pg_isready -U gtfs

# View PostgreSQL logs
docker-compose logs postgres
```

### PostGIS Extension Missing
```bash
# Connect to database
docker exec -it gtfs-postgres psql -U gtfs -d gtfs

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
docker exec gtfs-redis redis-cli ping

# Should return: PONG
```

### GTFS Import Fails
```bash
# Check feed URL is accessible
curl -I https://example.com/gtfs.zip

# View import logs
npm run gtfs:import

# Check database after import
docker exec gtfs-postgres psql -U gtfs -d gtfs -c "SELECT COUNT(*) FROM stops;"
```

### Compile Errors
```bash
# Re-install dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version

# Build manually
npm run build
```

## ⚠️ Known Issues

1. **RAPTOR Algorithm Not Implemented**: Multimodal route returns mock data
2. **Incomplete GTFS Import**: Only agencies and stops fully implemented
3. **No Tests**: Test suite needs to be added
4. **Type Errors**: Some `@types` packages need manual installation

## 📚 Resources

- [GTFS Specification](https://gtfs.org/schedule/reference/)
- [GTFS-RT Reference](https://gtfs.org/realtime/reference/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Fastify Documentation](https://fastify.dev/)
- [RAPTOR Algorithm Paper](https://www.microsoft.com/en-us/research/publication/round-based-public-transit-routing/)

## 🎯 Implementation Status

**80% Complete**
- ✅ Server infrastructure
- ✅ Database schema
- ✅ GTFS-RT polling
- ✅ API endpoints
- ⚠️ GTFS import (partial)
- ❌ RAPTOR routing
- ❌ Walking/Cycling services
- ❌ Tests

See `IMPLEMENTATION_STATUS.md` for full details.

