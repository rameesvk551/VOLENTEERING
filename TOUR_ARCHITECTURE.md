# Tour Meta Search & Booking Redirect System - Architecture Documentation

## 🎯 System Overview

A production-ready tour meta-search and booking redirect system that aggregates tours from multiple external providers (GetYourGuide, Viator, Klook) and provides a unified search experience with affiliate-tracked redirects.

**Key Principle**: This system does NOT manage internal tour inventory. It's a pure aggregator and redirect service.

---

## 🏗️ High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                               │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Tours Discovery UI (Micro-Frontend)                         │ │
│  │  - Search & Filters                                          │ │
│  │  - Tour Listings                                             │ │
│  │  - Tour Details                                              │ │
│  │  - Redirect CTA                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                      API Gateway (Port 4000)                        │
│  - Authentication (Optional)                                        │
│  - Rate Limiting                                                    │
│  - Request Routing                                                  │
│  - CORS Handling                                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ /api/tours
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│              Tour Meta Search Service (Port 4004)                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Tour Aggregator Service                                     │ │
│  │  - Orchestrates provider queries (parallel)                  │ │
│  │  - Circuit breaker protection                                │ │
│  │  - Result aggregation & deduplication                        │ │
│  │  - Ranking & sorting                                         │ │
│  │  - Cache management                                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│     ┌────────────────────────┼────────────────────────┐           │
│     ▼                        ▼                        ▼           │
│  ┌──────┐              ┌──────────┐              ┌────────┐      │
│  │ GYG  │              │  Viator  │              │ Klook  │      │
│  │Adapt.│              │ Adapter  │              │Adapter │      │
│  └──────┘              └──────────┘              └────────┘      │
│     │                        │                        │           │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Cache Service (NodeCache)                               │    │
│  │  - Search Cache (5 min TTL)                              │    │
│  │  - Details Cache (10 min TTL)                            │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Analytics Service                                       │    │
│  │  - Event tracking                                        │    │
│  │  - Redirect intent management                            │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              │ External API Calls
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                    External Tour Providers                          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                │
│  │GetYour   │      │  Viator  │      │  Klook   │                │
│  │Guide API │      │   API    │      │   API    │                │
│  └──────────┘      └──────────┘      └──────────┘                │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### 1. Tour Meta Search Service (Backend)

#### Responsibilities ✅
- Aggregate tour data from multiple providers
- Normalize provider responses to unified schema
- Cache search results and tour details
- Implement circuit breaker for provider failover
- Generate affiliate redirect URLs
- Track analytics events
- Rate limit API requests

#### Out of Scope ❌
- Internal tour CRUD operations
- Payment processing
- Booking management
- User authentication (delegated to Auth Service)
- Inventory management

#### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Caching**: NodeCache (in-memory)
- **Circuit Breaker**: Opossum
- **HTTP Client**: Axios

#### Key Services

##### TourAggregatorService
```typescript
class TourAggregatorService {
  search(query: TourSearchQuery): Promise<TourSearchResponse>
  getTourDetails(provider: string, productId: string): Promise<Tour>
  generateRedirectUrl(provider: string, productId: string): RedirectResponse
}
```

##### CacheService
```typescript
class CacheService {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, type: 'search' | 'details'): boolean
  generateSearchCacheKey(query: TourSearchQuery): string
}
```

##### AnalyticsService
```typescript
class AnalyticsService {
  trackEvent(event: AnalyticsEvent): void
  createRedirectIntent(userId, provider, productId): string
  trackConversion(intentId: string): void
}
```

---

### 2. Provider Adapter Pattern

All providers implement the `ITourProvider` interface:

```typescript
interface ITourProvider {
  readonly providerId: string;
  readonly providerName: string;
  
  search(query: TourSearchQuery): Promise<Tour[]>;
  getDetails(productId: string): Promise<Tour | null>;
  generateRedirectUrl(productId: string, metadata?: Record<string, any>): string;
  healthCheck(): Promise<boolean>;
}
```

#### Adapters

##### GetYourGuideAdapter
- Provider ID: `getyourguide`
- Mock data available (real API integration ready)
- Affiliate URL format: `https://www.getyourguide.com/tour/{id}?partner_id={affiliateId}`

##### ViatorAdapter
- Provider ID: `viator`
- Mock data available (real API integration ready)
- Affiliate URL format: `https://www.viator.com/tours/{id}?pid={affiliateId}`

##### KlookAdapter
- Provider ID: `klook`
- Future-ready implementation
- Affiliate URL format: `https://www.klook.com/activity/{id}?aid={affiliateId}`

**Benefits of Adapter Pattern**:
- Easy to add new providers
- Isolated provider logic
- Testable in isolation
- Graceful failure handling

---

### 3. Unified Tour Schema

All tour data is normalized to a unified schema regardless of source:

```typescript
interface Tour {
  id: string;                    // Internal UUID
  title: string;
  description: string;
  location: TourLocation;
  price: TourPrice;
  images: TourImage[];
  rating: TourRating;
  provider: TourProvider;        // Source identification
  duration: TourDuration;
  category: TourCategory;
  highlights: TourHighlight[];
  inclusions: string[];
  exclusions: string[];
  cancellation: TourCancellation;
  availability: TourAvailability;
  languages: string[];
  popularityScore?: number;      // Calculated ranking
}
```

**Normalization Benefits**:
- Consistent frontend experience
- Easy to compare across providers
- Simplified filtering and sorting
- Provider-agnostic caching

---

### 4. Tours Discovery UI (Frontend)

#### Responsibilities ✅
- Tour search interface
- Filter and sort options
- Tour listing display
- Tour details modal
- Redirect to provider for booking
- User session tracking

#### Out of Scope ❌
- Payment processing UI
- Booking confirmation UI
- Operator dashboard
- Direct booking (all bookings via provider redirect)

#### Technology Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router v6
- **HTTP**: Axios
- **Architecture**: Module Federation

#### Key Components

##### SearchFilters
- Location input with auto-search
- Category pills (Cultural, Adventure, etc.)
- Advanced filters (price, rating, sort)
- Clear filters functionality

##### TourCard
- Tour thumbnail and title
- Rating and review count
- Price and provider badge
- Quick view details button

##### TourDetailsModal
- Full tour description
- Highlights and inclusions
- Cancellation policy
- "Book Now" CTA with redirect

---

## 🔄 Data Flow

### Search Flow

```
1. User enters location "Paris" in search box
   ↓
2. Update filters in Zustand store
   ↓
3. useTourSearch hook detects change
   ↓
4. Call tourApi.searchTours({ location: "Paris" })
   ↓
5. API Gateway forwards to Tour Service
   ↓
6. Tour Service checks cache (key: "search_paris")
   ├─ Cache Hit → Return cached results
   └─ Cache Miss → Continue
       ↓
7. Query all providers in parallel (via circuit breakers)
   ├─ GetYourGuide Adapter → External API
   ├─ Viator Adapter → External API
   └─ Klook Adapter → External API
       ↓
8. Aggregate results from all providers
   ↓
9. Deduplicate tours (by title + location)
   ↓
10. Calculate popularity scores
   ↓
11. Rank and sort (default: popularity desc)
   ↓
12. Apply pagination (limit: 20, offset: 0)
   ↓
13. Cache result (TTL: 5 minutes)
   ↓
14. Return TourSearchResponse to frontend
   ↓
15. Update Zustand store with tours
   ↓
16. Render TourCard components
```

### Booking Flow

```
1. User clicks "Book Now" on tour
   ↓
2. Call tourApi.generateRedirect(provider, productId)
   ↓
3. Tour Service creates redirect intent
   ├─ Generate UUID intent ID
   ├─ Store intent with metadata
   └─ Track "redirect" analytics event
       ↓
4. Provider adapter generates affiliate URL
   ├─ Add affiliate parameters
   ├─ Add intent ID for tracking
   └─ Return complete URL
       ↓
5. Frontend opens URL in new tab
   ↓
6. User redirected to provider site (e.g., GetYourGuide)
   ↓
7. User completes booking on provider site
   ↓
8. [Optional] Provider callback with conversion
   ↓
9. Track "conversion" analytics event
```

---

## 💾 Caching Strategy

### Two-Level Cache

#### Search Results Cache
- **Key Format**: `search_{normalized_query}`
- **TTL**: 5 minutes (configurable)
- **Why**: Reduce API quota usage, improve response time
- **Example Key**: `search_{"location":"paris","category":"cultural"}`

#### Tour Details Cache
- **Key Format**: `tour_{provider}_{productId}`
- **TTL**: 10 minutes (configurable)
- **Why**: Details change less frequently than availability
- **Example Key**: `tour_getyourguide_gyg-123456`

### Cache Implementation

- **Storage**: NodeCache (in-memory)
- **Max Keys**: 1000 (configurable)
- **Eviction**: LRU (Least Recently Used)
- **Statistics**: Hit rate tracking

### Cache Invalidation

1. **Time-based**: Automatic TTL expiration
2. **Manual**: Admin endpoint `/api/tours/cache/clear`
3. **Capacity**: LRU eviction when max keys reached

**Cost Savings**: ~80% reduction in provider API calls

---

## 🔒 Circuit Breaker Pattern

### Configuration

```typescript
{
  timeout: 5000ms,              // Max provider response time
  errorThresholdPercentage: 50, // Open circuit after 50% errors
  resetTimeout: 30000ms         // Try again after 30 seconds
}
```

### States

1. **Closed** (Normal)
   - All requests forwarded to provider
   - Error tracking active

2. **Open** (Failing)
   - Requests fail fast
   - No provider calls made
   - Other providers still queried

3. **Half-Open** (Testing)
   - Single test request sent
   - Success → Close circuit
   - Failure → Re-open circuit

### Benefits

- Prevents cascading failures
- Fast failure for unhealthy providers
- Automatic recovery
- Partial results still returned

---

## 📊 Ranking & Sorting

### Popularity Score Calculation

```typescript
popularityScore = 
  (rating.average / 5 * 100) * 0.6 +
  min(rating.count / 10000 * 100, 100) * 0.4
```

**Factors**:
- Rating quality (60% weight)
- Review volume (40% weight)
- Normalized to 0-100 scale

### Sort Options

1. **Popularity** (default)
   - Uses calculated popularity score
   - Balances quality and social proof

2. **Price**
   - Ascending or descending
   - Normalized to same currency

3. **Rating**
   - Highest rated first
   - Ties broken by review count

4. **Duration**
   - Normalized to hours
   - Useful for time-constrained travelers

---

## 🔐 Non-Functional Requirements

### Performance

- **Search Response**: < 1 second (target)
- **Cache Hit Rate**: > 70% (target)
- **Provider Timeout**: 5 seconds max
- **Concurrent Requests**: 100 requests/15 min per IP

### Reliability

- **Uptime**: 99.9% target
- **Graceful Degradation**: Return partial results if providers fail
- **Circuit Breaker**: Prevent cascading failures

### Security

- **Rate Limiting**: Protect against abuse
- **API Key Management**: Environment variables
- **CORS**: Whitelist allowed origins
- **XSS Protection**: Helmet.js middleware

### Scalability

- **Horizontal Scaling**: Stateless design
- **Caching**: Reduce database/API load
- **Async Processing**: Non-blocking I/O

### Observability

- **Logging**: Request/response logging
- **Metrics**: Cache stats, circuit breaker stats
- **Analytics**: Search tracking, conversion tracking
- **Health Checks**: `/health` endpoints

---

## 💰 Cost Optimization

### Strategies

1. **Aggressive Caching**
   - 5-min search cache
   - 10-min details cache
   - **Savings**: 80% API quota reduction

2. **Parallel Queries**
   - All providers queried simultaneously
   - **Benefit**: Sub-second total response

3. **Circuit Breakers**
   - Fast failure for unhealthy providers
   - **Benefit**: No wasted timeout delays

4. **Rate Limiting**
   - 100 requests per 15 minutes
   - **Benefit**: Prevent abuse, control costs

5. **Deduplication**
   - Remove duplicate tours
   - **Benefit**: Cleaner results, less data transfer

### Estimated Costs

- **Provider API**: Pay-per-call or quota-based
- **Infrastructure**: Minimal (single Node.js service)
- **Caching**: In-memory (no external cache cost)
- **Scaling**: Add more instances as needed

---

## 🚀 Deployment

### Development

```bash
# Backend
cd travel-ecosystem-backend
npm install
npm run dev:tour

# Frontend
cd travel-ecosystem/apps/tours-discovery
npm install
npm run dev
```

### Production (Docker)

```bash
cd travel-ecosystem-backend
docker-compose up -d
```

Services:
- Tour Service: `http://localhost:4004`
- API Gateway: `http://localhost:4000`
- Frontend: `http://localhost:1007`

---

## 📈 Future Enhancements

1. **Real Provider Integration**
   - Implement actual API calls when keys available
   - Replace mock data with live data

2. **Distributed Caching**
   - Redis for multi-instance deployments
   - Shared cache across servers

3. **Event Streaming**
   - Kafka for analytics events
   - Real-time conversion tracking

4. **Machine Learning**
   - Personalized recommendations
   - Dynamic pricing insights

5. **A/B Testing**
   - Test ranking algorithms
   - Optimize conversion rates

6. **GraphQL API**
   - More flexible queries
   - Reduced over-fetching

7. **Image Optimization**
   - CDN integration
   - Lazy loading

8. **Multi-Language Support**
   - i18n for global users
   - Currency conversion

---

## 📋 API Endpoints

### Search Tours
```
GET /api/tours/search
Query Params: location, category, minRating, priceMin, priceMax, sortBy, limit, offset
Response: TourSearchResponse
```

### Get Tour Details
```
GET /api/tours/:provider/:productId
Response: { success: true, data: Tour }
```

### Generate Redirect
```
POST /api/tours/redirect
Body: { provider, productId }
Response: { success: true, data: { intentId, redirectUrl } }
```

### Track Conversion
```
POST /api/tours/conversion
Body: { intentId, ...metadata }
Response: { success: true, message: "Conversion tracked" }
```

### Health Check
```
GET /api/tours/health
Response: { success: true, status: "healthy", cache: {...}, analytics: {...} }
```

---

## 🤝 Contributing

1. Add new provider: Implement `ITourProvider`
2. Add new filter: Update `TourSearchQuery` interface
3. Add new feature: Follow existing patterns
4. Test: Ensure backward compatibility

---

**Built with**: Clean Architecture, SOLID Principles, KISS Philosophy

**License**: MIT
