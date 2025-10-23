# Crawler Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd travel-ecosystem/services/discovery-engine

# Install Node packages
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```bash
# Minimum required
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=your_key_here

# Crawler settings
CRAWLER_RATE_LIMIT=10
CRAWLER_CONCURRENT_REQUESTS=5
```

### Step 3: Start Services

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB and Redis
docker-compose up -d mongodb redis
```

#### Option B: Local Installation

Install MongoDB and Redis locally, then start them:

```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

### Step 4: Test the Crawler

Run a quick test on a single source:

```bash
npm run crawl:test -- -s timeout -c "Delhi" -C "India"
```

Expected output:
```
✅ Test completed!
   Found: 45 items

   Sample results:

   1. Diwali Festival 2025
      Type: event
      Category: cultural
      Source: timeout

   2. India International Centre Food Festival
      Type: event
      Category: food
      Source: timeout
```

### Step 5: Crawl Your First City

```bash
npm run crawl -- -c "Delhi" -C "India" -t events,attractions
```

This will:
1. ✅ Crawl events from TimeOut, Eventbrite, TripAdvisor
2. ✅ Crawl attractions from Google, Lonely Planet, Atlas Obscura
3. ✅ Save all data to MongoDB
4. ✅ Show summary statistics

Expected output:
```
✅ Crawl completed!
   Crawled: 156 items
   Saved: 142 items
```

### Step 6: View Statistics

```bash
npm run crawl:stats
```

Output:
```
📊 Crawler Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total places: 142
Recently crawled (24h): 142

📍 By Type:
   event: 68
   attraction: 74

🌆 By City:
   Delhi: 142

🔗 By Source:
   timeout: 35
   tripadvisor: 42
   lonelyplanet: 38
   atlasobscura: 27
```

## 📝 Common Commands

### Single City Crawl
```bash
npm run crawl -- -c "Paris" -C "France"
```

### Crawl with Date Filter
```bash
npm run crawl -- -c "Delhi" -C "India" --start-date 2025-10-01 --end-date 2025-10-31
```

### Batch Crawl Multiple Cities
```bash
# Create cities file
cat > my-cities.json << EOF
[
  {"city": "Delhi", "country": "India"},
  {"city": "Mumbai", "country": "India"},
  {"city": "Bangalore", "country": "India"}
]
EOF

# Run batch crawl
npm run cli -- crawl-batch -f my-cities.json
```

### Test Individual Sources
```bash
# Test TimeOut
npm run crawl:test -- -s timeout -c "Paris" -C "France"

# Test TripAdvisor
npm run crawl:test -- -s tripadvisor -c "London" -C "UK"

# Test Lonely Planet
npm run crawl:test -- -s lonelyplanet -c "Tokyo" -C "Japan"
```

### Clear Cache (Useful for Testing)
```bash
# Clear all cached crawls
npm run cli -- clear-cache --all
```

## 🔧 Start the API Server

Once you have data, start the discovery engine API:

```bash
npm run dev
```

Server starts at: `http://localhost:3000`

### Test the API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get statistics
curl http://localhost:3000/api/v1/stats

# Trigger crawler via API
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "country": "France", "types": ["events", "attractions"]}'

# Search for places
curl "http://localhost:3000/api/v1/search?q=food+festival"

# Natural language discovery
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Best cultural events in Delhi this October"}'
```

## 🔄 Background Workers (Production)

For production environments, run background workers:

### Terminal 1: API Server
```bash
npm run dev
```

### Terminal 2: Crawler Worker
```bash
npm run worker:crawler
```

### Terminal 3: ETL Worker (Embeddings & Data Processing)
```bash
npm run worker:etl
```

## 📊 Verify Data in MongoDB

```bash
# Connect to MongoDB
mongosh travel_discovery

# View collections
show collections

# Count places
db.places.countDocuments()

# View sample place
db.places.findOne()

# Places by city
db.places.aggregate([
  { $group: { _id: "$city", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/crawlers'"

**Fix**: Update tsconfig.json paths or use relative imports:

```typescript
// Instead of: import { crawlerManager } from '@/crawlers';
// Use: import { crawlerManager } from '../crawlers';
```

### Issue: "MongoDB connection failed"

**Fix**: 
1. Check MongoDB is running: `mongod --version`
2. Verify connection string in `.env`
3. Test connection: `mongosh $MONGODB_URI`

### Issue: "Redis connection failed"

**Fix**:
1. Check Redis is running: `redis-cli ping` (should return PONG)
2. Verify Redis host/port in `.env`

### Issue: "Playwright browser not installed"

**Fix**:
```bash
npx playwright install chromium
```

### Issue: "No data extracted"

**Fix**:
1. Website structure may have changed
2. Run test to see errors: `npm run crawl:test -- -s timeout -c "Delhi" -C "India"`
3. Update selectors in crawler files if needed

### Issue: "Rate limited by website"

**Fix**:
1. Increase delay in `.env`: `CRAWLER_RATE_LIMIT=5`
2. Clear cache and retry: `npm run cli -- clear-cache --all`

## 📚 Next Steps

1. ✅ **Generate Embeddings**: Run ETL worker to create vector embeddings
   ```bash
   npm run worker:etl
   ```

2. ✅ **Setup Weaviate**: For semantic search
   ```bash
   docker-compose up -d weaviate
   ```

3. ✅ **Schedule Regular Crawls**: Use cron or scheduled workers
   
4. ✅ **Add More Cities**: Create comprehensive city list

5. ✅ **Monitor Performance**: Check logs and statistics regularly

## 📖 Full Documentation

- **[CRAWLER_README.md](./CRAWLER_README.md)** - Complete crawler documentation
- **[WORKFLOW.md](./WORKFLOW.md)** - System architecture and workflow
- **[RESEARCH_GUIDE.md](./RESEARCH_GUIDE.md)** - Technology deep dive

## 🎉 Success!

You now have a working crawler system that can:
- ✅ Scrape events and attractions from multiple sources
- ✅ Store structured data in MongoDB
- ✅ Provide statistics and insights
- ✅ Serve data via REST API
- ✅ Process data in background workers

Happy crawling! 🚀
