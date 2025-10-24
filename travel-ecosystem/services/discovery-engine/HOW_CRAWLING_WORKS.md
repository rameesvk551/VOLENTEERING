# 🕷️ How Crawling Works in Discovery Engine

## 📚 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Crawler Components](#crawler-components)
4. [Data Flow](#data-flow)
5. [How to Use](#how-to-use)
6. [Technical Details](#technical-details)
7. [Examples](#examples)

---

## 🎯 Overview

The Discovery Engine uses **web scraping** to automatically collect travel data from multiple sources across the internet. Think of it as a robot that visits travel websites, reads the content, and saves relevant information to your database.

### What Does It Crawl?

- **Events** (festivals, concerts, exhibitions)
- **Attractions** (monuments, museums, parks)
- **Places** (markets, neighborhoods, viewpoints)
- **Restaurants** (local cuisine, cafes)

### Data Sources

**Event Sources:**
- TimeOut (events and happenings)
- Eventbrite (ticketed events)
- TripAdvisor (things to do)

**Attraction Sources:**
- Google Search (tourist attractions)
- Lonely Planet (travel destinations)
- Atlas Obscura (hidden gems)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CRAWLER SYSTEM                         │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Crawler    │  │   Crawler    │  │   Crawler    │
│   Manager    │  │    Worker    │  │     CLI      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Base Crawler   │
                  │  (Common Logic) │
                  └─────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Event     │  │  Attraction  │  │  Restaurant  │
│   Crawler    │  │   Crawler    │  │   Crawler    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                  ┌─────────────────┐
                  │   Data Layer    │
                  └─────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │  Weaviate    │  │    Redis     │
│   (Primary)  │  │  (Vectors)   │  │   (Cache)    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🧩 Crawler Components

### 1. **Base Crawler** (`base.crawler.ts`)

The foundation class that all specific crawlers extend. Provides:

- **Browser Management**: Uses Playwright (headless Chrome)
- **Rate Limiting**: Controls request speed
- **Retry Logic**: Automatic retries on failures
- **Caching**: Avoids re-crawling recent URLs
- **Stealth Mode**: Anti-detection measures

```typescript
class BaseCrawler {
  // Initialize headless browser
  async initialize()
  
  // Navigate to URL with retries
  async navigateWithRetry(page, url)
  
  // Rate limiting (10 requests/second by default)
  async rateLimit()
  
  // Check if URL was recently crawled
  async isCached(url)
  
  // Mark URL as crawled
  async markAsCrawled(url)
}
```

### 2. **Event Crawler** (`event.crawler.ts`)

Specialized crawler for events and festivals:

```typescript
class EventCrawler extends BaseCrawler {
  // Main crawl method
  async crawl({ city, country, startDate, endDate })
  
  // Source-specific methods
  async crawlTimeOut(city, country)
  async crawlEventbrite(city, country)
  async crawlTripAdvisor(city, country)
  
  // Helper methods
  parseDate(dateString)
  categorizeEvent(title, description)
  extractTags(title, description)
}
```

**What it extracts:**
- Event title
- Description
- Date/time
- Location/venue
- Price
- Images
- Categories/tags
- Source URL

### 3. **Attraction Crawler** (`attraction.crawler.ts`)

Specialized crawler for tourist attractions:

```typescript
class AttractionCrawler extends BaseCrawler {
  async crawl({ city, country })
  
  async crawlGoogle(city, country)
  async crawlLonelyPlanet(city, country)
  async crawlAtlasObscura(city, country)
  
  extractRating(element)
  parseOpeningHours(text)
  categorizeAttraction(title, description)
}
```

**What it extracts:**
- Attraction name
- Description
- Category (museum, park, monument, etc.)
- Ratings & reviews
- Opening hours
- Price/admission
- Address & coordinates
- Photos
- Website & contact info

### 4. **Crawler Manager** (`index.ts`)

Orchestrates all crawlers and manages the crawling process:

```typescript
class CrawlerManager {
  // Crawl all data for a city
  async crawlCity({ city, country, types })
  
  // Save results to database
  async saveCrawlResults(results)
  
  // Crawl and save in one operation
  async crawlAndSave({ city, country })
  
  // Get crawling statistics
  async getStatistics()
  
  // Batch crawl multiple cities
  async batchCrawl(cities)
}
```

---

## 🔄 Data Flow

### Step-by-Step Process

```
1. USER TRIGGERS CRAWL
   └─> npm run crawl -- -c "Delhi" -C "India"

2. CRAWLER MANAGER STARTS
   ├─> Initializes browser (Playwright Chromium)
   ├─> Sets up rate limiting (10 req/sec)
   └─> Prepares Redis cache connection

3. BROWSER INITIALIZATION
   ├─> Launches headless Chrome
   ├─> Sets user agent (TravelDiscoveryBot/1.0)
   ├─> Configures stealth mode
   └─> Blocks images/styles for speed

4. SOURCE SELECTION
   └─> For Events:
       ├─> TimeOut.com
       ├─> Eventbrite.com
       └─> TripAdvisor.com

5. FOR EACH SOURCE:
   │
   ├─> CHECK CACHE
   │   ├─> Redis key: crawler:cache:<url_hash>
   │   └─> If cached (< 12h ago) → Skip
   │
   ├─> NAVIGATE TO URL
   │   ├─> Apply rate limiting
   │   ├─> Load page (wait for DOM)
   │   ├─> Retry on failure (max 3 attempts)
   │   └─> Wait for network idle
   │
   ├─> EXTRACT DATA
   │   ├─> Find event/attraction cards
   │   ├─> Extract: title, description, date, price
   │   ├─> Extract: images, links, ratings
   │   └─> Parse dates & categorize
   │
   ├─> PROCESS DATA
   │   ├─> Clean & validate fields
   │   ├─> Generate tags from text
   │   ├─> Categorize content type
   │   └─> Format for database
   │
   └─> MARK AS CRAWLED
       └─> Store URL hash in Redis (TTL: 12h)

6. AGGREGATE RESULTS
   ├─> Merge data from all sources
   ├─> Remove duplicates
   └─> Count: 156 total items found

7. SAVE TO DATABASE
   │
   ├─> FOR EACH ITEM:
   │   │
   │   ├─> CHECK IF EXISTS
   │   │   └─> MongoDB query: { name, city, type }
   │   │
   │   ├─> IF EXISTS:
   │   │   ├─> Update existing document
   │   │   ├─> Add new source to sources[]
   │   │   └─> Update timestamp
   │   │
   │   └─> IF NEW:
   │       ├─> Create new document
   │       ├─> Set initial source
   │       └─> Set creation timestamp
   │
   └─> RETURN STATISTICS
       ├─> Total crawled: 156
       ├─> New items: 89
       └─> Updated items: 67

8. CLEANUP
   ├─> Close all browser pages
   ├─> Close browser instance
   └─> Log statistics

9. COMPLETE
   └─> Return summary to user
```

---

## 📝 How to Use

### Basic Usage

#### 1. **Crawl a Single City**

```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine

# Crawl everything (events + attractions)
npm run crawl -- -c "Delhi" -C "India"

# Crawl only events
npm run crawl -- -c "Paris" -C "France" -t events

# Crawl with date filter
npm run crawl -- -c "Tokyo" -C "Japan" \
  --start-date 2025-11-01 \
  --end-date 2025-11-30
```

#### 2. **Test Crawler on Single Source**

```bash
# Test TimeOut crawler for Delhi
npm run crawl:test -- -s timeout -c "Delhi" -C "India"

# Test Eventbrite for specific dates
npm run crawl:test -- -s eventbrite -c "Mumbai" -C "India" \
  --start-date 2025-12-01
```

#### 3. **View Crawl Statistics**

```bash
# Get crawler stats
npm run crawl:stats

# Output:
# Total URLs crawled: 1,234
# Cached URLs: 456
# Success rate: 94.2%
# Average response time: 1.2s
```

#### 4. **Batch Crawl Multiple Cities**

Create `cities.json`:
```json
[
  { "city": "Delhi", "country": "India" },
  { "city": "Mumbai", "country": "India" },
  { "city": "Bangalore", "country": "India" },
  { "city": "Paris", "country": "France" },
  { "city": "London", "country": "United Kingdom" }
]
```

Run batch crawl:
```bash
npm run crawl -- --batch cities.json
```

### Advanced Usage

#### **Via API** (Programmatic)

```bash
# Trigger crawl via API
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Delhi",
    "country": "India",
    "types": ["events", "attractions"]
  }'

# Get crawler statistics
curl http://localhost:3000/api/v1/admin/crawler-stats
```

#### **Via Code** (Custom Script)

```typescript
import { CrawlerManager } from './src/crawlers';

const crawler = new CrawlerManager();

// Crawl and save
const result = await crawler.crawlAndSave({
  city: 'Delhi',
  country: 'India',
  types: ['events', 'attractions']
});

console.log(`Crawled ${result.total} items`);
console.log(`Saved ${result.saved} to database`);
```

---

## 🔧 Technical Details

### Rate Limiting

```typescript
// Default: 10 requests per second
CRAWLER_RATE_LIMIT=10

// How it works:
requestsPerSecond = requestCount / elapsed
if (requestsPerSecond > limit) {
  wait(1000ms)
}
```

### Caching Strategy

```typescript
// Cache key format
cache_key = "crawler:cache:" + SHA256(url)

// TTL by content type:
- Event pages: 12 hours
- Attraction pages: 24 hours
- Search results: 6 hours

// Check before crawl:
if (redis.exists(cache_key)) {
  skip_crawl()
}
```

### Retry Logic

```typescript
max_attempts = 3
retry_delay = 2000ms

// Exponential backoff
delays = [2s, 4s, 8s]

// Retry on errors:
- Network timeout
- Page load failure
- Element not found
- 429 Too Many Requests
```

### Stealth Measures

```typescript
// Anti-detection techniques:
1. Randomized user agent
2. Remove webdriver property
3. Realistic viewport size (1920x1080)
4. Random delays between actions
5. Block images/fonts for speed
6. Mimic human behavior
```

### Data Validation

```typescript
// Required fields validation
{
  name: string (min 3 chars),
  city: string,
  type: enum['event', 'attraction', 'place'],
  source: string
}

// Optional fields with defaults
{
  description: string || '',
  price: string || 'Free',
  rating: number || null,
  tags: array || []
}
```

---

## 💡 Examples

### Example 1: Crawl Delhi Events for October

```bash
npm run crawl -- \
  -c "Delhi" \
  -C "India" \
  -t events \
  --start-date 2025-10-01 \
  --end-date 2025-10-31
```

**Output:**
```
🚀 Starting crawler for Delhi, India
📍 Crawling events for October 2025

✅ TimeOut: 23 events found
✅ Eventbrite: 45 events found  
✅ TripAdvisor: 18 events found

📊 Total: 86 events
💾 Saving to database...
✅ Saved: 78 new events, 8 updated

⏱️  Completed in 45 seconds
```

### Example 2: Test Single Source

```bash
npm run crawl:test -- -s timeout -c "Paris" -C "France"
```

**Output:**
```
🧪 Testing TimeOut crawler for Paris

📡 URL: https://www.timeout.com/paris/things-to-do/events-in-paris
⏳ Loading page...
✅ Page loaded

🔍 Extracting events...
Found 12 event cards

Sample results:
1. Nuit Blanche 2025
   Date: Oct 5, 2025
   Category: cultural
   
2. Paris Fashion Week
   Date: Oct 2-8, 2025
   Category: fashion

✅ Test completed!
```

### Example 3: Batch Crawl with Progress

```bash
npm run crawl -- --batch cities.json
```

**Output:**
```
📋 Batch crawl started: 5 cities

[1/5] Delhi, India
  ✅ Events: 78
  ✅ Attractions: 34
  
[2/5] Mumbai, India  
  ✅ Events: 56
  ✅ Attractions: 28
  
[3/5] Bangalore, India
  ✅ Events: 42
  ✅ Attractions: 19

[4/5] Paris, France
  ✅ Events: 89
  ✅ Attractions: 67

[5/5] London, United Kingdom
  ✅ Events: 102
  ✅ Attractions: 71

📊 Summary:
Total items: 586
New: 412
Updated: 174
Time: 3m 45s
```

---

## 🎯 Current Status

**Your System:**
- ✅ Crawler code: Complete
- ✅ Base crawler: Ready
- ✅ Event crawler: Ready
- ✅ Attraction crawler: Ready
- ✅ Crawler manager: Ready
- ⚠️ Currently using: Manual seed data (5 items)

**To Start Crawling:**

```bash
# 1. Ensure services are running
docker-compose up -d

# 2. Run test crawl
npm run crawl:test -- -s timeout -c "Delhi" -C "India"

# 3. Run full crawl
npm run crawl -- -c "Delhi" -C "India"
```

---

## 📚 Related Documentation

- `CRAWLER_README.md` - Complete crawler documentation
- `CRAWLER_QUICKSTART.md` - 5-minute setup guide
- `DATA_STORAGE.md` - Where crawled data is stored

---

**Last Updated**: October 23, 2025  
**Status**: Crawler system ready, currently using seeded data
