# 📊 Crawler Data Logging Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER TRIGGERS CRAWL                      │
│  $ npm run crawl -- -c "Delhi" -C "India"                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLI.TS (Entry Point)                       │
│  • Parses command arguments                                     │
│  • Connects to database                                         │
│  • Calls CrawlerManager.crawlAndSave()                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│             CRAWLER MANAGER (index.ts) - Phase 1                │
│             📝 LOG: "🎪 Crawling events for Delhi"              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   TimeOut    │ │  Eventbrite  │ │ TripAdvisor  │
        │   Crawler    │ │   Crawler    │ │   Crawler    │
        └──────────────┘ └──────────────┘ └──────────────┘
                │                │                │
                │   📝 LOG: "✅ TimeOut crawl     │
                │    completed: 12 events"        │
                │                │                │
                │   📝 LOG: Sample data (first 3) │
                │    {name, date, category...}    │
                │                │                │
                └────────────────┼────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│          EVENT CRAWLER (event.crawler.ts) - Results             │
│  📝 LOG: "📊 Event crawl summary by source:"                    │
│    • timeout: 12                                                │
│    • eventbrite: 8                                              │
│    • tripadvisor: 15                                            │
│  Total: 35 events                                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           CRAWLER MANAGER (index.ts) - Phase 2                  │
│  📝 LOG: "✅ Events crawled: 35"                                │
│                                                                 │
│  📝 LOG: "📋 Crawled Events Details:"                           │
│    [1/35] Diwali Festival at India Gate                        │
│      source: timeout                                            │
│      type: event                                                │
│      category: cultural                                         │
│      city: Delhi                                                │
│      startDate: 2025-10-20                                      │
│      price: Free                                                │
│      url: https://...                                           │
│      tags: ["festival", "cultural", "lights"]                   │
│                                                                 │
│    [2/35] Delhi International Jazz Festival                     │
│      source: timeout                                            │
│      type: event                                                │
│      ...                                                        │
│                                                                 │
│    ... (all 35 events logged)                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         CRAWLER MANAGER - Database Save Phase                   │
│  📝 LOG: "💾 Saving crawl results to database: 35 items"       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
         ┌──────────┐      ┌──────────┐    ┌──────────┐
         │ MongoDB  │      │  Check   │    │  Create  │
         │  Query   │──────│ Existing │────│  or      │
         │          │      │ Document │    │  Update  │
         └──────────┘      └──────────┘    └──────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
            ┌──────────────┐          ┌──────────────┐
            │ NEW DOCUMENT │          │UPDATE EXIST. │
            │              │          │              │
            │ 📝 LOG:      │          │ 📝 LOG:      │
            │ "✨ New:     │          │ "♻️  Updated:│
            │  [name]"     │          │  [name]"     │
            │   id: ...    │          │   source: ...│
            │   source: .. │          │              │
            └──────────────┘          └──────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE SAVE - Final Statistics                   │
│  📝 LOG: "✅ Database save completed"                           │
│    total: 35                                                    │
│    saved: 35                                                    │
│    new: 28                                                      │
│    updated: 7                                                   │
│    failed: 0                                                    │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLI.TS - Final Output                         │
│                                                                 │
│  ============================================================   │
│  🎉 CRAWL COMPLETED SUCCESSFULLY                                │
│  ============================================================   │
│  📊 Results:                                                    │
│     • Items Crawled: 35                                         │
│     • Items Saved:   35                                         │
│     • Success Rate:  100.0%                                     │
│  ============================================================   │
└─────────────────────────────────────────────────────────────────┘
```

## Log Output Timeline

```
TIME    COMPONENT           LOG MESSAGE
─────   ──────────────────  ────────────────────────────────────────
00:00   CLI                 Starting crawler { city: 'Delhi', ... }
00:01   CrawlerManager      🎪 Crawling events for Delhi
00:02   EventCrawler        Starting event crawl { city: Delhi }
00:03   EventCrawler        Crawling TimeOut { city: Delhi, url: ... }
00:15   EventCrawler        ✅ TimeOut crawl completed: 12 events
00:15   EventCrawler        📝 Sample TimeOut events: { total: 12, sample: [...] }
00:16   EventCrawler        Crawling Eventbrite { city: Delhi, url: ... }
00:28   EventCrawler        ✅ Eventbrite crawl completed: 8 events
00:28   EventCrawler        📝 Sample Eventbrite events: { total: 8, sample: [...] }
00:29   EventCrawler        Crawling TripAdvisor { city: Delhi, url: ... }
00:42   EventCrawler        ✅ TripAdvisor crawl completed: 15 attractions
00:42   EventCrawler        📝 Sample TripAdvisor attractions: { total: 15, sample: [...] }
00:43   EventCrawler        📊 Event crawl summary by source: { timeout: 12, eventbrite: 8, tripadvisor: 15 }
00:43   CrawlerManager      ✅ Events crawled: 35
00:43   CrawlerManager      📋 Crawled Events Details:
00:43   CrawlerManager        [1/35] Diwali Festival at India Gate { source, type, category, ... }
00:43   CrawlerManager        [2/35] Delhi International Jazz Festival { ... }
...
00:44   CrawlerManager      💾 Saving crawl results to database: 35 items
00:44   CrawlerManager      ✨ New: Diwali Festival at India Gate { id, source, type }
00:44   CrawlerManager      ✨ New: Delhi International Jazz Festival { ... }
00:44   CrawlerManager      ♻️  Updated: India Gate { source, type }
...
00:45   CrawlerManager      ✅ Database save completed { total: 35, saved: 35, new: 28, updated: 7 }
00:45   CLI                 ============================================================
00:45   CLI                 🎉 CRAWL COMPLETED SUCCESSFULLY
00:45   CLI                 ============================================================
00:45   CLI                 📊 Results:
00:45   CLI                    • Items Crawled: 35
00:45   CLI                    • Items Saved:   35
00:45   CLI                    • Success Rate:  100.0%
```

## Data Structure Logged

### For Each Event:
```javascript
{
  // Logged for each crawled event
  name: "Diwali Festival at India Gate",
  source: "timeout",
  type: "event",
  category: "cultural",
  city: "Delhi",
  startDate: "2025-10-20T00:00:00.000Z",
  price: "Free",
  url: "https://www.timeout.com/delhi/...",
  tags: ["festival", "cultural", "lights", "celebration"]
}
```

### For Each Attraction:
```javascript
{
  // Logged for each crawled attraction
  name: "India Gate",
  source: "tripadvisor",
  type: "attraction",
  category: "monument",
  city: "Delhi",
  rating: 4.5,
  reviewCount: 12453,
  price: "Free",
  url: "https://www.tripadvisor.com/...",
  features: ["historical", "landmark"]
}
```

### Database Operations:
```javascript
// New document
✨ New: [name]
  {
    id: "672abc123def456789abcdef",
    source: "timeout",
    type: "event",
    category: "cultural"
  }

// Updated document
♻️  Updated: [name]
  {
    source: "timeout",  // Added to sources array
    type: "attraction"
  }
```

## Quick Reference

| Emoji | Meaning | Used Where |
|-------|---------|------------|
| 🎪 | Event crawling | Crawler Manager |
| 🏛️ | Attraction crawling | Crawler Manager |
| ✅ | Success / Completion | All components |
| 📋 | Data listing | Crawler Manager |
| 📝 | Sample data | Event Crawler |
| 📊 | Statistics | Event Crawler, Manager |
| 💾 | Database operations | Crawler Manager |
| ✨ | New document | Database save |
| ♻️  | Updated document | Database save |
| ❌ | Error/failure | All components |
| 🎉 | Final completion | CLI |

---

**Last Updated**: October 23, 2025  
**Status**: All logging components active
