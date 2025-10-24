# Discovery Engine - Data Storage & Crawled Results

## 📊 Where is the Crawled Data Stored?

### **1. MongoDB Database**
- **Database**: `travel_discovery`
- **Collection**: `places`
- **Connection**: `mongodb://localhost:27017/travel_discovery`
- **Current Status**: ✅ **5 sample documents seeded**

**Data Structure:**
```javascript
{
  type: 'festival' | 'attraction' | 'place' | 'event',
  title: string,
  description: string,
  location: {
    city: string,
    country: string,
    venue?: string,
    area?: string,
    coordinates: [longitude, latitude]
  },
  dates: {
    start: Date,
    end: Date,
    flexible: boolean
  },
  metadata: {
    category: string[],
    tags: string[],
    popularity: number,
    cost: string,
    duration: string
  },
  media: {
    images: string[],
    videos: string[]
  },
  source: {
    url: string,
    domain: string,
    crawledAt: string,
    lastUpdated: string
  },
  confidence: number
}
```

### **2. Weaviate Vector Database**
- **Schema**: `TravelContent`
- **Connection**: `http://localhost:8080`
- **Purpose**: Semantic/vector search (currently disabled without OpenAI key)
- **Current Status**: ⚠️ Not seeded (optional, works without it)

### **3. Redis Cache**
- **Connection**: `localhost:6379`
- **Purpose**: Cache query results for faster responses
- **TTL**: 3600 seconds (1 hour) for query results
- **Current Status**: ✅ Working

---

## 🗂️ Current Seeded Data

### **Total Documents**: 5

#### **By Type:**
- **Festivals**: 1
  - Dussehra Festival 2025 (Oct 10-20)
  
- **Attractions**: 1
  - Red Fort (Lal Qila)
  
- **Places**: 1
  - Chandni Chowk Market
  
- **Events**: 2
  - Autumn Food Festival at Dilli Haat (Oct 15-25)
  - India International Trade Fair (Oct 27 - Nov 6)

#### **By City:**
- **Delhi**: 5 documents

---

## 🔍 How Discovery Works with Current Data

### **Search Flow:**
```
User Query: "Delhi in October"
    ↓
Step 1: Entity Extraction (Fallback)
    ↓ entities: { city: "Delhi", month: "October", year: 2025 }
    ↓
Step 2: Cache Check (Redis)
    ↓ (miss on first query)
    ↓
Step 3: Generate Embeddings
    ↓ (skipped - no OpenAI key, uses zero vector)
    ↓
Step 4: Search MongoDB
    ↓ Keyword search in places collection
    ↓ Filters: { city: "Delhi", dates overlap with October }
    ↓
Step 5: Results Found
    ✅ 2 documents:
       - Dussehra Festival 2025
       - Autumn Food Festival at Dilli Haat
    ↓
Step 6: Generate Summary (Fallback)
    ↓
Step 7: Categorize Results
    ↓
Step 8: Cache Result (Redis)
    ↓
Return to User
```

---

## 📝 Logs Breakdown

Based on your recent query logs:

```json
{
  "query": "Delhi in October",
  "pipeline": [
    {
      "step": "1/7: Entity Extraction",
      "method": "Fallback (no OpenAI key)",
      "output": {
        "city": "Delhi",
        "country": "India", 
        "month": "October",
        "year": 2025,
        "interests": [],
        "eventType": []
      }
    },
    {
      "step": "2/7: Cache Check",
      "result": "miss (first time query)"
    },
    {
      "step": "3/7: Embeddings",
      "method": "Zero vector (no OpenAI key)",
      "status": "Semantic search skipped"
    },
    {
      "step": "4/7: Content Retrieval",
      "vectorCount": 0,
      "keywordCount": 2,
      "mergedCount": 2,
      "types": {
        "festival": 1,
        "event": 1
      }
    },
    {
      "step": "7/7: Categorize",
      "result": {
        "festivals": ["Dussehra Festival 2025"],
        "events": ["Autumn Food Festival at Dilli Haat"],
        "attractions": [],
        "places": []
      }
    }
  ],
  "totalResults": 2,
  "processingTime": "3ms",
  "cached": true
}
```

---

## 🚀 How to Add More Data

### **Option 1: Run Web Crawler**
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run crawl
```

### **Option 2: Add Manual Data**
Edit `src/utils/seed-data.ts` and add more entries to the `samplePlaces` array, then run:
```bash
npm run seed
```

### **Option 3: Import from API/File**
Create a script to import data from external sources (TripAdvisor, Eventbrite, etc.)

---

## 🔍 Querying Data Directly

### **MongoDB:**
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/travel_discovery

# Count documents
db.places.countDocuments()

# Find Delhi events in October
db.places.find({
  "location.city": "Delhi",
  "dates.start": { $gte: new Date("2025-10-01") },
  "dates.end": { $lte: new Date("2025-10-31") }
})

# View all documents
db.places.find().pretty()
```

### **Redis:**
```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# View cached query
GET "query:<cache_key>:v1"

# Clear all cache
FLUSHALL
```

---

## 📈 Search Performance

**Current Performance:**
- ✅ Entity Extraction: ~1ms (fallback method)
- ✅ Cache Check: <1ms
- ✅ MongoDB Search: ~3ms
- ✅ Summary Generation: ~1ms (fallback)
- **Total**: ~5ms (first query), <2ms (cached)

**With OpenAI API Key:**
- Entity Extraction: ~500-1000ms (AI-powered)
- Summary Generation: ~1000-2000ms (AI-generated)
- Total: ~2-3 seconds (first query)

---

## 🎯 What Data is Being Logged

All AI inputs and outputs are now logged with emojis:

- 📨 **API Request** - Incoming requests
- 🚀 **Pipeline Started** - Discovery process begins
- 📍 **Entity Extraction** - What entities were found
- 💾 **Cache Check** - Cache hit/miss
- 🔢 **Embeddings** - Vector generation
- 🔍 **Content Search** - Database queries
- 📊 **Content Retrieved** - Search results
- ✍️ **Summary Generation** - AI summary creation
- 📂 **Categorization** - Results grouping
- ✅ **Pipeline Complete** - Final results
- 📤 **API Response** - Response sent to client

---

## 💡 Next Steps

1. **Add More Data**: 
   - Crawl travel websites
   - Import event data from APIs
   - Add more cities and attractions

2. **Enable AI Features** (Optional):
   - Add OpenAI API key for better entity extraction
   - Enable semantic search with Weaviate
   - Get AI-generated summaries

3. **Scale Database**:
   - Add indexes for faster queries
   - Implement sharding for large datasets
   - Set up replica sets for high availability

---

**Last Updated**: October 23, 2025  
**Current Data**: 5 documents in MongoDB  
**Search Working**: ✅ Yes (keyword-based search)
