# 🔍 Crawler Data Logging Guide

## Overview

Enhanced logging has been added throughout the crawler system to output detailed information about crawled data at every stage of the process.

## 📊 What Gets Logged

### 1. **Crawler Manager** (`src/crawlers/index.ts`)

#### During Crawling:
```
🎪 Crawling events for Delhi
✅ Events crawled: 23

📋 Crawled Events Details:
  [1/23] Diwali Festival
    source: timeout
    type: event
    category: cultural
    city: Delhi
    startDate: 2025-10-20
    price: Free
    url: https://timeout.com/delhi/...
    tags: ["festival", "cultural", "lights"]

  [2/23] India Art Fair
    source: eventbrite
    type: event
    category: art
    ...
```

#### During Database Save:
```
💾 Saving crawl results to database: 23 items

✨ New: Diwali Festival
    id: 672abc123def456...
    source: timeout
    type: event
    category: cultural

♻️  Updated: India Gate Night Tour
    source: tripadvisor
    type: attraction

✅ Database save completed
    total: 23
    saved: 23
    new: 18
    updated: 5
    failed: 0
```

### 2. **Event Crawler** (`src/crawlers/event.crawler.ts`)

#### Per Source:
```
✅ TimeOut crawl completed: 12 events

📝 Sample TimeOut events:
    total: 12
    sample: [
      {
        name: "Diwali at Red Fort",
        date: "2025-10-20",
        category: "cultural",
        price: "₹500"
      },
      {
        name: "Jazz Night at India Habitat Centre",
        date: "2025-10-25",
        category: "music",
        price: "₹1200"
      },
      ...
    ]
```

```
✅ Eventbrite crawl completed: 8 events

📝 Sample Eventbrite events:
    total: 8
    sample: [...]
```

```
✅ TripAdvisor crawl completed: 15 attractions

📝 Sample TripAdvisor attractions:
    total: 15
    sample: [
      {
        name: "India Gate",
        rating: 4.5,
        reviews: 12453,
        category: "monument"
      },
      ...
    ]
```

#### Overall Summary:
```
📊 Event crawl summary by source:
    timeout: 12
    eventbrite: 8
    tripadvisor: 15
```

### 3. **CLI Output** (`src/cli.ts`)

#### Single City Crawl:
```bash
$ npm run crawl -- -c "Delhi" -C "India"
```

```
============================================================
🎉 CRAWL COMPLETED SUCCESSFULLY
============================================================
📊 Results:
   • Items Crawled: 35
   • Items Saved:   33
   • Success Rate:  94.3%
============================================================
```

#### Batch Crawl:
```bash
$ npm run crawl-batch -- -f cities.json
```

```
============================================================
🎉 BATCH CRAWL COMPLETED
============================================================
📊 Overall Results:
   • Total Crawled: 142 items
   • Total Saved:   138 items
   • Success Rate:  97.2%

📍 Per City Breakdown:
────────────────────────────────────────────────────────────
   1. Delhi
      Crawled: 35 | Saved: 33 | Success: 94.3%
   
   2. Mumbai
      Crawled: 28 | Saved: 27 | Success: 96.4%
   
   3. Bangalore
      Crawled: 22 | Saved: 22 | Success: 100.0%
   
   4. Paris
      Crawled: 57 | Saved: 56 | Success: 98.2%
============================================================
```

## 🎯 How to View Logs

### Option 1: Run Crawler and Watch Console

```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine

# Run crawler for Delhi
npm run crawl -- -c "Delhi" -C "India"

# Watch output in real-time
```

### Option 2: Check Backend Logs (During API Crawl)

If crawling is triggered via API while backend is running:

```bash
# Terminal 1: Backend running
npm run dev

# Terminal 2: Trigger crawl
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Delhi",
    "country": "India",
    "types": ["events", "attractions"]
  }'

# Terminal 1: See detailed logs with crawled data
```

### Option 3: Test Single Source

```bash
# Test just TimeOut crawler
npm run crawl:test -- -s timeout -c "Delhi" -C "India"

# See sample data output
```

## 📋 Log Levels

The crawler uses the following log levels:

- **INFO** (🔵): General progress and results
  - Crawl start/completion
  - Items found per source
  - Database save results

- **DEBUG** (⚪): Detailed item-level operations
  - Individual document creation/updates
  - Field extraction details

- **WARN** (⚠️): Non-critical issues
  - Selector not found
  - Cached URLs skipped
  - Partial data extraction

- **ERROR** (❌): Failures that need attention
  - Source crawl failures
  - Database save errors
  - Network timeouts

## 🔧 What Each Log Shows

### Crawled Event Data Structure:
```javascript
{
  source: "timeout",           // Where it came from
  url: "https://...",          // Source URL
  data: {
    name: "Event Name",        // Title
    description: "...",        // Full description
    type: "event",             // Type (event/attraction/place)
    category: "cultural",      // Category
    city: "Delhi",             // Location
    country: "India",
    startDate: "2025-10-20",   // When it happens
    endDate: null,             // End date if multi-day
    price: "₹500",             // Price or "Free"
    image: "https://...",      // Image URL
    tags: ["festival", ...],   // Auto-generated tags
    rating: 4.5,               // Rating (attractions)
    reviewCount: 1234,         // Number of reviews
    coordinates: {...},        // Lat/long if available
    address: "...",            // Full address
    website: "...",            // Official website
    phone: "...",              // Contact number
    openingHours: "...",       // Business hours
    features: [...],           // Available features
    accessibility: [...]       // Accessibility info
  }
}
```

### Database Save Operations:
```javascript
✨ New: [name]              // New document created
  - Shows: id, source, type, category

♻️  Updated: [name]         // Existing document updated
  - Shows: source added, type

❌ Failed to save: [name]   // Save failed
  - Shows: error message
```

## 💡 Examples

### Example 1: Successful Event Crawl

```
🎪 Crawling events for Delhi
✅ TimeOut crawl completed: 12 events

📝 Sample TimeOut events:
    {
      "total": 12,
      "sample": [
        {
          "name": "Diwali Festival at India Gate",
          "date": "2025-10-20T00:00:00.000Z",
          "category": "cultural",
          "price": "Free"
        },
        {
          "name": "Delhi International Jazz Festival",
          "date": "2025-10-25T00:00:00.000Z",
          "category": "music",
          "price": "₹1200"
        },
        {
          "name": "Autumn Food Festival",
          "date": "2025-10-28T00:00:00.000Z",
          "category": "food",
          "price": "₹500"
        }
      ]
    }

✅ Events crawled: 12

📋 Crawled Events Details:
  [1/12] Diwali Festival at India Gate
    source: timeout
    type: event
    category: cultural
    city: Delhi
    startDate: 2025-10-20T00:00:00.000Z
    price: Free
    url: https://www.timeout.com/delhi/things-to-do/diwali-festival
    tags: ["festival", "cultural", "lights", "celebration"]

  [2/12] Delhi International Jazz Festival
    source: timeout
    type: event
    category: music
    city: Delhi
    startDate: 2025-10-25T00:00:00.000Z
    price: ₹1200
    url: https://www.timeout.com/delhi/music/jazz-festival
    tags: ["music", "jazz", "concert", "festival"]

  ... [remaining 10 events]
```

### Example 2: Database Save with Mix of New/Updated

```
💾 Saving crawl results to database: 12 items

✨ New: Diwali Festival at India Gate
    id: 672abc123def456789abcdef
    source: timeout
    type: event
    category: cultural

✨ New: Delhi International Jazz Festival
    id: 672abc456def789abcdef123
    source: timeout
    type: event
    category: music

♻️  Updated: India Gate
    source: timeout
    type: attraction

✨ New: Autumn Food Festival
    id: 672abc789def123abcdef456
    source: timeout
    type: event
    category: food

... [remaining saves]

✅ Database save completed
    total: 12
    saved: 12
    new: 9
    updated: 3
    failed: 0
```

## 🎨 Log Output Format

All logs use emoji prefixes for easy visual scanning:

- 🎪 Event crawling operations
- 🏛️ Attraction crawling operations
- ✅ Success messages
- 📋 Data listings
- 📝 Sample data output
- 📊 Statistics and summaries
- 💾 Database operations
- ✨ New document created
- ♻️  Document updated
- ❌ Error/failure
- ⚠️  Warning
- 🎉 Completion messages

## 🔍 Filtering Logs

If you only want to see crawled data (not all debug info):

```bash
# Run crawler and filter for data logs
npm run crawl -- -c "Delhi" -C "India" 2>&1 | grep -E "📋|📝|✨|♻️|📊"
```

## 📖 Related Documentation

- `HOW_CRAWLING_WORKS.md` - Complete crawler workflow explanation
- `CRAWLER_README.md` - Full crawler documentation
- `CRAWLER_QUICKSTART.md` - Quick setup guide

---

**Last Updated**: October 23, 2025  
**Status**: Enhanced logging active across all crawlers
