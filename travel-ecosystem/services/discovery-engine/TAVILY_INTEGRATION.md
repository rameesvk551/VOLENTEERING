# Tavily AI Integration Guide

## Overview

Tavily AI has been integrated into the discovery engine as a **hybrid crawler** that combines:
- **Tavily AI**: Real-time web search for current travel information
- **Playwright**: Traditional web scraping for specific sites

This hybrid approach provides the best of both worlds: up-to-date information from Tavily and detailed structured data from web scraping.

---

## Setup

### 1. Get Tavily API Key

1. Visit [https://tavily.com](https://tavily.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes: **1,000 searches/month**

### 2. Configure Environment

Add your Tavily API key to `.env`:

```bash
# Tavily AI Configuration
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

If no API key is provided, the system will fall back to Playwright-only mode.

---

## Usage

### CLI Commands

#### 1. Hybrid Crawl (RECOMMENDED)

Combines Tavily AI + Playwright for best results:

```bash
# Basic hybrid crawl
npm run crawl:hybrid -- -c "Delhi" -C "India"

# Tavily-only (faster, but no images)
npm run crawl:hybrid -- -c "Paris" -C "France" --tavily-only

# Playwright-only (traditional scraping)
npm run crawl:hybrid -- -c "Tokyo" -C "Japan" --playwright-only

# Include food and trends
npm run crawl:hybrid -- -c "Bangkok" -C "Thailand" --food --trends
```

#### 2. Traditional Crawl (Playwright only)

```bash
npm run crawl -- -c "Delhi" -C "India"
```

---

## Tavily Service API

### Basic Usage

```typescript
import { tavilyService } from './services/tavily.service';

// Check if Tavily is enabled
if (tavilyService.isEnabled()) {
  // Search for events
  const events = await tavilyService.searchEvents('Delhi', 'India', 'October');
  
  // Search for attractions
  const attractions = await tavilyService.searchAttractions('Paris', 'France', ['food', 'culture']);
  
  // Search for food experiences
  const food = await tavilyService.searchFood('Tokyo', 'Japan', 'sushi');
  
  // Search for trends
  const trends = await tavilyService.searchTrends('Bangkok', 'Thailand');
}
```

### Comprehensive Search

```typescript
const results = await tavilyService.comprehensiveSearch('Delhi', 'India', {
  month: 'October',
  interests: ['culture', 'food'],
  includeFood: true,
  includeTrends: true
});

console.log(results.events);       // Events and festivals
console.log(results.attractions);  // Tourist attractions
console.log(results.food);         // Restaurants and food experiences
console.log(results.trends);       // Latest travel trends
```

---

## Hybrid Crawler API

### Using HybridCrawler Directly

```typescript
import { HybridCrawler } from './crawlers/hybrid.crawler';

const crawler = new HybridCrawler();

// Default: Tavily first, fallback to Playwright
const results = await crawler.crawl('Delhi', 'India', {
  preferTavily: true,
  includeFood: true,
  includeTrends: true
});

// Tavily only
const tavilyResults = await crawler.crawl('Paris', 'France', {
  tavilyOnly: true
});

// Playwright only
const playwrightResults = await crawler.crawl('Tokyo', 'Japan', {
  playwrightOnly: true
});

// Cleanup
await crawler.cleanup();
```

### Using CrawlerManager

```typescript
import { getCrawlerManager } from './crawlers';

const manager = getCrawlerManager();

const result = await manager.crawlCityHybrid({
  city: 'Delhi',
  country: 'India',
  preferTavily: true,
  includeFood: true,
  includeTrends: false
});

console.log(`Total: ${result.total}`);
console.log(`Tavily: ${result.sources.tavily}`);
console.log(`Playwright: ${result.sources.playwright}`);

// Save to database
const saved = await manager.saveCrawlResults(result.results);
```

---

## Comparison: Tavily vs Playwright

| Feature | Tavily AI | Playwright |
|---------|-----------|------------|
| **Speed** | ⚡ Very Fast (1-2s) | 🐌 Slow (10-30s) |
| **Data Freshness** | ✅ Real-time | ⚠️ Depends on site |
| **Coverage** | 🌍 Global web | 📍 Specific sites |
| **Cost** | 💰 $0.001/search | 💵 Free (bandwidth) |
| **Images** | ❌ No images | ✅ Yes |
| **Structured Data** | ⚠️ Limited | ✅ Rich data |
| **Rate Limits** | 🔒 1000/month (free) | 🚀 Unlimited |
| **Reliability** | ✅ High | ⚠️ Site-dependent |

---

## Best Practices

### 1. Use Hybrid Mode by Default

```bash
# Recommended
npm run crawl:hybrid -- -c "Delhi" -C "India"
```

This gives you:
- Fast, current data from Tavily
- Detailed, structured data from Playwright
- Automatic deduplication

### 2. Use Tavily-Only for Quick Searches

```bash
# For quick lookups
npm run crawl:hybrid -- -c "Paris" -C "France" --tavily-only
```

Good for:
- Real-time event information
- Latest trends
- Quick content discovery

### 3. Use Playwright-Only When Images are Critical

```bash
# When you need images
npm run crawl:hybrid -- -c "Tokyo" -C "Japan" --playwright-only
```

Good for:
- Building image galleries
- Detailed venue information
- Structured data extraction

---

## Cost Optimization

### Tavily Free Tier
- **1,000 searches/month**
- **~33 searches/day**
- **Each comprehensive search = 4 API calls** (events + attractions + food + trends)

### Recommendations

1. **Cache Results**: Results are automatically cached in Redis
2. **Batch Processing**: Crawl multiple cities in one session
3. **Targeted Searches**: Use specific interests/categories
4. **Fallback Strategy**: Set `preferTavily: true` to use Playwright as backup

### Example: Stay Under Free Tier

```typescript
// This uses 2 Tavily calls (events + attractions)
await manager.crawlCityHybrid({
  city: 'Delhi',
  country: 'India',
  preferTavily: true,
  includeFood: false,    // Skip to save API calls
  includeTrends: false   // Skip to save API calls
});
```

With this approach:
- **500 cities/month** (2 calls each)
- Or **250 cities/month** (4 calls each with food+trends)

---

## Logging

### Enable Detailed Logging

```bash
# Set in .env
LOG_LEVEL=info
```

### Sample Log Output

```
[INFO] 🚀 Starting hybrid crawl { city: 'Delhi', country: 'India', preferTavily: true }
[INFO] Fetching data from Tavily AI...
[INFO] Tavily search started { query: 'events and festivals in Delhi India in October 2025' }
[INFO] Tavily search completed { query: '...', resultsCount: 8 }
[INFO] Tavily found 15 results
[INFO] Fetching data from web scraping...
[INFO] Playwright found 5 results
[INFO] ✅ Hybrid crawl completed { total: 18, tavilyResults: 15, playwrightResults: 5 }
```

---

## Troubleshooting

### Issue: "Tavily search attempted but service is disabled"

**Solution**: Add TAVILY_API_KEY to your `.env` file

```bash
TAVILY_API_KEY=tvly-your-api-key-here
```

### Issue: Tavily returns 0 results

**Possible causes**:
1. Invalid API key
2. Rate limit exceeded
3. Network issues
4. Query too specific

**Solution**: Check logs and try Playwright fallback:

```bash
npm run crawl:hybrid -- -c "Delhi" -C "India" --playwright-only
```

### Issue: Duplicate results

**Solution**: The hybrid crawler automatically deduplicates based on name. If duplicates persist, check the logs.

---

## Future Enhancements

### Planned Features

1. **Smart Caching**: Cache Tavily results for 24 hours
2. **Image Enhancement**: Use AI to generate missing images
3. **Multi-language**: Support for non-English searches
4. **Location Enrichment**: Add coordinates using geocoding
5. **Sentiment Analysis**: Rate attractions based on content

---

## API Limits

### Tavily Free Tier
- **1,000 API calls/month**
- **No credit card required**
- **Rate limit**: 10 requests/second

### Upgrade Options
- **Pro**: $99/month (10,000 calls)
- **Enterprise**: Custom pricing

---

## Example Workflow

```bash
# 1. Setup Tavily
echo "TAVILY_API_KEY=tvly-xxxxx" >> .env

# 2. Test hybrid crawl
npm run crawl:hybrid -- -c "Delhi" -C "India"

# 3. Check results
npm run crawl:stats

# 4. View logs
tail -f logs/combined.log

# 5. Query database
mongosh travel_discovery --eval "db.places.find({source: 'tavily'}).count()"
```

---

## Summary

✅ **Tavily AI Integration Complete**

- Real-time web search for travel data
- Hybrid crawler combining AI + scraping
- CLI commands for easy usage
- Automatic fallbacks and deduplication
- Free tier: 1,000 searches/month

**Recommended Command:**
```bash
npm run crawl:hybrid -- -c "Delhi" -C "India"
```

This gives you the best balance of speed, freshness, and data quality! 🚀
