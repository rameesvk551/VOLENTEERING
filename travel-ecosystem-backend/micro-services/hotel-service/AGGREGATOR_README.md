# 🏨 Hotel Aggregation Service - MVP

A clean, scalable hotel aggregation service that fetches hotels from multiple providers, normalizes data, removes duplicates, ranks results, and returns paginated responses.

## ✨ Features

✅ **Multi-Provider Fetching**: Parallel fetching from 3 mock providers (easily scalable to 100+)  
✅ **Normalization**: Unified hotel schema across all providers  
✅ **Deduplication**: Smart duplicate removal using (name + lat + lng)  
✅ **Ranking**: Sort by price (ascending) and rating (descending)  
✅ **Pagination**: Cursor-based pagination for infinite scroll UX  
✅ **SOLID Principles**: Clean, maintainable, and testable code  
✅ **Scalability Ready**: Architected to scale to 100+ providers  

## 📁 Project Structure

```
hotel-service/
├── src/
│   ├── domain/
│   │   └── Hotel.ts                    # Hotel entity and DTOs
│   ├── providers/
│   │   ├── IHotelProvider.ts           # Provider interface (SOLID)
│   │   ├── ProviderA.ts                # Mock Provider A
│   │   ├── ProviderB.ts                # Mock Provider B
│   │   └── ProviderC.ts                # Mock Provider C
│   ├── services/
│   │   ├── NormalizerService.ts        # Normalizes provider schemas
│   │   ├── DeduplicatorService.ts      # Removes duplicates
│   │   ├── RankingService.ts           # Ranks hotels
│   │   ├── PaginationService.ts        # Cursor-based pagination
│   │   └── AggregatorService.ts        # Main orchestrator
│   ├── api/
│   │   ├── HotelController.ts          # HTTP request handlers
│   │   └── routes.ts                   # API routes
│   └── aggregator-server.ts            # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗️ Architecture

This service follows **SOLID principles** and **Clean Architecture**:

### 1. **IHotelProvider Interface** (Dependency Inversion)
Every provider implements the `IHotelProvider` interface, allowing easy addition of new providers without modifying existing code.

### 2. **Service Layer** (Single Responsibility)
- **NormalizerService**: Transforms provider-specific schemas → unified model
- **DeduplicatorService**: Removes duplicates using (name + lat + lng) key
- **RankingService**: Sorts by price (ASC) and rating (DESC)
- **PaginationService**: Implements cursor-based pagination
- **AggregatorService**: Orchestrates the entire workflow

### 3. **Clean Workflow**
```
User Request
    ↓
Controller (validation)
    ↓
Aggregator Service
    ↓
1. Fetch from providers (parallel)
2. Normalize results
3. Merge results
4. Deduplicate
5. Rank
6. Paginate
    ↓
Return JSON
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File (Optional)
```bash
PORT=4002
HOST=0.0.0.0
LOG_LEVEL=info
NODE_ENV=development
```

### 3. Run the Server
```bash
# Development mode (auto-reload)
npm run dev:aggregator

# Production mode
npm run build
npm run start:aggregator
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:4002/health
```

**Search Hotels:**
```bash
curl "http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=20"
```

## 📊 API Documentation

### `GET /search`

Search for hotels across multiple providers.

**Query Parameters:**
- `location` (required): City or location name (e.g., "Delhi")
- `checkin` (required): Check-in date in YYYY-MM-DD format
- `checkout` (required): Check-out date in YYYY-MM-DD format
- `guests` (required): Number of guests (integer)
- `cursor` (optional): Pagination cursor, default: 0
- `limit` (optional): Results per page, default: 20, max: 100

**Example Request:**
```bash
GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5
```

**Example Response:**
```json
{
  "hotels": [
    {
      "id": "providerA-4",
      "name": "budget stay hotel",
      "lat": 28.61,
      "lng": 77.23,
      "price": 45,
      "currency": "USD",
      "rating": 3.5,
      "provider": "ProviderA",
      "address": "12 Economy Street",
      "city": "Delhi",
      "amenities": ["WiFi"],
      "images": ["https://example.com/img4.jpg"]
    },
    {
      "id": "providerC-505",
      "name": "airport inn",
      "lat": 28.5562,
      "lng": 77.1,
      "price": 70,
      "currency": "USD",
      "rating": 3.9,
      "provider": "ProviderC",
      "address": "1 Airport Road",
      "city": "Delhi",
      "amenities": ["WiFi", "Shuttle", "Parking"],
      "images": ["https://example.com/imgC5.jpg"]
    }
  ],
  "cursor": 5,
  "hasMore": true,
  "total": 10
}
```

**Response Fields:**
- `hotels`: Array of hotel objects
- `cursor`: Next cursor position for pagination
- `hasMore`: Boolean indicating if more results exist
- `total`: Total number of hotels found (before pagination)

**Pagination Example:**
```bash
# First page
GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5

# Second page (use cursor from previous response)
GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=5&limit=5

# Third page
GET /search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=10&limit=5
```

## 🧪 How It Works

### 1. **Parallel Fetching**
The aggregator fetches from all providers simultaneously using `Promise.allSettled()`. If one provider fails, others continue.

```typescript
const results = await Promise.allSettled(
  providers.map(provider => provider.search(query))
);
```

### 2. **Normalization**
Each provider's response is transformed into a unified `Hotel` model.

```typescript
interface Hotel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  rating?: number;
  provider: string;
  // ... additional fields
}
```

### 3. **Deduplication**
Hotels are deduplicated using a unique key:
```typescript
const key = `${name.toLowerCase()}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
```

When duplicates are found, the one with the better price is kept.

### 4. **Ranking**
Hotels are sorted by:
1. Price (ascending) - cheaper first
2. Rating (descending) - higher rating first if prices are equal

### 5. **Pagination**
Cursor-based pagination (infinite scroll friendly):
- `cursor`: Index in the sorted array
- `limit`: Number of results per page
- `hasMore`: Whether more results exist

## 🔧 Adding New Providers

Adding a new provider is simple thanks to the `IHotelProvider` interface:

```typescript
// 1. Create a new provider class
export class ProviderD implements IHotelProvider {
  getName(): string {
    return 'ProviderD';
  }

  async search(query: HotelSearchQuery): Promise<Hotel[]> {
    // Fetch from provider's API
    const response = await fetch('https://api.providerd.com/hotels', {
      // ... request config
    });
    
    // Return hotels (will be normalized by NormalizerService)
    return response.data;
  }
}

// 2. Register in aggregator-server.ts
const providers = [
  new ProviderA(),
  new ProviderB(),
  new ProviderC(),
  new ProviderD(), // ← Add here
];
```

That's it! The aggregator will automatically include the new provider.

## 🚀 Scalability Path (100+ Providers)

This MVP is architected to scale. Here's how to upgrade it for production:

### 1. **Distributed Fetching (Kafka/Redis Queue)**
```
┌─────────────┐
│  API Server │
└──────┬──────┘
       │ Publishes search request
       ↓
┌────────────────┐
│  Message Queue │ (Kafka/Redis)
└───────┬────────┘
        │ Distributes to workers
        ↓
┌───────────────────────┐
│  Provider Workers     │ (100+ instances)
│  - Worker 1: Provider A, B, C
│  - Worker 2: Provider D, E, F
│  - Worker N: ...
└───────────────────────┘
        │ Returns results
        ↓
┌────────────────┐
│  Aggregator    │
│  (normalize → dedupe → rank)
└────────────────┘
```

### 2. **Caching Layer (Redis)**
- Cache search results for 5-15 minutes
- Use location + dates as cache key
- Reduce provider API calls by 70-90%

### 3. **Circuit Breakers**
- Prevent cascading failures when providers are down
- Automatically retry with exponential backoff
- Fallback to cached data

### 4. **ElasticSearch**
- Index hotels for advanced filtering
- Full-text search on hotel names
- Geo-spatial queries

### 5. **Monitoring**
- Distributed tracing (OpenTelemetry)
- Metrics (Prometheus + Grafana)
- Alerting (PagerDuty)

### 6. **Kubernetes**
- Horizontal pod autoscaling
- Load balancing
- Multi-region deployment

See inline comments in the code for detailed scalability notes.

## 📝 Sample Data

The MVP includes 3 mock providers with sample data:

- **ProviderA**: 4 hotels (includes duplicates with ProviderB and ProviderC)
- **ProviderB**: 4 hotels (2 duplicates with ProviderA)
- **ProviderC**: 5 hotels (1 duplicate with ProviderA)

**Total**: 13 hotels → 10 unique hotels after deduplication

## 🧪 Testing

```bash
# Test 1: First page
curl "http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5"

# Test 2: Second page
curl "http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=5&limit=5"

# Test 3: Health check
curl http://localhost:4002/health
```

## 📚 Technologies Used

- **Node.js** + **TypeScript**: Type-safe backend development
- **Fastify**: High-performance web framework
- **SOLID Principles**: Maintainable, testable code
- **Clean Architecture**: Separation of concerns

## 🎯 Production Readiness Checklist

Current MVP includes:
- ✅ Multi-provider fetching
- ✅ Normalization
- ✅ Deduplication
- ✅ Ranking
- ✅ Pagination
- ✅ Clean architecture
- ✅ Error handling

To make production-ready, add:
- ⬜ Authentication & authorization
- ⬜ Rate limiting
- ⬜ Request validation (Zod/Joi)
- ⬜ Redis caching
- ⬜ Message queue (Kafka)
- ⬜ Circuit breakers
- ⬜ Monitoring & alerting
- ⬜ Unit & integration tests
- ⬜ CI/CD pipeline
- ⬜ Kubernetes deployment
- ⬜ Database for provider mappings
- ⬜ ElasticSearch indexing

## 📄 License

MIT

## 🤝 Contributing

1. Create a new provider class implementing `IHotelProvider`
2. Add it to the `providers` array in `aggregator-server.ts`
3. Test with sample data

---

**Built with ❤️ using SOLID principles and Clean Architecture**
