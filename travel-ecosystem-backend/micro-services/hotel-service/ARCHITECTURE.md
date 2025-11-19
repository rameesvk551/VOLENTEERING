# 🏗️ Hotel Aggregation Service - Architecture & Folder Structure

## 📁 Complete Folder Structure

```
hotel-service/
│
├── src/
│   │
│   ├── domain/                           # Core business entities & DTOs
│   │   └── Hotel.ts                      # Hotel entity, SearchQuery, PaginatedResponse
│   │
│   ├── providers/                        # Provider implementations (SOLID)
│   │   ├── IHotelProvider.ts            # Interface (Dependency Inversion Principle)
│   │   ├── ProviderA.ts                 # Mock Provider A implementation
│   │   ├── ProviderB.ts                 # Mock Provider B implementation
│   │   └── ProviderC.ts                 # Mock Provider C implementation
│   │
│   ├── services/                         # Business logic layer (Single Responsibility)
│   │   ├── NormalizerService.ts         # Transforms provider schemas → unified model
│   │   ├── DeduplicatorService.ts       # Removes duplicate hotels
│   │   ├── RankingService.ts            # Sorts hotels by price & rating
│   │   ├── PaginationService.ts         # Cursor-based pagination
│   │   └── AggregatorService.ts         # Orchestrates the entire workflow
│   │
│   ├── api/                              # HTTP layer
│   │   ├── HotelController.ts           # Request handlers
│   │   └── routes.ts                    # Route registration
│   │
│   ├── aggregator-server.ts             # Main server entry point
│   ├── test-aggregator.ts               # Manual test script
│   └── index.ts                          # Original service (Kafka integration)
│
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── .env.example                          # Environment variables template
├── AGGREGATOR_README.md                  # Main documentation
├── EXAMPLES.md                           # API examples & responses
└── ARCHITECTURE.md                       # This file
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                             │
│  GET /search?location=Delhi&checkin=2025-12-01&...              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    HotelController                               │
│  • Validates query parameters                                    │
│  • Converts to HotelSearchQuery                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AggregatorService                              │
│  Main orchestrator - coordinates all steps                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ↓                         ↓
┌──────────────────────┐   ┌──────────────────────┐
│  STEP 1: FETCH       │   │   Parallel Execution │
│  Call all providers  │   │   Promise.allSettled │
└──────────┬───────────┘   └──────────────────────┘
           │
     ┌─────┼─────┐
     ↓     ↓     ↓
┌────────┐ ┌────────┐ ┌────────┐
│Provider│ │Provider│ │Provider│
│   A    │ │   B    │ │   C    │
└────┬───┘ └────┬───┘ └────┬───┘
     │          │          │
     │ 4 hotels │ 4 hotels │ 5 hotels
     └─────┬────┴────┬─────┘
           │         │
           ↓         ↓
  ┌────────────────────────────┐
  │  STEP 2: NORMALIZE         │
  │  NormalizerService         │
  │  • Unify schemas           │
  │  • Round coordinates       │
  │  • Sanitize data           │
  └────────────┬───────────────┘
               │
               ↓ 13 hotels (raw)
  ┌────────────────────────────┐
  │  STEP 3: MERGE             │
  │  Combine all results       │
  └────────────┬───────────────┘
               │
               ↓ 13 hotels (merged)
  ┌────────────────────────────┐
  │  STEP 4: DEDUPLICATE       │
  │  DeduplicatorService       │
  │  • Key: name + lat + lng   │
  │  • Keep best price         │
  └────────────┬───────────────┘
               │
               ↓ 10 hotels (unique)
  ┌────────────────────────────┐
  │  STEP 5: RANK              │
  │  RankingService            │
  │  • Sort by price (ASC)     │
  │  • Then rating (DESC)      │
  └────────────┬───────────────┘
               │
               ↓ 10 hotels (sorted)
  ┌────────────────────────────┐
  │  STEP 6: PAGINATE          │
  │  PaginationService         │
  │  • Apply cursor & limit    │
  │  • Return page + metadata  │
  └────────────┬───────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      JSON RESPONSE                               │
│  {                                                               │
│    hotels: [...],      ← Paginated results                      │
│    cursor: 5,          ← Next page cursor                       │
│    hasMore: true,      ← More results available?                │
│    total: 10           ← Total unique hotels                    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 SOLID Principles Implementation

### 1. **Single Responsibility Principle (SRP)**
Each class has ONE reason to change:

- `NormalizerService`: Only normalizes data
- `DeduplicatorService`: Only removes duplicates
- `RankingService`: Only ranks hotels
- `PaginationService`: Only handles pagination
- `AggregatorService`: Only orchestrates the workflow

### 2. **Open/Closed Principle (OCP)**
Open for extension, closed for modification:

```typescript
// Add new provider WITHOUT modifying existing code
class ProviderD implements IHotelProvider {
  // Implementation
}

// Just register it:
const providers = [..., new ProviderD()];
```

### 3. **Liskov Substitution Principle (LSP)**
Any provider can be substituted:

```typescript
const providers: IHotelProvider[] = [
  new ProviderA(),
  new ProviderB(),
  new CustomProvider(), // ← Works seamlessly
];
```

### 4. **Interface Segregation Principle (ISP)**
Small, focused interfaces:

```typescript
interface IHotelProvider {
  getName(): string;
  search(query: HotelSearchQuery): Promise<Hotel[]>;
}
// Only 2 methods - not bloated!
```

### 5. **Dependency Inversion Principle (DIP)**
Depend on abstractions, not implementations:

```typescript
// AggregatorService depends on IHotelProvider interface
constructor(providers: IHotelProvider[]) {
  // Works with ANY provider that implements IHotelProvider
}
```

---

## 🚀 Scalability Architecture (Production)

### Current MVP (3 Providers)
```
User → API Server → Aggregator → 3 Providers (parallel)
                    ↓
                  Response
```
**Performance**: ~100-200ms

---

### Future: 100+ Providers with Queue System

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │  (Rate Limit)   │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Redis Cache    │ ← Check cache first
                    │  TTL: 5 minutes │
                    └────────┬────────┘
                             │ (cache miss)
                             ↓
                    ┌─────────────────┐
                    │  Aggregator     │
                    │   Service       │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Message Queue  │ ← Kafka/Redis
                    │  (job publish)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  Worker Pod  │ │  Worker Pod  │ │  Worker Pod  │
      │  - Provider  │ │  - Provider  │ │  - Provider  │
      │    1-10      │ │    11-20     │ │    21-30     │
      └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ↓
                    ┌─────────────────┐
                    │  Results Queue  │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Aggregator     │
                    │  (normalize →   │
                    │   dedupe →      │
                    │   rank)         │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ Redis Cache  │ │ ElasticSearch│ │  PostgreSQL  │
      │ (results)    │ │ (indexing)   │ │ (mappings)   │
      └──────────────┘ └──────────────┘ └──────────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │     User        │
                    └─────────────────┘
```

**Performance**: ~300-500ms (for 100+ providers)

---

## 🗂️ Service Responsibilities

### Domain Layer (`domain/`)
- **What**: Core business entities
- **Why**: Centralized data models
- **Files**: `Hotel.ts`

### Provider Layer (`providers/`)
- **What**: External data source adapters
- **Why**: Abstraction over different APIs
- **Files**: `IHotelProvider.ts`, `ProviderA.ts`, `ProviderB.ts`, `ProviderC.ts`
- **Future**: `BookingProvider.ts`, `ExpediaProvider.ts`, etc.

### Service Layer (`services/`)
- **What**: Business logic
- **Why**: Reusable, testable operations
- **Files**: 
  - `NormalizerService.ts` - Data transformation
  - `DeduplicatorService.ts` - Duplicate removal
  - `RankingService.ts` - Sorting logic
  - `PaginationService.ts` - Pagination logic
  - `AggregatorService.ts` - Workflow orchestration

### API Layer (`api/`)
- **What**: HTTP interface
- **Why**: Expose services via REST API
- **Files**: `HotelController.ts`, `routes.ts`

---

## 🔐 Production Enhancements

### 1. Authentication & Authorization
```typescript
// middleware/auth.middleware.ts
server.addHook('preHandler', async (request, reply) => {
  const token = request.headers.authorization;
  const user = await verifyToken(token);
  request.user = user;
});
```

### 2. Rate Limiting
```typescript
// Redis-based rate limiting
const limiter = new RateLimiter({
  redis: redisClient,
  points: 100,  // 100 requests
  duration: 60, // per 60 seconds
});
```

### 3. Caching
```typescript
// Cache search results
const cacheKey = hash(query);
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const results = await aggregator.search(query);
await redis.setex(cacheKey, 300, JSON.stringify(results));
```

### 4. Circuit Breaker
```typescript
const breaker = new CircuitBreaker(provider.search, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});
```

### 5. Monitoring
```typescript
// Prometheus metrics
const searchDuration = new Histogram({
  name: 'hotel_search_duration_seconds',
  help: 'Hotel search duration',
});

const timer = searchDuration.startTimer();
const results = await aggregator.search(query);
timer();
```

---

## 📊 Performance Targets

| Metric | MVP | Production |
|--------|-----|------------|
| Response Time (p95) | 200ms | 500ms |
| Throughput | 100 RPS | 10,000 RPS |
| Providers | 3 | 100+ |
| Availability | N/A | 99.9% |
| Error Rate | N/A | < 0.1% |

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('DeduplicatorService', () => {
  it('should remove duplicates based on name + location', () => {
    const hotels = [hotel1, hotel1Duplicate, hotel2];
    const result = deduplicator.deduplicate(hotels);
    expect(result).toHaveLength(2);
  });
});
```

### Integration Tests
```typescript
describe('AggregatorService', () => {
  it('should fetch from all providers and return merged results', async () => {
    const result = await aggregator.search(query);
    expect(result.total).toBeGreaterThan(0);
  });
});
```

### E2E Tests
```typescript
describe('GET /search', () => {
  it('should return paginated hotel results', async () => {
    const response = await request(server).get('/search?...');
    expect(response.status).toBe(200);
    expect(response.body.hotels).toBeDefined();
  });
});
```

---

## 🔄 Deployment Pipeline

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  CI Build   │ ← Run tests, lint, typecheck
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Build Image │ ← Docker build
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Push to ECR │ ← Container registry
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Deploy to   │ ← Kubernetes
│   K8s       │   (Rolling update)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Health     │ ← Wait for healthy pods
│   Check     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Success!   │
└─────────────┘
```

---

**Built with SOLID principles and scalability in mind!** 🚀
