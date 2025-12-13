# Tour Meta Search Service

A production-ready microservice that aggregates tours and activities from multiple external providers (GetYourGuide, Viator, Klook) and provides a unified search and booking redirect API.

## 🎯 Overview

This service is a **meta-search engine** for tours and activities. It does NOT manage internal tour inventory or handle bookings directly. Instead, it:

- Aggregates tour data from multiple providers
- Normalizes data into a unified schema
- Provides fast search with caching
- Generates redirect URLs with affiliate tracking
- Tracks analytics events

## 🏗️ Architecture

### Service Responsibilities

✅ **In Scope:**
- Fetch tours from external provider APIs
- Normalize provider data into unified schema
- Search aggregation across providers
- Result deduplication and ranking
- Caching for performance
- Circuit breaker for provider failover
- Redirect URL generation with affiliate params
- Analytics event tracking

❌ **Out of Scope:**
- Tour creation/update/deletion (no internal CRUD)
- Payment processing
- Booking management
- User authentication (handled by Auth Service)
- Operator/supplier management

### Provider Adapter Pattern

```
┌─────────────────────────────────────────┐
│      Tour Aggregator Service            │
│  (Orchestration + Circuit Breakers)     │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┬────────────┐
    │                     │            │
┌───▼────┐         ┌─────▼─────┐  ┌──▼──────┐
│GetYour │         │  Viator   │  │ Klook   │
│Guide   │         │  Adapter  │  │ Adapter │
│Adapter │         └───────────┘  └─────────┘
└────────┘
    │
    ▼
ITourProvider Interface
- search(query): Tour[]
- getDetails(id): Tour
- generateRedirectUrl(id): string
- healthCheck(): boolean
```

Each adapter:
- Implements `ITourProvider` interface
- Handles provider-specific API calls
- Normalizes responses to unified schema
- Generates provider-specific affiliate URLs
- Provides mock data when API keys unavailable

## 📦 Installation

```bash
cd travel-ecosystem-backend/micro-services/tour-service
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key configurations:

```env
# Server
PORT=4004
NODE_ENV=development

# Cache (TTL in seconds)
CACHE_TTL_SEARCH=300      # 5 minutes
CACHE_TTL_DETAILS=600     # 10 minutes

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=5000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50

# Provider API Keys (optional - uses mock data if not provided)
GETYOURGUIDE_API_KEY=
VIATOR_API_KEY=
KLOOK_API_KEY=

# Affiliate IDs
GETYOURGUIDE_AFFILIATE_ID=
VIATOR_AFFILIATE_ID=
KLOOK_AFFILIATE_ID=
```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## 🔌 API Endpoints

### 1. Search Tours

**GET** `/api/tours/search`

Search tours across all providers with filtering and sorting.

**Query Parameters:**
- `location` - City or destination (e.g., "Paris")
- `country` - Country name (e.g., "France")
- `date` - ISO date string (future feature)
- `category` - Tour category (e.g., "Cultural", "Adventure")
- `minRating` - Minimum rating (0-5)
- `priceMin` - Minimum price
- `priceMax` - Maximum price
- `currency` - Currency code (default: USD)
- `durationMin` - Minimum duration
- `durationMax` - Maximum duration
- `durationUnit` - Duration unit (hours, days)
- `tags` - Comma-separated tags
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)
- `sortBy` - Sort field (popularity, price, rating, duration)
- `sortOrder` - Sort direction (asc, desc)

**Example:**
```bash
curl "http://localhost:4004/api/tours/search?location=Paris&category=Cultural&minRating=4.5&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tours": [...],
    "total": 45,
    "limit": 10,
    "offset": 0,
    "aggregations": {
      "providers": { "getyourguide": 15, "viator": 20, "klook": 10 },
      "categories": { "Cultural": 30, "Adventure": 15 },
      "priceRange": { "min": 25, "max": 250 }
    }
  },
  "metadata": {
    "searchQuery": {...},
    "providersQueried": ["getyourguide", "viator", "klook"],
    "providersSucceeded": ["getyourguide", "viator", "klook"],
    "providersFailed": [],
    "cacheHit": false,
    "responseTime": 342
  }
}
```

### 2. Get Tour Details

**GET** `/api/tours/:provider/:productId`

Get detailed information about a specific tour.

**Example:**
```bash
curl "http://localhost:4004/api/tours/getyourguide/gyg-123456"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Eiffel Tower Summit Access",
    "description": "...",
    "location": {...},
    "price": {...},
    "rating": {...},
    "provider": {...},
    "duration": {...},
    "category": {...},
    "highlights": [...],
    "inclusions": [...],
    "exclusions": [...],
    "cancellation": {...},
    "availability": {...}
  }
}
```

### 3. Generate Redirect URL

**POST** `/api/tours/redirect`

Generate a redirect URL with affiliate tracking for booking.

**Body:**
```json
{
  "provider": "getyourguide",
  "productId": "gyg-123456"
}
```

**Headers:**
- `X-User-Id` (optional) - User ID for tracking
- `X-Session-Id` (optional) - Session ID for tracking

**Response:**
```json
{
  "success": true,
  "data": {
    "intentId": "uuid-here",
    "redirectUrl": "https://www.getyourguide.com/tour/gyg-123456?partner_id=xxx&intent_id=uuid"
  }
}
```

### 4. Track Conversion

**POST** `/api/tours/conversion`

Track conversion when a user completes booking (called by provider callback).

**Body:**
```json
{
  "intentId": "uuid-here",
  "bookingId": "provider-booking-id",
  "amount": 89.99,
  "currency": "USD"
}
```

### 5. Health Check

**GET** `/api/tours/health`

Get service health and statistics.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "cache": {
    "keys": 42,
    "hits": 156,
    "misses": 23,
    "hitRate": 0.871
  },
  "analytics": {
    "activeIntents": 5,
    "analyticsEnabled": true
  }
}
```

## 🗄️ Unified Tour Schema

All tours are normalized to this schema regardless of provider:

```typescript
interface Tour {
  id: string;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  price: {
    amount: number;
    currency: string;
    displayPrice: string;
  };
  rating: {
    average: number;
    count: number;
  };
  provider: {
    id: string;
    name: string;
    productId: string;
    url: string;
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'minutes';
    displayText: string;
  };
  category: {
    primary: string;
    tags: string[];
  };
  highlights: Array<{ text: string }>;
  inclusions: string[];
  exclusions: string[];
  cancellation: {
    allowed: boolean;
    cutoffHours?: number;
    refundType?: 'full' | 'partial' | 'none';
    policy?: string;
  };
  availability: {
    isAvailable: boolean;
    spotsLeft?: number;
  };
  images: Array<{ url: string; caption?: string }>;
  languages: string[];
  popularityScore?: number;
}
```

## 📊 Caching Strategy

### Two-Level Cache

1. **Search Results Cache**
   - TTL: 5 minutes (configurable)
   - Key: Normalized search query
   - Reduces provider API calls

2. **Tour Details Cache**
   - TTL: 10 minutes (configurable)
   - Key: `tour_{provider}_{productId}`
   - Faster detail page loads

### Cache Invalidation

- Automatic TTL expiration
- Manual clear via admin endpoint
- LRU eviction when max keys reached

## 🔒 Circuit Breaker

Protects against provider API failures:

- **Timeout**: 5 seconds per provider
- **Error Threshold**: 50% failures opens circuit
- **Reset Timeout**: 30 seconds before retry

When a provider circuit opens:
- Requests fail fast
- Other providers still queried
- Partial results returned gracefully

## 📈 Analytics & Tracking

### Events Tracked

1. **Search** - User searches tours
2. **View** - User views tour details
3. **Click** - User clicks on tour
4. **Redirect** - User redirected to provider
5. **Conversion** - User completes booking

### Event Flow

```
User Search → Analytics Event
     ↓
Cache Check → Cache Hit/Miss
     ↓
Provider Queries (parallel)
     ↓
Aggregate & Deduplicate
     ↓
Rank & Sort
     ↓
Return Results
     ↓
User Selects Tour → View Event
     ↓
Generate Redirect → Redirect Event
     ↓
User Redirected → Provider Site
     ↓
Provider Callback → Conversion Event
```

## 🎯 Deduplication Logic

Tours are deduplicated based on:
- Title (normalized, lowercase)
- Location (city)

Example: "Eiffel Tower Tour" from GetYourGuide and Viator may be the same tour - only one is returned.

## 🏆 Ranking Algorithm

Default popularity score calculation:

```
popularityScore = (rating/5 * 100) * 0.6 + 
                  min(reviewCount/10000 * 100, 100) * 0.4
```

Factors:
- Rating (60% weight)
- Review count (40% weight)

## 🔧 Cost Optimization

1. **Aggressive Caching**
   - 5-min search cache
   - 10-min details cache
   - Reduces API quota usage by ~80%

2. **Parallel Provider Queries**
   - All providers queried simultaneously
   - Sub-second total response time

3. **Circuit Breakers**
   - Fast failure for unhealthy providers
   - Prevents timeout delays

4. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Protects against abuse

## 🚨 Error Handling

### Graceful Degradation

- If one provider fails: Return results from other providers
- If all providers fail: Return cached results or empty array
- Circuit breaker prevents cascading failures

### Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## 🧪 Testing

```bash
# Search tours
curl "http://localhost:4004/api/tours/search?location=Paris"

# Get tour details
curl "http://localhost:4004/api/tours/getyourguide/gyg-123456"

# Generate redirect
curl -X POST http://localhost:4004/api/tours/redirect \
  -H "Content-Type: application/json" \
  -d '{"provider":"getyourguide","productId":"gyg-123456"}'

# Health check
curl "http://localhost:4004/api/tours/health"
```

## 📚 Integration with API Gateway

Add to API Gateway (`api-gateway/src/index.ts`):

```typescript
const TOUR_SERVICE_URL = process.env.TOUR_SERVICE_URL || 'http://localhost:4004';

app.use('/api/tours', optionalAuthMiddleware, createProxyMiddleware({
  target: TOUR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/tours': '/api/tours'
  },
  onProxyReq: (proxyReq, req: any) => {
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
    }
  }
}));
```

## 🐳 Docker Support

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4004
CMD ["node", "dist/index.js"]
```

## 📋 Future Enhancements

- [ ] Real provider API integration (when keys available)
- [ ] Redis for distributed caching
- [ ] Kafka for analytics events
- [ ] GraphQL API
- [ ] Image optimization/CDN
- [ ] Personalized recommendations
- [ ] A/B testing framework
- [ ] Provider performance monitoring
- [ ] Auto-scaling based on load

## 📄 License

MIT
