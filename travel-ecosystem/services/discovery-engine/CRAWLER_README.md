# Discovery Engine Crawler System

## Overview

The crawler system collects travel data from multiple sources including events, festivals, attractions, and points of interest. It uses Playwright for web scraping with built-in rate limiting, caching, and error handling.

## Architecture

```
crawlers/
├── base.crawler.ts          # Base crawler class with common functionality
├── event.crawler.ts         # Event & festival crawler
├── attraction.crawler.ts    # Tourist attraction crawler
└── index.ts                # Crawler manager & orchestration
```

## Features

- **Multi-source Crawling**: TimeOut, Eventbrite, TripAdvisor, Lonely Planet, Atlas Obscura
- **Smart Rate Limiting**: Configurable requests per second
- **Caching**: Redis-based URL caching to avoid duplicate crawls
- **Retry Logic**: Automatic retries with exponential backoff
- **Batch Processing**: Concurrent request handling with limits
- **Stealth Mode**: Anti-detection measures for reliable scraping
- **Data Validation**: Structured data extraction with fallbacks

## Data Sources

### Event Crawlers
1. **TimeOut** - Events, festivals, and happenings
2. **Eventbrite** - Ticketed events and activities
3. **TripAdvisor** - Things to do and attractions with reviews

### Attraction Crawlers
1. **Google Search** - Tourist attractions from knowledge panels
2. **Lonely Planet** - Travel destinations and attractions
3. **Atlas Obscura** - Unique and hidden gem attractions

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Configuration

Environment variables (`.env`):

```bash
# Crawler Configuration
CRAWLER_RATE_LIMIT=10                    # Requests per second
CRAWLER_CONCURRENT_REQUESTS=5             # Parallel requests
CRAWLER_USER_AGENT=TravelDiscoveryBot/1.0

# Cache Configuration
CACHE_TTL_QUERY_RESULT=3600              # 1 hour
CACHE_TTL_ENTITY_DETAIL=86400            # 24 hours

# Database
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Usage

### CLI Commands

#### 1. Crawl a Single City

```bash
npm run crawl -- -c "Delhi" -C "India" -t events,attractions
```

Options:
- `-c, --city`: City name (required)
- `-C, --country`: Country name (required)
- `-t, --types`: Types to crawl (events, attractions)
- `--start-date`: Start date filter (YYYY-MM-DD)
- `--end-date`: End date filter (YYYY-MM-DD)

#### 2. Batch Crawl Multiple Cities

Create a JSON file with cities:

```json
[
  { "city": "Delhi", "country": "India" },
  { "city": "Mumbai", "country": "India" },
  { "city": "Paris", "country": "France" }
]
```

Run batch crawl:

```bash
npm run crawl -- crawl-batch -f cities.json -t events,attractions
```

#### 3. Test a Specific Crawler

```bash
npm run crawl:test -- -s timeout -c "Delhi" -C "India"
```

Available sources:
- `timeout` - TimeOut events
- `eventbrite` - Eventbrite events
- `tripadvisor` - TripAdvisor attractions
- `lonelyplanet` - Lonely Planet attractions
- `atlasobscura` - Atlas Obscura unique places
- `google` - Google search attractions

#### 4. View Statistics

```bash
npm run crawl:stats
```

Shows:
- Total places crawled
- Breakdown by type (events, attractions)
- Breakdown by city
- Breakdown by source
- Recently crawled (last 24h)

#### 5. Clear Cache

```bash
# Clear all cache
npm run cli -- clear-cache --all

# Clear specific URL
npm run cli -- clear-cache --url "https://example.com/page"
```

### Programmatic Usage

```typescript
import { crawlerManager } from './crawlers';

// Crawl and save
const result = await crawlerManager.crawlAndSave({
  city: 'Delhi',
  country: 'India',
  types: ['events', 'attractions'],
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31')
});

console.log(`Crawled: ${result.crawled}, Saved: ${result.saved}`);

// Get statistics
const stats = await crawlerManager.getStatistics();
console.log(stats);
```

### API Endpoints

#### Trigger Crawler (Admin)

```bash
POST /api/v1/admin/crawl
Content-Type: application/json

{
  "city": "Delhi",
  "country": "India",
  "types": ["events", "attractions"]
}
```

Response:
```json
{
  "status": "completed",
  "city": "Delhi",
  "country": "India",
  "crawled": 156,
  "saved": 142
}
```

#### Get Crawler Statistics

```bash
GET /api/v1/admin/crawler-stats
```

Response:
```json
{
  "totalPlaces": 5432,
  "byType": {
    "event": 2156,
    "attraction": 3276
  },
  "byCity": {
    "Delhi": 856,
    "Mumbai": 743
  },
  "bySources": {
    "timeout": 1234,
    "tripadvisor": 2345
  },
  "recentlyCrawled": 156
}
```

## Background Workers

For production, use BullMQ workers for background processing:

### Start Crawler Worker

```bash
npm run worker:crawler
```

### Start ETL Worker

```bash
npm run worker:etl
```

### Queue a Job

```typescript
import { addCrawlerJob } from './workers/crawler.worker';

// Queue crawler job
const job = await addCrawlerJob({
  type: 'city',
  city: 'Delhi',
  country: 'India',
  types: ['events', 'attractions']
});

console.log(`Job queued: ${job.id}`);
```

## Data Flow

```
1. Crawler → Extract raw data from websites
2. Transform → Structure data, categorize, extract tags
3. Validate → Check required fields, normalize values
4. Deduplicate → Merge duplicate entries
5. Save → Store in MongoDB
6. Generate Embeddings → Create vector embeddings (ETL worker)
7. Sync to Weaviate → Vector database for semantic search
```

## Crawler Best Practices

### Rate Limiting
- Default: 10 requests/second per crawler
- Automatic wait between requests
- Respects exponential backoff on errors

### Caching
- URLs cached for 12-24 hours (configurable)
- Reduces redundant crawls
- Clear cache when testing

### Error Handling
- 3 retry attempts with exponential backoff
- Graceful degradation on failures
- Detailed error logging

### Stealth Measures
- Random user agents
- Remove automation flags
- Realistic viewport sizes
- Network idle detection

## Troubleshooting

### Issue: Selectors not found

**Solution**: Websites change their HTML structure. Update selectors in crawler files:

```typescript
// In event.crawler.ts or attraction.crawler.ts
await page.waitForSelector('[class*="event"]', { timeout: 10000 });
```

### Issue: Rate limiting/blocking

**Solution**: 
1. Increase delay between requests
2. Use different user agents
3. Add proxy support (future enhancement)

### Issue: No data extracted

**Solution**:
1. Test with CLI: `npm run crawl:test`
2. Check website in browser
3. Verify selectors are still valid
4. Check network requests for API endpoints

### Issue: Duplicates in database

**Solution**: Run deduplication:

```bash
# Via ETL worker
npm run worker:etl
```

Or programmatically:
```typescript
import { addETLJob } from './workers/etl.worker';

await addETLJob({
  operation: 'deduplicate'
});
```

## Future Enhancements

- [ ] Add more sources (Booking.com, Airbnb Experiences)
- [ ] Proxy rotation for scaling
- [ ] AI-powered content extraction
- [ ] Real-time monitoring dashboard
- [ ] Webhook notifications on completion
- [ ] Scheduled crawls (cron jobs)
- [ ] Export data to CSV/JSON
- [ ] API for custom crawlers

## Performance Metrics

Typical performance (based on testing):

| Metric | Value |
|--------|-------|
| Events per city | 30-60 items |
| Attractions per city | 40-80 items |
| Crawl time per city | 2-5 minutes |
| Success rate | 85-95% |
| Cache hit rate | 60-70% |

## Contributing

When adding new crawlers:

1. Extend `BaseCrawler` class
2. Implement `crawl()` method
3. Return `CrawlResult[]` array
4. Add source to `CrawlerManager`
5. Test with CLI before production

Example:

```typescript
export class CustomCrawler extends BaseCrawler {
  getName(): string {
    return 'CustomCrawler';
  }

  async crawl(params: any): Promise<CrawlResult[]> {
    // Implementation
  }
}
```

## License

MIT
