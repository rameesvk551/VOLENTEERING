# Discovery Engine - Detailed Workflow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Data Collection Layer](#data-collection-layer)
3. [System Architecture](#system-architecture)
4. [Request Flow](#request-flow)
5. [Core Components](#core-components)
6. [Processing Pipeline](#processing-pipeline)
7. [Knowledge Graph System](#knowledge-graph-system)
8. [API Endpoints](#api-endpoints)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Performance Optimization](#performance-optimization)
11. [Error Handling](#error-handling)

---

## Overview

The **Discovery Engine** is an AI-powered travel recommendation system built with:
- **LangChain** for LLM orchestration
- **LangGraph** for knowledge graph reasoning
- **MongoDB** for structured data storage
- **Weaviate** for vector search
- **Redis** for caching
- **Fastify** for high-performance API serving

### Key Features
- Natural language query processing
- Semantic search with vector embeddings
- Hybrid search (vector + keyword)
- AI-generated summaries and recommendations
- Graph-based contextual discovery
- Multi-layer caching for performance
- Real-time streaming support (WebSocket)
- **Automated web crawling** for fresh travel data
- **Background ETL pipeline** for data enrichment

---

## Data Collection Layer

The Discovery Engine includes a **comprehensive web crawling system** that automatically collects travel content from multiple sources. This ensures fresh, up-to-date information for events, festivals, and attractions.

### Crawler Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Crawler Entry Points                      │
│                                                              │
│  ┌─────────────┐              ┌─────────────────┐          │
│  │  CLI Tool   │              │  Admin API      │          │
│  │             │              │  /admin/crawl   │          │
│  └──────┬──────┘              └────────┬────────┘          │
│         │                              │                   │
│         └──────────────┬───────────────┘                   │
│                        ▼                                    │
│              ┌──────────────────┐                          │
│              │ Crawler Manager  │                          │
│              │  orchestrator    │                          │
│              └────────┬─────────┘                          │
│                       │                                     │
│         ┌─────────────┼─────────────┐                      │
│         ▼             ▼             ▼                      │
│  ┌────────────┐ ┌─────────────┐ ┌────────────┐           │
│  │  BullMQ    │ │   Direct    │ │   Batch    │           │
│  │  Worker    │ │   Crawl     │ │   Crawl    │           │
│  │ (Background│ │  (Immediate)│ │ (Multiple) │           │
│  └────┬───────┘ └──────┬──────┘ └─────┬──────┘           │
│       │                │              │                    │
└───────┼────────────────┼──────────────┼────────────────────┘
        │                │              │
        ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Individual Crawlers                         │
│                                                              │
│  ┌────────────────────┐     ┌─────────────────────┐        │
│  │  Event Crawler     │     │ Attraction Crawler  │        │
│  ├────────────────────┤     ├─────────────────────┤        │
│  │ • TimeOut          │     │ • Google Places     │        │
│  │ • Eventbrite       │     │ • Lonely Planet     │        │
│  │ • TripAdvisor      │     │ • Atlas Obscura     │        │
│  └────────┬───────────┘     └──────────┬──────────┘        │
│           │                            │                    │
└───────────┼────────────────────────────┼────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Playwright Browser                        │
│   • Chromium headless                                       │
│   • Stealth mode (avoid detection)                          │
│   • Rate limiting                                           │
│   • Retry logic                                             │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Storage                           │
│   Collection: places                                        │
│   • Raw crawled data                                        │
│   • Source metadata                                         │
│   • Timestamps                                              │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ETL Worker (BullMQ)                       │
│   • Generate embeddings (OpenAI)                            │
│   • Enrich data (LLM summarization)                         │
│   • Sync to Weaviate vector DB                              │
│   • Background processing                                   │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Weaviate Vector Store                       │
│   Class: TravelContent                                      │
│   • 1536-dim embeddings                                     │
│   • Ready for semantic search                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Sources

The crawler system collects data from **6 premium travel sources**:

#### Event & Festival Sources:
1. **TimeOut** (`timeout.com`)
   - Events, festivals, nightlife
   - Detailed schedules, pricing
   - User ratings and reviews
   
2. **Eventbrite** (`eventbrite.com`)
   - Ticketed events
   - Conferences, workshops
   - Exact dates and venues
   
3. **TripAdvisor** (`tripadvisor.com`)
   - Tourist events
   - Seasonal festivals
   - User-generated content

#### Attraction Sources:
4. **Google Places** (via search)
   - Popular attractions
   - Opening hours, ratings
   - Real-time popularity data
   
5. **Lonely Planet** (`lonelyplanet.com`)
   - Curated travel guides
   - Hidden gems
   - Expert recommendations
   
6. **Atlas Obscura** (`atlasobscura.com`)
   - Unique, offbeat attractions
   - Lesser-known experiences
   - Cultural insights

### Crawler Components

#### 1. **BaseCrawler** (`src/crawlers/base.crawler.ts`)

Abstract base class providing common functionality:

```typescript
class BaseCrawler {
  protected browser: Browser;
  protected redis: RedisClientType;
  protected logger: Logger;

  // Core crawling method with retry logic
  async crawl(params: CrawlParams): Promise<CrawlResult>;
  
  // Browser automation with stealth
  protected async initBrowser(): Promise<void>;
  
  // Rate limiting (respect robots.txt)
  protected async waitForRateLimit(): Promise<void>;
  
  // Cache management
  protected async getCached(key: string): Promise<any>;
  protected async setCache(key: string, data: any): Promise<void>;
  
  // Error handling
  protected handleError(error: Error, context: string): void;
}
```

**Features:**
- Playwright browser automation
- Redis caching (24-hour TTL)
- Rate limiting (configurable delay)
- Stealth mode (avoid bot detection)
- JSON-LD structured data extraction
- Retry logic (3 attempts with exponential backoff)
- Comprehensive logging

#### 2. **EventCrawler** (`src/crawlers/event.crawler.ts`)

Specialized crawler for events and festivals:

```typescript
class EventCrawler extends BaseCrawler {
  // Crawl TimeOut events
  async crawlTimeOut(city: string, country: string): Promise<EventData[]>;
  
  // Crawl Eventbrite events
  async crawlEventbrite(city: string, country: string): Promise<EventData[]>;
  
  // Crawl TripAdvisor events
  async crawlTripAdvisor(city: string, country: string): Promise<EventData[]>;
  
  // Extract event details from page
  private extractEventDetails(page: Page): Promise<EventData>;
  
  // Parse dates (flexible format handling)
  private parseDate(dateStr: string): Date;
  
  // Detect categories from keywords
  private detectCategories(title: string, description: string): string[];
}
```

**Capabilities:**
- Navigate paginated listings
- Extract event details (title, date, venue, price)
- Parse multiple date formats
- Handle dynamic content (wait for JS)
- Detect event categories automatically
- Extract ticket pricing
- Collect user ratings

#### 3. **AttractionCrawler** (`src/crawlers/attraction.crawler.ts`)

Specialized crawler for tourist attractions:

```typescript
class AttractionCrawler extends BaseCrawler {
  // Crawl Google Places
  async crawlGoogle(city: string, country: string): Promise<AttractionData[]>;
  
  // Crawl Lonely Planet
  async crawlLonelyPlanet(city: string, country: string): Promise<AttractionData[]>;
  
  // Crawl Atlas Obscura
  async crawlAtlasObscura(city: string, country: string): Promise<AttractionData[]>;
  
  // Extract attraction details
  private extractAttractionDetails(page: Page): Promise<AttractionData>;
  
  // Parse opening hours
  private parseOpeningHours(hoursStr: string): OpeningHours[];
  
  // Normalize ratings (different scales)
  private normalizeRating(rating: number, maxRating: number): number;
}
```

**Capabilities:**
- Geolocation extraction
- Opening hours parsing
- Rating normalization (0-5 scale)
- Photo URL collection
- Accessibility information
- Pricing tier detection
- Popularity scoring

#### 4. **CrawlerManager** (`src/crawlers/index.ts`)

Orchestrates multiple crawlers:

```typescript
class CrawlerManager {
  private eventCrawler: EventCrawler;
  private attractionCrawler: AttractionCrawler;
  private queue: Queue; // BullMQ
  
  // Crawl a single city (all sources)
  async crawlCity(params: CrawlParams): Promise<CrawlResult>;
  
  // Batch crawl multiple cities
  async crawlBatch(cities: City[]): Promise<BatchResult>;
  
  // Add crawl job to queue
  async queueCrawl(params: CrawlParams): Promise<Job>;
  
  // Get crawler statistics
  async getStatistics(): Promise<CrawlerStats>;
  
  // Clear all caches
  async clearCache(): Promise<void>;
  
  // Deduplication logic
  private deduplicateResults(results: Place[]): Place[];
}
```

**Features:**
- Parallel source crawling
- Intelligent deduplication (by name + location)
- Result aggregation
- Error collection and reporting
- Statistics tracking (success rate, processing time)
- Cache management

### Background Workers

#### 1. **Crawler Worker** (`src/workers/crawler.worker.ts`)

BullMQ worker for asynchronous crawling:

```typescript
// Job queue configuration
const crawlerQueue = new Queue('crawl-jobs', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  }
});

// Worker process
const worker = new Worker('crawl-jobs', async (job: Job<CrawlerJobData>) => {
  const { city, country, sources, crawlType } = job.data;
  
  const manager = new CrawlerManager();
  const result = await manager.crawlCity({ city, country, sources });
  
  // Queue ETL job for each result
  for (const place of result.data) {
    await etlQueue.add('etl-job', { placeId: place._id });
  }
  
  return result;
});
```

**Features:**
- Asynchronous processing (non-blocking)
- Job persistence (survives restarts)
- Progress tracking
- Automatic retries (exponential backoff)
- Error handling
- Triggers ETL pipeline

#### 2. **ETL Worker** (`src/workers/etl.worker.ts`)

Processes crawled data:

```typescript
const worker = new Worker('etl-jobs', async (job: Job<ETLJobData>) => {
  const { placeId } = job.data;
  
  // 1. Fetch raw data from MongoDB
  const place = await Place.findById(placeId);
  
  // 2. Generate embeddings
  const embeddings = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: `${place.title} ${place.description}`,
  });
  
  // 3. Enrich data (LLM summarization)
  const summary = await llm.invoke([
    { role: 'system', content: 'Summarize this attraction in 2 sentences.' },
    { role: 'user', content: place.description }
  ]);
  
  // 4. Sync to Weaviate
  await weaviate.data.creator()
    .withClassName('TravelContent')
    .withProperties({
      title: place.title,
      description: place.description,
      summary: summary.content,
      city: place.location.city,
      country: place.location.country,
      vector: embeddings.data[0].embedding,
    })
    .do();
  
  // 5. Update MongoDB with Weaviate ID
  place.weaviateId = weaviateResponse.id;
  await place.save();
  
  return { success: true };
});
```

**Pipeline Steps:**
1. **Fetch** raw data from MongoDB
2. **Generate embeddings** using OpenAI
3. **Enrich** with LLM-generated summaries
4. **Sync** to Weaviate vector database
5. **Update** MongoDB with cross-references

### CLI Tool

Command-line interface for crawler management (`src/cli.ts`):

```bash
# Crawl a single city (all sources)
npm run crawl -- -c "Delhi" -C "India"

# Crawl specific sources only
npm run crawl -- -c "Mumbai" -C "India" -s timeout,google

# Test a source (dry run)
npm run crawl:test -- -s timeout -c "Paris" -C "France"

# Batch crawl from file
npm run crawl:batch -- -f cities.json

# View statistics
npm run crawl:stats

# Clear cache
npm run crawl:clear-cache
```

**CLI Commands:**
- `crawl` - Crawl a city (all sources)
- `test` - Test a specific source
- `batch` - Batch crawl multiple cities
- `stats` - View crawler statistics
- `clear-cache` - Clear all caches

### Admin API Endpoints

REST API for programmatic crawler control:

```
POST /api/v1/admin/crawl
Body: {
  city: string,
  country: string,
  sources?: string[],
  background?: boolean
}
Response: {
  jobId?: string,  // if background=true
  result?: CrawlResult  // if background=false
}

GET /api/v1/admin/crawl/status/:jobId
Response: {
  status: 'waiting' | 'active' | 'completed' | 'failed',
  progress: number,
  result?: CrawlResult,
  error?: string
}

GET /api/v1/admin/crawl/stats
Response: {
  totalCrawls: number,
  successRate: number,
  avgDuration: number,
  bySource: { [source]: Stats }
}
```

### Crawler Workflow

Complete data flow from crawl to discovery:

```
1. Trigger Crawl
   ├─ CLI: npm run crawl -- -c Delhi -C India
   └─ API: POST /admin/crawl

2. Crawler Manager
   ├─ Initialize EventCrawler + AttractionCrawler
   ├─ Check Redis cache (key: crawl:Delhi:India:20250101)
   └─ If cache miss, proceed to crawl

3. Parallel Crawling (6 sources)
   ├─ TimeOut → Extract events
   ├─ Eventbrite → Extract events
   ├─ TripAdvisor → Extract events
   ├─ Google → Extract attractions
   ├─ Lonely Planet → Extract attractions
   └─ Atlas Obscura → Extract attractions

4. Store in MongoDB
   ├─ Collection: places
   ├─ Documents: ~50-200 per city
   └─ Fields: title, description, location, dates, source, metadata

5. Queue ETL Jobs
   ├─ BullMQ: etl-jobs queue
   ├─ One job per crawled place
   └─ Background processing

6. ETL Worker Processing
   ├─ Generate embeddings (OpenAI)
   ├─ Enrich with LLM summaries
   ├─ Sync to Weaviate
   └─ Update MongoDB with Weaviate ID

7. Data Ready for Discovery
   ├─ MongoDB: Structured data (filtering, keyword search)
   ├─ Weaviate: Vector embeddings (semantic search)
   └─ Redis: Cached results (fast retrieval)

8. Discovery Chain Uses Crawled Data
   ├─ User query → Entity extraction
   ├─ Hybrid search (MongoDB + Weaviate)
   ├─ Results include fresh crawled content
   └─ LLM generates summaries and recommendations
```

### Performance Optimization

**Rate Limiting:**
- Configurable delay between requests (default: 1-3 seconds)
- Respects robots.txt
- Random jitter to avoid patterns

**Caching:**
- Redis cache with 24-hour TTL
- Cache key: `crawl:{city}:{country}:{date}`
- Reduces redundant crawls

**Parallel Processing:**
- Concurrent source crawling (Promise.allSettled)
- BullMQ concurrency (5 workers per queue)
- Non-blocking background jobs

**Error Handling:**
- Retry logic (3 attempts with exponential backoff)
- Graceful degradation (skip failed sources)
- Error aggregation and reporting

**Resource Management:**
- Browser pooling (reuse Playwright instances)
- Connection pooling (MongoDB, Redis)
- Memory limits for worker processes

### Monitoring & Logging

**Crawler Statistics:**
```json
{
  "totalCrawls": 1247,
  "successRate": 94.2,
  "avgDuration": 23.5,
  "bySource": {
    "timeout": { "success": 456, "failed": 12, "avgDuration": 18.3 },
    "google": { "success": 489, "failed": 8, "avgDuration": 15.2 }
  },
  "lastCrawl": "2025-01-15T10:30:00Z"
}
```

**Logs:**
- Winston logger with multiple transports
- Log levels: error, warn, info, debug
- Structured logging (JSON format)
- Separate crawler logs: `logs/crawler.log`

**Health Checks:**
```bash
# Check crawler health
curl http://localhost:3000/health
# Response:
{
  "status": "healthy",
  "crawlers": {
    "eventCrawler": "operational",
    "attractionCrawler": "operational"
  },
  "workers": {
    "crawlerWorker": "active",
    "etlWorker": "active"
  }
}
```



---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Web/Mobile Apps, API Consumers)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Fastify API Server                         │
│  • CORS, Rate Limiting, WebSocket                           │
│  • Request Validation (Zod)                                 │
│  • Error Handling                                           │
│  • Admin Endpoints (Crawler Control)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        ▼                           ▼
┌──────────────────┐      ┌─────────────────────┐
│ Discovery Chain  │      │  Knowledge Graph    │
│  (LangChain)     │      │   (LangGraph)       │
└────────┬─────────┘      └─────────┬───────────┘
         │                          │
         └─────────┬────────────────┘
                   │
         ┌─────────┴──────────────┐
         ▼                        ▼
┌──────────────────┐    ┌─────────────────────┐
│ Crawler System   │    │   ETL Pipeline      │
│                  │    │                     │
│ • EventCrawler   │───▶│ • Embedding Gen     │
│ • AttractionCrawl│    │ • Data Enrichment   │
│ • CrawlerManager │    │ • Vector Sync       │
│ • BullMQ Workers │    │ • BullMQ Workers    │
└──────────┬───────┘    └─────────┬───────────┘
           │                      │
           └──────────┬───────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  MongoDB    │  │  Weaviate    │  │   Redis      │       │
│  │ (Structured)│  │  (Vectors)   │  │  (Cache)     │       │
│  │             │  │              │  │  (Job Queue) │       │
│  │ • places    │  │ • embeddings │  │ • crawl cache│       │
│  │ • raw data  │  │ • semantic   │  │ • query cache│       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  • OpenAI GPT-4o-mini (LLM)                                 │
│  • OpenAI text-embedding-3-small (Embeddings)               │
│  • Playwright Browser (Web Crawling)                        │
│  • Travel Data Sources (TimeOut, Google, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Data Population Flow (Crawler → Database)

Before the discovery engine can respond to queries, it needs data. Here's how data is collected and prepared:

```
┌────────────────────────────────────────────────────────────┐
│ 1. Trigger Crawl                                           │
│    • CLI: npm run crawl -- -c "Delhi" -C "India"           │
│    • API: POST /api/v1/admin/crawl                         │
│    • Scheduled: Cron job (daily/weekly)                    │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Crawler Manager                                         │
│    • Check Redis cache (crawl:Delhi:India:20250115)       │
│    • If cached (< 24h): return cached data                 │
│    • If not cached: initiate crawl                         │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Parallel Web Crawling (6 sources)                       │
│    ┌─────────────────┬─────────────────┬────────────────┐ │
│    │ EventCrawler    │ EventCrawler    │ EventCrawler   │ │
│    │ → TimeOut       │ → Eventbrite    │ → TripAdvisor  │ │
│    └─────────────────┴─────────────────┴────────────────┘ │
│    ┌─────────────────┬─────────────────┬────────────────┐ │
│    │ AttractionCrawl │ AttractionCrawl │ AttractionCrawl│ │
│    │ → Google        │ → Lonely Planet │ → Atlas Obscura│ │
│    └─────────────────┴─────────────────┴────────────────┘ │
│                                                            │
│    • Playwright headless browser                           │
│    • Rate limiting (1-3 sec delay)                         │
│    • Retry logic (3 attempts)                              │
│    • Extract: title, description, dates, location, etc.    │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Store Raw Data (MongoDB)                                │
│    Collection: places                                      │
│    Documents: ~50-200 per city                             │
│    Fields: {                                               │
│      title, description, location,                         │
│      dates: { start, end },                                │
│      categories, pricing, ratings,                         │
│      source, sourceUrl, metadata,                          │
│      createdAt, updatedAt                                  │
│    }                                                       │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Queue ETL Jobs (BullMQ)                                 │
│    • One job per crawled place                             │
│    • Queue: etl-jobs                                       │
│    • Job data: { placeId, city, country }                  │
│    • Processed by ETL Worker (background)                  │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 6. ETL Worker Processing                                   │
│    For each place:                                         │
│    a) Generate embeddings (OpenAI)                         │
│       → 1536-dimensional vector                            │
│    b) Enrich with LLM summaries                            │
│       → Concise 2-sentence summary                         │
│    c) Sync to Weaviate                                     │
│       → Store vector + metadata                            │
│    d) Update MongoDB                                       │
│       → Add weaviateId reference                           │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Data Ready for Discovery                                │
│    ✓ MongoDB: Structured data for keyword search           │
│    ✓ Weaviate: Vector embeddings for semantic search       │
│    ✓ Redis: Crawl cache (24h TTL)                          │
│    ✓ Total processing time: 2-5 minutes per city           │
└────────────────────────────────────────────────────────────┘
```

### Main Discovery Request Flow

```
User Query: "Best food festivals in Delhi this October"
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 1. API Gateway (Fastify)                                   │
│    • Validate request with Zod schema                      │
│    • Apply rate limiting                                   │
│    • Log request                                           │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Discovery Chain Entry Point                             │
│    execute(query: string)                                  │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Entity Extraction (LLM)                                 │
│    Input: "Best food festivals in Delhi this October"      │
│    Output: {                                               │
│      city: "Delhi",                                        │
│      country: "India",                                     │
│      month: "October",                                     │
│      year: 2025,                                           │
│      interests: ["food"],                                  │
│      eventType: ["festival"]                               │
│    }                                                       │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Cache Check                                             │
│    • Generate cache key from entities (SHA256)             │
│    • Check Redis: query:{cacheKey}:v1                      │
│    • If HIT: return cached response (skip to step 10)      │
│    • If MISS: continue to step 5                           │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Generate Embeddings                                     │
│    • Call OpenAI Embeddings API                            │
│    • Model: text-embedding-3-small                         │
│    • Output: 1536-dimensional vector                       │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 6. Hybrid Search (Searches Crawled Data)                   │
│    ┌─────────────────────┬──────────────────────┐          │
│    │ Vector Search       │ Keyword Search       │          │
│    │ (Weaviate)          │ (MongoDB)            │          │
│    │                     │                      │          │
│    │ • Use embeddings    │ • Filter by city     │          │
│    │ • Filter by city    │ • Filter by month    │          │
│    │ • Filter by dates   │ • Filter by type     │          │
│    │ • Top 30 results    │ • Filter by interest │          │
│    │                     │ • Top 30 results     │          │
│    └─────────────────────┴──────────────────────┘          │
│                     ▼                                      │
│              Merge & Deduplicate                           │
│              (Combined ~40-50 unique results)              │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Rerank Results (LLM)                                    │
│    • Send top results to GPT-4o-mini                       │
│    • Ask LLM to rank by relevance                          │
│    • Consider: temporal match, popularity, uniqueness      │
│    • Return: ordered list of IDs                           │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 8. Generate Summary (LLM)                                  │
│    • Top 10 results → GPT-4o-mini                          │
│    • Generate:                                             │
│      - Headline (catchy title)                             │
│      - Overview (2-3 sentences)                            │
│      - Highlights (5 must-see items)                       │
│      - Best time to visit                                  │
│      - Local tips                                          │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 9. Categorize Results                                      │
│    • Group by type:                                        │
│      - festivals: []                                       │
│      - attractions: []                                     │
│      - places: []                                          │
│      - events: []                                          │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 10. Knowledge Graph Enhancement                            │
│     • Pass entities to KnowledgeGraph.query()              │
│     • Build graph nodes & edges                            │
│     • Traverse graph for recommendations                   │
│     • Score and rank recommendations                       │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 11. Build Response                                         │
│     {                                                      │
│       query: string,                                       │
│       entities: QueryEntities,                             │
│       summary: Summary,                                    │
│       results: CategorizedResults,                         │
│       recommendations: Recommendation[],                   │
│       metadata: { processingTime, sources, etc }           │
│     }                                                      │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 12. Cache Result                                           │
│     • Store in Redis with TTL (1 hour default)             │
│     • Key: query:{cacheKey}:v1                             │
└────────────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────┐
│ 13. Return Response to Client                              │
│     • Status: 200 OK                                       │
│     • Total processing time: ~2-5 seconds                  │
└────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. **DiscoveryChain** (`src/chains/discovery.chain.ts`)

The main orchestrator that coordinates the entire discovery pipeline.

#### Key Methods:

##### `execute(query: string): Promise<DiscoveryResponse>`
Master method that orchestrates the entire pipeline.

**Steps:**
1. Extract entities from natural language query
2. Generate cache key and check Redis
3. Generate embeddings for semantic search
4. Perform hybrid search (vector + keyword)
5. Rerank results using LLM
6. Generate AI summary
7. Categorize results by type
8. Cache result
9. Return structured response

##### `extractEntities(query: string): Promise<QueryEntities>`
Uses GPT-4o-mini to parse natural language into structured entities.

**Input:** 
```
"Best food festivals in Delhi this October"
```

**LLM Prompt:**
```
You are a travel query analyzer. Extract structured entities from the user's query.

Query: Best food festivals in Delhi this October

Return ONLY a valid JSON object with these fields:
- city: string
- country: string
- month: string
- year: number
- interests: string[]
- eventType: string[]
- duration: number
```

**Output:**
```json
{
  "city": "Delhi",
  "country": "India",
  "month": "October",
  "year": 2025,
  "interests": ["food"],
  "eventType": ["festival"],
  "duration": null
}
```

##### `embedQuery(query: string): Promise<number[]>`
Generates vector embeddings using OpenAI's embedding model.

**Process:**
- Model: `text-embedding-3-small`
- Output dimensions: 1536
- Used for semantic similarity search in Weaviate

##### `retrieveRelevantContent(entities, embeddings): Promise<StructuredData[]>`
Performs hybrid search combining vector and keyword approaches.

**Vector Search (Weaviate):**
```typescript
// Search by semantic similarity
await weaviate.graphql
  .get()
  .withClassName('TravelContent')
  .withNearVector({ vector: embeddings })
  .withWhere({
    operator: 'And',
    operands: [
      { path: ['city'], operator: 'Equal', valueString: 'Delhi' },
      { path: ['startDate'], operator: 'GreaterThanEqual', valueDate: '2025-10-01' }
    ]
  })
  .withLimit(30)
```

**Keyword Search (MongoDB):**
```typescript
await Place.find({
  'location.city': /Delhi/i,
  'dates.start': { $gte: new Date('2025-10-01') },
  'dates.end': { $lte: new Date('2025-10-31') },
  'metadata.category': { $in: ['food'] },
  'type': { $in: ['festival'] }
})
.sort({ 'metadata.popularity': -1 })
.limit(30)
```

**Merge Results:**
- Deduplicate by ID
- Prioritize vector search results
- Combine to ~40-50 unique documents

##### `rerankResults(query, documents): Promise<StructuredData[]>`
Uses LLM to intelligently reorder results by relevance.

**Why Rerank?**
- Initial search may miss contextual nuances
- LLM understands user intent better
- Considers temporal relevance, popularity, uniqueness

**LLM Prompt:**
```
You are a travel recommendation expert. Rank these results by relevance.

Query: Best food festivals in Delhi this October

Documents: [list of 40 results]

Return a JSON array of document IDs in order of relevance.
Consider: temporal match, popularity, uniqueness, cultural significance.
```

##### `summarizeResults(query, documents): Promise<Summary>`
Generates engaging, human-readable summary.

**LLM Prompt:**
```
You are an expert travel writer. Create a compelling summary.

Query: Best food festivals in Delhi this October

Top Content: [top 10 results]

Return JSON with:
- headline: catchy title (5-10 words)
- overview: compelling description (2-3 sentences)
- highlights: [5 must-see/do items]
- bestTime: when to visit
- tips: [3-5 local insights]
```

**Example Output:**
```json
{
  "headline": "Delhi's October Food Festival Extravaganza",
  "overview": "October transforms Delhi into a food lover's paradise with vibrant street food festivals, traditional celebrations, and culinary events. Experience authentic flavors amidst perfect autumn weather.",
  "highlights": [
    "Chandni Chowk Food Walk during Dussehra",
    "National Street Food Festival at Jawaharlal Nehru Stadium",
    "Diwali Sweets Festival at India Gate",
    "Old Delhi Heritage Food Tour",
    "Seasonal Chaat Festival in Connaught Place"
  ],
  "bestTime": "Early October for Dussehra celebrations, late October for Diwali festivities",
  "tips": [
    "Visit early morning for the best street food experience",
    "Carry cash as many vendors don't accept cards",
    "Try jalebi-rabri at Dariba Kalan",
    "Book heritage walks in advance",
    "Stay hydrated and pace yourself"
  ]
}
```

---

### 2. **KnowledgeGraph** (`src/graph/knowledge.graph.ts`)

Uses LangGraph to create a dynamic knowledge graph for contextual recommendations.

#### Architecture:

```
State Machine (LangGraph):

    ┌──────────────┐
    │  __start__   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ load_subgraph    │ ← Load relevant nodes & edges from DB
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │ find_relations   │ ← Graph traversal (BFS)
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │score_recommenda- │ ← Score by popularity, proximity, similarity
    │     tions        │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │   __end__    │
    └──────────────┘
```

#### Graph Structure:

**Node Types:**
- `city`: Geographic location nodes
- `month`: Temporal nodes
- `category`: Interest/theme nodes (food, culture, adventure)
- `festival`, `attraction`, `place`, `event`: Entity nodes

**Edge Types:**
- `located_in`: Entity → City
- `happens_during`: Entity → Month
- `related_to`: Entity → Category
- `nearby`: Entity ↔ Entity (within 5km)
- `similar_to`: Entity ↔ Entity (shared categories)

#### Example Graph:

```
    [Delhi]
       ↑ located_in
       │
  ┌────┴────┬────────────┬──────────┐
  │         │            │          │
[Diwali  [Street    [Heritage   [Chaat
 Festival] Food      Walk]      Festival]
           Festival]
  │         │            │          │
  ↓         ↓            ↓          ↓
[October] [October]  [October]  [October]
           ↑ happens_during
           │
      [Food] ← related_to
   (category)
```

#### Key Methods:

##### `query(entities: QueryEntities): Promise<Recommendation[]>`
Executes the LangGraph state machine.

**Process:**
1. **Load Subgraph:** Fetch nodes and edges relevant to query
2. **Find Relations:** BFS traversal to discover connections
3. **Score Recommendations:** Rank by multiple factors

##### `loadNodesForQuery(query: QueryEntities): Promise<GraphNode[]>`
Loads relevant nodes from database.

**Loaded Nodes:**
```typescript
[
  { id: 'city:delhi', type: 'city', properties: { name: 'Delhi' } },
  { id: 'month:october', type: 'month', properties: { name: 'October' } },
  { id: 'category:food', type: 'category', properties: { name: 'food' } },
  { id: 'entity:123', type: 'festival', properties: { 
      mongoId: '123', 
      title: 'Street Food Festival',
      coordinates: [77.2090, 28.6139]
    }
  },
  // ... more entity nodes
]
```

##### `loadEdgesForNodes(nodes: GraphNode[]): Promise<GraphEdge[]>`
Creates edges based on relationships.

**Edge Creation Logic:**
```typescript
// 1. Entity → City
edges.push({ source: 'entity:123', target: 'city:delhi', type: 'located_in', weight: 1.0 })

// 2. Entity → Month (if dates overlap)
edges.push({ source: 'entity:123', target: 'month:october', type: 'happens_during', weight: 1.0 })

// 3. Entity → Category
edges.push({ source: 'entity:123', target: 'category:food', type: 'related_to', weight: 0.8 })

// 4. Entity ↔ Entity (proximity)
if (distance < 5km) {
  weight = 1 - (distance / 5)
  edges.push({ source: 'entity:123', target: 'entity:456', type: 'nearby', weight })
}

// 5. Entity ↔ Entity (similarity)
commonCategories = intersection(categories1, categories2)
similarity = commonCategories.length / max(categories1.size, categories2.size)
edges.push({ source: 'entity:123', target: 'entity:456', type: 'similar_to', weight: similarity })
```

##### `traverseGraph(nodes, edges, query): Recommendation[]`
BFS traversal to find recommendations.

**Algorithm:**
```typescript
// Start from query nodes (city, month, category)
queue = [cityNode, monthNode, categoryNode]
visited = new Set()
recommendations = []

while (queue.length > 0) {
  const { node, depth, path } = queue.shift()
  
  if (depth > 3) continue // Max depth 3
  
  // Find connected nodes
  for (edge of getConnectedEdges(node)) {
    targetNode = getTargetNode(edge)
    
    // If target is an entity, add to recommendations
    if (isEntity(targetNode)) {
      recommendations.push({
        entity: targetNode,
        score: edge.weight * (1 - depth * 0.2), // Decay by depth
        relationshipType: edge.type,
        reason: explainPath(path)
      })
    }
    
    queue.push({ node: targetNode, depth: depth + 1, path: [...path, edge.type] })
  }
}
```

##### `scoreRecommendations(recommendations, query): Recommendation[]`
Enhanced scoring based on multiple factors.

**Scoring Formula:**
```typescript
finalScore = baseScore 
  × (1 + popularity × 0.2)           // Boost popular places
  × (1 + interestMatch × 0.1)        // Boost matching interests
  × (relationshipType === 'nearby' ? 1.2 : 1.0)  // Boost nearby items
```

##### `getRelatedEntities(entityId, limit): Promise<Recommendation[]>`
Find recommendations for a specific entity.

**Use Case:** "Show me things to do near Diwali Festival"

**Process:**
1. Find nearby entities (geospatial query, 5km radius)
2. Find similar entities (same categories)
3. Combine and deduplicate
4. Score by distance and similarity
5. Return top N

---

### 3. **Database Manager** (`src/database/connection.ts`)

Manages connections to MongoDB, Redis, and Weaviate.

#### MongoDB Connection
- **Purpose:** Store structured place/event data
- **Schema:** Places with location, dates, metadata, media
- **Indexes:** City, date range, categories, geospatial (2dsphere)

#### Redis Connection
- **Purpose:** Cache query results and rate limiting
- **TTL:** 1 hour for query results
- **Key Pattern:** `query:{cacheKey}:v1`

#### Weaviate Connection
- **Purpose:** Vector search for semantic similarity
- **Schema:** TravelContent class with embeddings
- **Search:** Near-vector queries with filters

---

### 4. **Data Models** (`src/database/models.ts`)

#### Place Schema
```typescript
{
  type: 'festival' | 'attraction' | 'event' | 'place' | 'experience',
  title: string,
  description: string,
  location: {
    city: string,
    country: string,
    coordinates: [longitude, latitude]  // GeoJSON format
  },
  dates: {
    start: Date,
    end: Date,
    flexible: boolean
  },
  metadata: {
    category: string[],      // ['food', 'culture', 'nightlife']
    tags: string[],
    popularity: number,      // 0-1 score
    cost: string,
    duration: string,
    crowdLevel: 'low' | 'medium' | 'high' | 'very high',
    openingHours: string,
    bestTimeToVisit: string
  },
  media: {
    images: string[],
    videos: string[],
    virtualTour: string
  },
  source: {
    url: string,
    domain: string,
    crawledAt: Date,
    lastUpdated: Date
  },
  embedding: number[],      // 1536-dim vector
  confidence: number,       // 0-1 data quality score
  searchableText: string    // For text search
}
```

**Indexes:**
- `location.coordinates`: 2dsphere (geospatial)
- `dates.start`, `dates.end`: Range queries
- `metadata.category`: Array index
- `metadata.popularity`: Sorting
- `searchableText`: Text search

---

## Processing Pipeline

### Pipeline Stages

#### Stage 1: Request Reception
```
Client Request → Fastify → Validation → Rate Limiting
```

**Technologies:**
- Fastify (high-performance web framework)
- Zod (schema validation)
- @fastify/rate-limit (rate limiting)

**Request Validation:**
```typescript
const DiscoveryRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    types: z.array(z.string()).optional(),
    budget: z.string().optional(),
    duration: z.number().optional()
  }).optional(),
  preferences: z.object({
    interests: z.array(z.string()).optional(),
    pace: z.enum(['relaxed', 'moderate', 'fast']).optional()
  }).optional()
})
```

#### Stage 2: NLP Processing
```
Natural Language → LLM (GPT-4o-mini) → Structured Entities
```

**Entity Extraction:**
- Uses few-shot prompting
- Extracts: city, country, month, year, interests, event types, duration
- Handles ambiguity and implicit information

#### Stage 3: Caching Layer
```
Entities → SHA256 Hash → Redis Lookup
```

**Cache Strategy:**
- Key: `query:{SHA256(normalized_entities)}:v1`
- TTL: 1 hour (configurable)
- Versioned keys for cache invalidation

#### Stage 4: Embedding Generation
```
Query Text → OpenAI Embeddings API → 1536-dim Vector
```

**Embedding Model:**
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Cost: ~$0.00002 per 1K tokens

#### Stage 5: Hybrid Retrieval
```
┌─────────────────────────────────────────────┐
│          Hybrid Search Strategy             │
│                                             │
│  Vector Search (Semantic)  ┌────────────┐   │
│         Weaviate          │            │   │
│         ↓                 │  Merge &   │   │
│    Top 30 results ─────→  │ Dedupe    │→  │
│         ↓                 │            │   │
│  Keyword Search (Filter)  └────────────┘   │
│      MongoDB                                │
│         ↓                                   │
│    Top 30 results ─────→                    │
└─────────────────────────────────────────────┘
```

**Why Hybrid?**
- **Vector Search:** Captures semantic meaning, finds similar concepts
- **Keyword Search:** Precise filtering, structured queries
- **Combined:** Best of both worlds

#### Stage 6: LLM Re-ranking
```
Documents → GPT-4o-mini → Ranked IDs → Reordered Results
```

**Re-ranking Criteria:**
- Temporal relevance (matches query dates)
- Popularity and ratings
- Uniqueness and cultural significance
- User intent alignment

#### Stage 7: Content Generation
```
Top Results → GPT-4o-mini → Human-readable Summary
```

**Generated Content:**
- Headline (engaging title)
- Overview (compelling description)
- Highlights (top 5 must-dos)
- Best time to visit
- Local tips and insights

#### Stage 8: Graph Enhancement
```
Entities → LangGraph → BFS Traversal → Recommendations
```

**Graph Processing:**
- Build subgraph from entities
- Create edges based on relationships
- Traverse using BFS (max depth 3)
- Score by distance, similarity, popularity

#### Stage 9: Response Assembly
```
All Components → Structured JSON → Cache → Return
```

---

## Knowledge Graph System

### Graph Construction

#### Dynamic Graph Building
The graph is built **on-the-fly** for each query:

1. **Node Loading:**
   - City nodes (from query)
   - Month nodes (from query)
   - Category nodes (from query interests)
   - Entity nodes (from database matching filters)

2. **Edge Creation:**
   - Geographic relationships (located_in)
   - Temporal relationships (happens_during)
   - Categorical relationships (related_to)
   - Proximity relationships (nearby, <5km)
   - Similarity relationships (similar_to, shared categories)

3. **Graph Traversal:**
   - Start from query nodes (city, month, category)
   - BFS to explore connections
   - Max depth: 3 hops
   - Collect entity nodes as recommendations

### Recommendation Scoring

**Multi-factor Scoring:**
```typescript
score = baseScore                        // Edge weight
  × (1 + popularity × 0.2)              // Popular places get boost
  × (1 + interestMatch × 0.1)           // Interest alignment
  × (relationshipType === 'nearby' ? 1.2 : 1.0)  // Proximity boost
  × (1 - depth × 0.2)                   // Depth penalty
```

**Sorting:**
```typescript
recommendations.sort((a, b) => b.score - a.score).slice(0, 20)
```

### Example Recommendation

```json
{
  "entity": {
    "id": "64f2...",
    "type": "attraction",
    "title": "Red Fort Light and Sound Show",
    "description": "Historic evening spectacle...",
    "location": { "city": "Delhi", "coordinates": [77.241, 28.656] }
  },
  "reason": "0.8km away",
  "score": 0.92,
  "relationshipType": "nearby",
  "distance": "0.8 km"
}
```

---

## API Endpoints

### POST `/api/v1/discover`
Main discovery endpoint with natural language processing.

**Request:**
```json
{
  "query": "Best food festivals in Delhi this October",
  "filters": {
    "types": ["festival", "event"],
    "budget": "medium"
  },
  "preferences": {
    "interests": ["food", "culture"],
    "pace": "moderate"
  }
}
```

**Response:**
```json
{
  "query": "Best food festivals in Delhi this October",
  "entities": {
    "city": "Delhi",
    "country": "India",
    "month": "October",
    "year": 2025,
    "interests": ["food"],
    "eventType": ["festival"]
  },
  "summary": {
    "headline": "Delhi's October Food Festival Extravaganza",
    "overview": "October transforms Delhi into a food lover's paradise...",
    "highlights": ["..."],
    "bestTime": "Early October for Dussehra...",
    "tips": ["..."]
  },
  "results": {
    "festivals": [...],
    "attractions": [...],
    "places": [...],
    "events": [...]
  },
  "recommendations": [...],
  "metadata": {
    "totalResults": 42,
    "processingTime": 3245,
    "cached": false,
    "sources": ["timesofindia.com", "delhitourism.gov.in"],
    "generatedAt": "2025-10-22T10:30:00Z"
  }
}
```

### GET `/api/v1/entity/:id`
Get detailed information about a specific entity.

**Request:**
```
GET /api/v1/entity/64f2abc123?includeRecommendations=true
```

**Response:**
```json
{
  "id": "64f2abc123",
  "type": "festival",
  "title": "National Street Food Festival",
  "description": "...",
  "location": { ... },
  "dates": { ... },
  "metadata": { ... },
  "media": { ... },
  "recommendations": [...]
}
```

### POST `/api/v1/recommendations`
Get personalized recommendations based on a specific entity.

**Request:**
```json
{
  "baseEntity": "64f2abc123",
  "context": {
    "visitedPlaces": ["64f2xyz456"],
    "interests": ["food", "culture"],
    "duration": 3
  },
  "limit": 10
}
```

### GET `/api/v1/trending/:city`
Get trending places and events for a city.

**Request:**
```
GET /api/v1/trending/Delhi?limit=20
```

**Response:**
```json
{
  "city": "Delhi",
  "trending": [...],
  "count": 20
}
```

### GET `/api/v1/search`
Simple text search across all entities.

**Request:**
```
GET /api/v1/search?q=diwali&limit=20
```

### GET `/api/v1/stats`
System statistics and health metrics.

**Response:**
```json
{
  "database": {
    "totalEntities": 15432,
    "entitiesByType": {
      "festival": 3421,
      "attraction": 6543,
      "place": 4321,
      "event": 1147
    }
  },
  "system": {
    "uptime": 345678,
    "memory": { ... }
  }
}
```

---

## Data Flow Diagrams

### Complete System Data Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/v1/discover
       │    { query: "..." }
       ▼
┌─────────────────────────────┐
│    Fastify API Server       │
│  • Validate (Zod)           │
│  • Rate limit check         │
│  • Log request              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Discovery Chain            │
│  execute(query)             │
└──────┬──────────────────────┘
       │
       ├─ 2. extractEntities(query)
       │   └─→ OpenAI GPT-4o-mini
       │       ↓
       │   QueryEntities { city, month, interests... }
       │
       ├─ 3. generateCacheKey(entities)
       │   └─→ SHA256 hash
       │       ↓
       │   cacheKey: "a3f2b9..."
       │
       ├─ 4. checkCache(cacheKey)
       │   └─→ Redis GET query:a3f2b9...:v1
       │       ├─ HIT  → return cached [EXIT]
       │       └─ MISS → continue
       │
       ├─ 5. embedQuery(query)
       │   └─→ OpenAI Embeddings API
       │       ↓
       │   vector: [0.123, -0.456, ...] (1536-dim)
       │
       ├─ 6. retrieveRelevantContent(entities, vector)
       │   ├─→ vectorSearch()
       │   │   └─→ Weaviate
       │   │       ↓
       │   │   30 results (semantic)
       │   │
       │   ├─→ keywordSearch()
       │   │   └─→ MongoDB
       │   │       ↓
       │   │   30 results (filtered)
       │   │
       │   └─→ merge & dedupe
       │       ↓
       │   ~45 unique documents
       │
       ├─ 7. rerankResults(query, documents)
       │   └─→ OpenAI GPT-4o-mini
       │       ↓
       │   Ranked IDs: ["doc3", "doc1", "doc5", ...]
       │
       ├─ 8. summarizeResults(query, topDocs)
       │   └─→ OpenAI GPT-4o-mini
       │       ↓
       │   Summary { headline, overview, highlights, tips }
       │
       └─ 9. categorizeResults(documents)
           ↓
       { festivals: [], attractions: [], places: [], events: [] }
       │
       ▼
┌─────────────────────────────┐
│  Knowledge Graph            │
│  query(entities)            │
└──────┬──────────────────────┘
       │
       ├─ 10. loadNodesForQuery()
       │   └─→ MongoDB
       │       ↓
       │   GraphNode[] (city, month, category, entities)
       │
       ├─ 11. loadEdgesForNodes()
       │   ├─→ Create location edges
       │   ├─→ Create temporal edges
       │   ├─→ Create category edges
       │   ├─→ Calculate proximity edges
       │   └─→ Calculate similarity edges
       │       ↓
       │   GraphEdge[] (relationships)
       │
       ├─ 12. traverseGraph() [BFS]
       │   ↓
       │   Recommendation[] (scored)
       │
       └─ 13. scoreRecommendations()
           ↓
       Top 20 recommendations
       │
       ▼
┌─────────────────────────────┐
│  Assemble Response          │
│  {                          │
│    query,                   │
│    entities,                │
│    summary,                 │
│    results,                 │
│    recommendations,         │
│    metadata                 │
│  }                          │
└──────┬──────────────────────┘
       │
       ├─ 14. cacheResult()
       │   └─→ Redis SETEX query:a3f2b9...:v1 3600
       │
       ▼
┌─────────────────────────────┐
│  Return to Client           │
│  HTTP 200 OK                │
│  Processing time: 3.2s      │
└─────────────────────────────┘
```

---

## Performance Optimization

### 1. **Multi-layer Caching**

**L1: Redis Query Cache**
- Cache complete query results
- TTL: 1 hour
- Hit rate: ~60-70%

**L2: Embedding Cache**
- Cache embeddings for common queries
- TTL: 24 hours

**L3: MongoDB Query Cache**
- Built-in MongoDB query cache
- Indexes accelerate lookups

### 2. **Parallel Execution**

**Concurrent Operations:**
```typescript
const [vectorResults, keywordResults] = await Promise.all([
  this.vectorSearch(entities, embeddings),
  this.keywordSearch(entities)
]);
```

**Benefits:**
- Reduces total latency
- Vector + keyword search in parallel
- Database queries in parallel

### 3. **Indexed Queries**

**MongoDB Indexes:**
- Geospatial (2dsphere): O(log n) proximity search
- Compound indexes: City + Date + Category
- Text index: Full-text search

**Weaviate Indexes:**
- HNSW (Hierarchical Navigable Small World)
- Fast approximate nearest neighbor search

### 4. **Result Limiting**

- Vector search: 30 results max
- Keyword search: 30 results max
- Merged: ~40-50 results
- Final: Top 20 after scoring

### 5. **Connection Pooling**

**MongoDB:**
- Pool size: 10 connections
- Min pool size: 2

**Redis:**
- Persistent connection
- Pipelining for batch operations

### 6. **Rate Limiting**

**Configuration:**
- Max: 100 requests per minute per IP
- Window: 60 seconds
- Skip for localhost

### 7. **Lazy Loading**

- Media URLs: Not embedded, referenced
- Full documents: Only fetch when needed
- Recommendations: Optional parameter

---

## Error Handling

### Error Categories

#### 1. **Validation Errors** (400)
```typescript
if (error.name === 'ZodError') {
  return reply.code(400).send({
    error: 'Invalid request',
    details: error.errors
  });
}
```

#### 2. **Not Found** (404)
```typescript
if (!entity) {
  return reply.code(404).send({
    error: 'Entity not found'
  });
}
```

#### 3. **Rate Limit** (429)
```typescript
// Handled by @fastify/rate-limit
{
  error: 'Too Many Requests',
  message: 'Rate limit exceeded',
  retryAfter: 60
}
```

#### 4. **Server Errors** (500)
```typescript
fastify.setErrorHandler((error, request, reply) => {
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: request.url
  });

  reply.status(error.statusCode || 500).send({
    error: error.name,
    message: error.message,
    statusCode: error.statusCode || 500
  });
});
```

### Graceful Degradation

**If OpenAI API fails:**
- Fall back to keyword search only
- Return results without AI summary
- Log error for monitoring

**If Weaviate fails:**
- Use MongoDB keyword search only
- Continue processing

**If Redis fails:**
- Skip caching
- Continue without cache

**If LLM reranking fails:**
- Use original search order
- Log warning

---

## Environment Configuration

### Required Environment Variables

```bash
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# MongoDB
MONGODB_URI=mongodb://localhost:27017/travel_discovery

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Weaviate
WEAVIATE_HOST=http://localhost:8080
WEAVIATE_API_KEY=

# Features
ENABLE_CACHING=true
ENABLE_STREAMING=false

# Performance
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
CACHE_TTL_QUERY_RESULT=3600

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## Monitoring & Logging

### Logging Strategy

**Winston Logger:**
```typescript
logger.info('Discovery request', { query, ip });
logger.error('Entity extraction failed', { error, query });
logger.warn('Cache check failed', { cacheKey });
```

**Log Levels:**
- `info`: Request/response, success events
- `warn`: Recoverable errors, fallbacks
- `error`: Critical failures, exceptions

### Metrics to Monitor

1. **Request Metrics:**
   - Total requests per minute
   - Success rate
   - Average response time
   - P95, P99 latency

2. **Cache Metrics:**
   - Hit rate
   - Miss rate
   - Cache size

3. **Database Metrics:**
   - Query time
   - Connection pool usage
   - Index efficiency

4. **AI Metrics:**
   - OpenAI API latency
   - Token usage
   - API errors

5. **Business Metrics:**
   - Popular queries
   - Top cities
   - Category distribution

6. **Crawler Metrics:**
   - Crawl success rate
   - Average crawl duration
   - Data freshness (time since last crawl)
   - Source availability
   - ETL job completion rate

---

## Data Freshness & Crawler Scheduling

### Keeping Data Up-to-Date

The crawler system ensures fresh travel data through multiple strategies:

#### 1. **Scheduled Crawls (Recommended)**

Use cron jobs to automatically refresh data:

```bash
# Add to crontab (Linux/Mac)
# Crawl popular cities daily at 2 AM
0 2 * * * cd /path/to/discovery-engine && npm run crawl:batch -- -f cities.json

# Crawl specific city weekly (Sunday 3 AM)
0 3 * * 0 cd /path/to/discovery-engine && npm run crawl -- -c "Delhi" -C "India"
```

**Docker Compose with Cron:**
```yaml
services:
  crawler-scheduler:
    image: discovery-engine:latest
    command: sh -c "while true; do npm run crawl:batch -- -f /data/cities.json; sleep 86400; done"
    volumes:
      - ./cities.json:/data/cities.json
    depends_on:
      - mongodb
      - redis
      - weaviate
```

#### 2. **On-Demand Crawls**

Trigger crawls manually when needed:

```bash
# CLI
npm run crawl -- -c "Paris" -C "France"

# API
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "country": "France", "background": true}'
```

#### 3. **Smart Cache Invalidation**

The crawler automatically manages cache:

- **Crawl Cache TTL:** 24 hours
- **Query Cache TTL:** 1 hour
- After successful crawl → cache is refreshed
- ETL worker updates Weaviate → semantic search gets fresh embeddings

#### 4. **Event-Driven Crawls**

Trigger crawls based on user demand:

```typescript
// In discovery.chain.ts
async execute(query: string): Promise<DiscoveryResponse> {
  const entities = await this.extractEntities(query);
  
  // Check data freshness
  const lastCrawl = await this.getLastCrawlTime(entities.city);
  const hoursSinceLastCrawl = (Date.now() - lastCrawl) / (1000 * 60 * 60);
  
  // If data is stale (> 24 hours), trigger background crawl
  if (hoursSinceLastCrawl > 24) {
    logger.info(`Triggering background crawl for ${entities.city}`);
    await crawlerQueue.add('crawl-job', {
      city: entities.city,
      country: entities.country,
      priority: 'high'
    });
  }
  
  // Continue with discovery using existing data
  // Fresh data will be available for next query
}
```

### Recommended Crawl Schedule

**Popular Cities (High Traffic):**
- Frequency: Daily
- Time: Off-peak hours (2-4 AM)
- Cities: Delhi, Mumbai, Paris, London, New York, Tokyo

**Medium Cities:**
- Frequency: 2-3 times per week
- Time: Off-peak hours
- Cities: Regional capitals, tourist destinations

**Small Cities:**
- Frequency: Weekly
- Time: Weekends
- Cities: On-demand only

**Event-Heavy Periods:**
- Festivals, holidays, peak seasons
- Frequency: Twice daily (morning & evening)
- Duration: 1-2 weeks before event

### Monitoring Data Freshness

**Check last crawl time:**
```bash
npm run crawl:stats
```

**Output:**
```json
{
  "totalCrawls": 1247,
  "byCity": {
    "Delhi": {
      "lastCrawl": "2025-01-15T02:15:30Z",
      "hoursAgo": 12,
      "documentsCollected": 187,
      "status": "fresh"
    },
    "Paris": {
      "lastCrawl": "2025-01-10T03:20:00Z",
      "hoursAgo": 120,
      "documentsCollected": 234,
      "status": "stale"
    }
  }
}
```

**Health Check Endpoint:**
```bash
curl http://localhost:3000/api/v1/admin/health/data-freshness

# Response:
{
  "status": "healthy",
  "staleCities": ["Paris", "Rome"],
  "freshCities": ["Delhi", "Mumbai"],
  "recommendation": "Crawl Paris and Rome within 6 hours"
}
```

### Production Deployment

**1. Setup Docker Compose with Crawler:**
```bash
cd travel-ecosystem/services/discovery-engine
docker-compose up -d
```

**2. Initialize Database:**
```bash
npm run setup
```

**3. Initial Data Population:**
```bash
# Create cities.json with your target cities
npm run crawl:batch -- -f cities.json
```

**4. Monitor ETL Jobs:**
```bash
# Check BullMQ dashboard
npm run queue:ui
# Or manually check
npm run queue:status
```

**5. Verify Data in Weaviate:**
```bash
curl http://localhost:8080/v1/objects?class=TravelContent&limit=10
```

### Troubleshooting

**Crawler Fails:**
- Check browser installation: `npm run playwright:install`
- Check network connectivity
- Check rate limits (increase delay in `.env`)

**ETL Jobs Stuck:**
- Check Redis connection
- Check OpenAI API quota
- Restart worker: `npm run worker:restart`

**Stale Data:**
- Check crawler logs: `tail -f logs/crawler.log`
- Manually trigger crawl: `npm run crawl -- -c "City" -C "Country"`
- Clear cache: `npm run crawl:clear-cache`

---

## Summary

The Discovery Engine implements a **sophisticated AI-powered travel search and recommendation system** with **automated data collection capabilities**:

### Core Features

✅ **Automated Web Crawling** - Fresh data from 6 premium sources  
✅ **Natural Language Understanding** via GPT-4o-mini  
✅ **Semantic Search** via OpenAI Embeddings + Weaviate  
✅ **Hybrid Retrieval** combining vector and keyword search  
✅ **Intelligent Reranking** using LLM  
✅ **AI-Generated Summaries** for human-readable results  
✅ **Graph-Based Recommendations** via LangGraph  
✅ **Background ETL Pipeline** for data enrichment  
✅ **Multi-layer Caching** for performance  
✅ **Robust Error Handling** and graceful degradation  

### Typical Data Flow

**Data Collection:**
```
Web Sources → Crawlers → MongoDB (raw) → ETL Worker 
→ Embeddings + Enrichment → Weaviate (vectors) → Ready for Discovery
```

**User Request:**
```
User Query → Entity Extraction → Cache Check → Hybrid Search 
→ LLM Reranking → Summary Generation → Graph Recommendations 
→ Cache Store → Response (2-5 seconds)
```

### Key Technologies

**Data Collection:**
- Playwright (headless browser automation)
- BullMQ (background job processing)
- Redis (caching, job queue)
- 6 data sources (TimeOut, Eventbrite, TripAdvisor, Google, Lonely Planet, Atlas Obscura)

**AI & Search:**
- LangChain + LangGraph for AI orchestration
- OpenAI GPT-4o-mini for LLM
- OpenAI text-embedding-3-small for embeddings
- Weaviate for vector search
- MongoDB for structured storage

**Infrastructure:**
- Fastify for high-performance API
- Docker Compose for service orchestration
- TypeScript for type safety

### Production Deployment

**Quick Start:**
```bash
# 1. Start services
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Setup databases
npm run setup

# 4. Initial data crawl
npm run crawl:batch -- -f cities.json

# 5. Start API server
npm start
```

**CLI Commands:**
```bash
# Crawl a city
npm run crawl -- -c "Delhi" -C "India"

# Test a source
npm run crawl:test -- -s timeout -c "Paris" -C "France"

# View statistics
npm run crawl:stats

# Clear cache
npm run crawl:clear-cache
```

**Admin API:**
```bash
# Trigger background crawl
POST /api/v1/admin/crawl

# Check crawl status
GET /api/v1/admin/crawl/status/:jobId

# View statistics
GET /api/v1/admin/crawl/stats
```

This architecture enables **intelligent, contextual, and personalized travel discovery** with **always-fresh data** at scale.
