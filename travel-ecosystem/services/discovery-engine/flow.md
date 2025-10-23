# Discovery Engine - Complete Data Flow with Examples

This document provides **practical, step-by-step examples** of data flowing through the Discovery Engine system, from web crawling to user query responses. All examples use **realistic dummy data**.

---

## Table of Contents
1. [Complete Flow Overview](#complete-flow-overview)
2. [Phase 1: Data Collection (Crawling)](#phase-1-data-collection-crawling)
3. [Phase 2: ETL Processing](#phase-2-etl-processing)
4. [Phase 3: User Discovery Query](#phase-3-user-discovery-query)
5. [Real-World Example: Delhi Food Festivals](#real-world-example-delhi-food-festivals)
6. [Example Datasets](#example-datasets)

---

## Complete Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 1: DATA COLLECTION                │
│                                                              │
│  Web Sources → Crawlers → Raw MongoDB Data                  │
│  (3-5 minutes per city)                                     │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      PHASE 2: ETL PROCESSING                 │
│                                                              │
│  MongoDB → Generate Embeddings → Enrich → Weaviate          │
│  (2-3 minutes per 100 items)                                │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 3: USER QUERIES                      │
│                                                              │
│  User Query → Entity Extract → Search → Rerank → Response   │
│  (2-5 seconds per query)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Data Collection (Crawling)

### Step 1.1: Trigger Crawl

**CLI Command:**
```bash
npm run crawl -- -c "Delhi" -C "India"
```

**API Request:**
```bash
curl -X POST http://localhost:3000/api/v1/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Delhi",
    "country": "India",
    "background": true
  }'
```

**API Response:**
```json
{
  "success": true,
  "jobId": "crawl-job-1729702800-abc123",
  "message": "Crawl job queued for Delhi, India",
  "estimatedTime": "3-5 minutes"
}
```

---

### Step 1.2: Crawler Manager Initializes

**Log Output:**
```
[2025-10-23 10:15:00] INFO: Crawler Manager initialized
[2025-10-23 10:15:00] INFO: Target: Delhi, India
[2025-10-23 10:15:00] INFO: Sources: timeout, eventbrite, tripadvisor, google, lonelyplanet, atlasobscura
[2025-10-23 10:15:00] INFO: Checking cache: crawl:Delhi:India:20251023
[2025-10-23 10:15:01] INFO: Cache MISS - proceeding with fresh crawl
```

---

### Step 1.3: Parallel Crawling (6 Sources)

#### Example 1: TimeOut Crawler

**Target URL:**
```
https://www.timeout.com/delhi/things-to-do/food-festivals-in-delhi
```

**Extracted Data (Raw):**
```javascript
{
  title: "Grub Fest 2025",
  description: "Delhi's biggest food festival returns with over 150 food stalls, live music, and celebrity chef demonstrations. Featuring cuisines from 25 countries, craft beer gardens, and family-friendly activities.",
  location: {
    venue: "Jawaharlal Nehru Stadium",
    address: "Pragati Vihar, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  dates: {
    start: new Date("2025-11-15T10:00:00Z"),
    end: new Date("2025-11-17T22:00:00Z")
  },
  categories: ["food", "festival", "music"],
  pricing: {
    min: 500,
    max: 2000,
    currency: "INR",
    type: "ticketed"
  },
  ratings: {
    score: 4.5,
    count: 1247,
    source: "timeout"
  },
  images: [
    "https://cdn.timeout.com/delhi/grub-fest-2025-hero.jpg",
    "https://cdn.timeout.com/delhi/grub-fest-2025-food-stalls.jpg"
  ],
  tags: ["outdoor", "family-friendly", "weekend", "popular"],
  source: "timeout",
  sourceUrl: "https://www.timeout.com/delhi/events/grub-fest-2025",
  metadata: {
    organizer: "Grub Fest India",
    expectedAttendees: 50000,
    accessibility: ["wheelchair-accessible", "parking-available"]
  },
  createdAt: new Date("2025-10-23T10:15:30Z"),
  updatedAt: new Date("2025-10-23T10:15:30Z")
}
```

---

#### Example 2: Eventbrite Crawler

**Target URL:**
```
https://www.eventbrite.com/d/india--delhi/food-events/
```

**Extracted Data (Raw):**
```javascript
{
  title: "Delhi Street Food Festival",
  description: "Explore the authentic flavors of Old Delhi with over 50 street food vendors. Featuring iconic dishes like chole bhature, parathas, kebabs, and traditional sweets. Live cooking demonstrations by renowned chefs.",
  location: {
    venue: "India Gate Lawns",
    address: "Rajpath, India Gate, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { lat: 28.6129, lng: 77.2295 }
  },
  dates: {
    start: new Date("2025-10-28T16:00:00Z"),
    end: new Date("2025-10-28T23:00:00Z")
  },
  categories: ["food", "cultural", "evening"],
  pricing: {
    min: 0,
    max: 1000,
    currency: "INR",
    type: "free-entry-paid-food"
  },
  ratings: {
    score: 4.7,
    count: 892,
    source: "eventbrite"
  },
  images: [
    "https://cdn.eventbrite.com/delhi/street-food-fest-main.jpg"
  ],
  tags: ["evening", "cultural", "local-cuisine", "budget-friendly"],
  source: "eventbrite",
  sourceUrl: "https://www.eventbrite.com/e/delhi-street-food-festival-tickets",
  metadata: {
    organizer: "Delhi Tourism Board",
    expectedAttendees: 15000
  },
  createdAt: new Date("2025-10-23T10:16:15Z"),
  updatedAt: new Date("2025-10-23T10:16:15Z")
}
```

---

#### Example 3: Google Places Crawler

**Search Query:**
```
"tourist attractions in Delhi India"
```

**Extracted Data (Raw):**
```javascript
{
  title: "Red Fort (Lal Qila)",
  description: "A stunning 17th-century fort complex built by Mughal Emperor Shah Jahan. This UNESCO World Heritage Site showcases magnificent Mughal architecture with red sandstone walls, beautiful gardens, and historical museums. A symbol of India's rich history and independence.",
  location: {
    venue: "Red Fort",
    address: "Netaji Subhash Marg, Chandni Chowk, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { lat: 28.6562, lng: 77.2410 }
  },
  dates: {
    start: null,
    end: null,
    permanent: true
  },
  categories: ["attraction", "historical", "unesco-site"],
  pricing: {
    min: 35,
    max: 500,
    currency: "INR",
    type: "entry-fee"
  },
  ratings: {
    score: 4.6,
    count: 87534,
    source: "google"
  },
  images: [
    "https://maps.googleapis.com/places/photo/red-fort-main.jpg",
    "https://maps.googleapis.com/places/photo/red-fort-architecture.jpg"
  ],
  tags: ["historical", "unesco", "architecture", "must-visit"],
  openingHours: {
    monday: { open: "09:30", close: "16:30" },
    tuesday: { open: "09:30", close: "16:30" },
    wednesday: { open: "09:30", close: "16:30" },
    thursday: { open: "09:30", close: "16:30" },
    friday: { open: "09:30", close: "16:30" },
    saturday: { open: "09:30", close: "16:30" },
    sunday: { open: "09:30", close: "16:30" }
  },
  source: "google",
  sourceUrl: "https://www.google.com/maps/place/Red+Fort",
  metadata: {
    placeId: "ChIJSdRbuoqEDTkRwyuUlQCfCAo",
    popularTimes: {
      monday: [20, 30, 50, 70, 90, 80, 60, 40, 30, 20],
      // ... more days
    },
    duration: "2-3 hours"
  },
  createdAt: new Date("2025-10-23T10:17:45Z"),
  updatedAt: new Date("2025-10-23T10:17:45Z")
}
```

---

#### Example 4: Lonely Planet Crawler

**Target URL:**
```
https://www.lonelyplanet.com/india/delhi/attractions
```

**Extracted Data (Raw):**
```javascript
{
  title: "Humayun's Tomb",
  description: "This magnificent garden tomb is a precursor to the Taj Mahal and a masterpiece of Mughal architecture. Set in beautiful Persian-style gardens, it's the first garden-tomb on the Indian subcontinent. A peaceful retreat from Delhi's chaos.",
  location: {
    venue: "Humayun's Tomb Complex",
    address: "Mathura Road, Nizamuddin, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { lat: 28.5933, lng: 77.2507 }
  },
  dates: {
    start: null,
    end: null,
    permanent: true
  },
  categories: ["attraction", "historical", "unesco-site", "architecture"],
  pricing: {
    min: 30,
    max: 500,
    currency: "INR",
    type: "entry-fee"
  },
  ratings: {
    score: 4.8,
    count: 234,
    source: "lonelyplanet"
  },
  images: [
    "https://cdn.lonelyplanet.com/delhi/humayuns-tomb-gardens.jpg"
  ],
  tags: ["peaceful", "architecture", "gardens", "photography"],
  openingHours: {
    everyday: { open: "06:00", close: "18:00" }
  },
  source: "lonelyplanet",
  sourceUrl: "https://www.lonelyplanet.com/india/delhi/attractions/humayuns-tomb",
  metadata: {
    expertRating: "Must-visit",
    bestTimeToVisit: "Early morning or late afternoon",
    duration: "1-2 hours",
    editorsPick: true
  },
  createdAt: new Date("2025-10-23T10:18:20Z"),
  updatedAt: new Date("2025-10-23T10:18:20Z")
}
```

---

### Step 1.4: Store in MongoDB

**Collection: `places`**

```javascript
// After crawling Delhi, MongoDB contains ~150-200 documents
db.places.countDocuments({ "location.city": "Delhi" })
// Result: 187

// Sample query
db.places.find({ 
  "location.city": "Delhi",
  "categories": "food"
}).limit(3)
```

**Sample Document in MongoDB:**
```javascript
{
  _id: ObjectId("6719abc123def456789012345"),
  title: "Grub Fest 2025",
  description: "Delhi's biggest food festival returns with over 150 food stalls...",
  location: {
    venue: "Jawaharlal Nehru Stadium",
    address: "Pragati Vihar, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: {
      type: "Point",
      coordinates: [77.2090, 28.6139]
    }
  },
  dates: {
    start: ISODate("2025-11-15T10:00:00.000Z"),
    end: ISODate("2025-11-17T22:00:00.000Z"),
    permanent: false
  },
  categories: ["food", "festival", "music"],
  pricing: {
    min: 500,
    max: 2000,
    currency: "INR",
    type: "ticketed"
  },
  ratings: {
    score: 4.5,
    count: 1247,
    source: "timeout"
  },
  images: [
    "https://cdn.timeout.com/delhi/grub-fest-2025-hero.jpg",
    "https://cdn.timeout.com/delhi/grub-fest-2025-food-stalls.jpg"
  ],
  tags: ["outdoor", "family-friendly", "weekend", "popular"],
  source: "timeout",
  sourceUrl: "https://www.timeout.com/delhi/events/grub-fest-2025",
  metadata: {
    organizer: "Grub Fest India",
    expectedAttendees: 50000,
    accessibility: ["wheelchair-accessible", "parking-available"]
  },
  // Added by ETL (initially null)
  weaviateId: null,
  embeddings: null,
  enrichedSummary: null,
  // Timestamps
  createdAt: ISODate("2025-10-23T10:15:30.000Z"),
  updatedAt: ISODate("2025-10-23T10:15:30.000Z")
}
```

---

### Step 1.5: Crawler Statistics

**After crawl completes:**

```javascript
{
  "success": true,
  "crawlId": "crawl-job-1729702800-abc123",
  "city": "Delhi",
  "country": "India",
  "statistics": {
    "totalDocuments": 187,
    "bySource": {
      "timeout": { "success": 34, "failed": 2, "duration": 45.2 },
      "eventbrite": { "success": 28, "failed": 1, "duration": 38.7 },
      "tripadvisor": { "success": 31, "failed": 0, "duration": 52.3 },
      "google": { "success": 42, "failed": 3, "duration": 67.8 },
      "lonelyplanet": { "success": 38, "failed": 1, "duration": 55.1 },
      "atlasobscura": { "success": 14, "failed": 0, "duration": 29.4 }
    },
    "totalDuration": 288.5,
    "successRate": 96.4,
    "duplicatesRemoved": 12,
    "errors": [
      {
        "source": "timeout",
        "error": "Page timeout after 30 seconds",
        "url": "https://www.timeout.com/delhi/events/page-15"
      },
      {
        "source": "google",
        "error": "Rate limit hit, retrying after delay",
        "recoverable": true
      }
    ]
  },
  "nextStep": "ETL jobs queued for 187 documents",
  "estimatedETLTime": "3-4 minutes"
}
```

---

## Phase 2: ETL Processing

### Step 2.1: Queue ETL Jobs

**BullMQ Queue:**
```javascript
// After crawl, 187 jobs added to 'etl-jobs' queue
{
  queue: "etl-jobs",
  jobCount: 187,
  waiting: 187,
  active: 0,
  completed: 0,
  failed: 0
}
```

**Sample Job Data:**
```javascript
{
  jobId: "etl-6719abc123def456789012345",
  data: {
    placeId: "6719abc123def456789012345",
    city: "Delhi",
    country: "India",
    title: "Grub Fest 2025"
  },
  opts: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    priority: 1
  }
}
```

---

### Step 2.2: ETL Worker Processing

#### Step 2.2.1: Generate Embeddings

**Input to OpenAI:**
```javascript
{
  model: "text-embedding-3-small",
  input: "Grub Fest 2025. Delhi's biggest food festival returns with over 150 food stalls, live music, and celebrity chef demonstrations. Featuring cuisines from 25 countries, craft beer gardens, and family-friendly activities."
}
```

**OpenAI Response:**
```javascript
{
  object: "list",
  data: [
    {
      object: "embedding",
      index: 0,
      embedding: [
        -0.008906792, 0.023847982, -0.015234156, 0.031456789, 0.012345678,
        // ... (1536 dimensions total)
        0.019876543, -0.007654321, 0.025678901, -0.013456789
      ]
    }
  ],
  model: "text-embedding-3-small",
  usage: {
    prompt_tokens: 45,
    total_tokens: 45
  }
}
```

---

#### Step 2.2.2: Enrich with LLM Summary

**LLM Prompt:**
```
You are a travel content writer. Summarize this attraction/event in exactly 2 compelling sentences.

Title: Grub Fest 2025
Description: Delhi's biggest food festival returns with over 150 food stalls, live music, and celebrity chef demonstrations. Featuring cuisines from 25 countries, craft beer gardens, and family-friendly activities.
Location: Jawaharlal Nehru Stadium, New Delhi
Dates: November 15-17, 2025
```

**LLM Response:**
```javascript
{
  role: "assistant",
  content: "Experience Delhi's ultimate culinary extravaganza with 150+ food stalls showcasing flavors from 25 countries, complemented by live music and celebrity chef demonstrations. This three-day festival at Jawaharlal Nehru Stadium offers craft beer gardens and family-friendly activities, making it the perfect weekend destination for food lovers."
}
```

---

#### Step 2.2.3: Sync to Weaviate

**Weaviate Create Object Request:**
```javascript
{
  class: "TravelContent",
  properties: {
    title: "Grub Fest 2025",
    description: "Delhi's biggest food festival returns with over 150 food stalls, live music, and celebrity chef demonstrations. Featuring cuisines from 25 countries, craft beer gardens, and family-friendly activities.",
    enrichedSummary: "Experience Delhi's ultimate culinary extravaganza with 150+ food stalls showcasing flavors from 25 countries, complemented by live music and celebrity chef demonstrations. This three-day festival at Jawaharlal Nehru Stadium offers craft beer gardens and family-friendly activities, making it the perfect weekend destination for food lovers.",
    city: "Delhi",
    country: "India",
    venue: "Jawaharlal Nehru Stadium",
    startDate: "2025-11-15T10:00:00.000Z",
    endDate: "2025-11-17T22:00:00.000Z",
    categories: ["food", "festival", "music"],
    tags: ["outdoor", "family-friendly", "weekend", "popular"],
    priceMin: 500,
    priceMax: 2000,
    currency: "INR",
    rating: 4.5,
    ratingCount: 1247,
    source: "timeout",
    sourceUrl: "https://www.timeout.com/delhi/events/grub-fest-2025",
    latitude: 28.6139,
    longitude: 77.2090,
    mongoId: "6719abc123def456789012345"
  },
  vector: [
    -0.008906792, 0.023847982, -0.015234156, 0.031456789, 0.012345678,
    // ... (1536 dimensions)
    0.019876543, -0.007654321, 0.025678901, -0.013456789
  ]
}
```

**Weaviate Response:**
```javascript
{
  id: "e8b9c7d6-5a4f-3e2d-1c0b-9a8f7e6d5c4b",
  class: "TravelContent",
  creationTimeUnix: 1729702980000,
  properties: {
    title: "Grub Fest 2025",
    city: "Delhi",
    // ... all properties
  }
}
```

---

#### Step 2.2.4: Update MongoDB

**Update Query:**
```javascript
db.places.updateOne(
  { _id: ObjectId("6719abc123def456789012345") },
  {
    $set: {
      weaviateId: "e8b9c7d6-5a4f-3e2d-1c0b-9a8f7e6d5c4b",
      embeddings: [-0.008906792, 0.023847982, ...],
      enrichedSummary: "Experience Delhi's ultimate culinary extravaganza...",
      etlProcessedAt: new Date("2025-10-23T10:20:15Z"),
      updatedAt: new Date("2025-10-23T10:20:15Z")
    }
  }
)
```

---

### Step 2.3: ETL Complete Statistics

**After all 187 jobs processed:**

```javascript
{
  "queue": "etl-jobs",
  "statistics": {
    "total": 187,
    "completed": 185,
    "failed": 2,
    "successRate": 98.9,
    "totalDuration": 218.7,
    "avgDurationPerJob": 1.17,
    "embeddingsGenerated": 185,
    "weaviateDocsSynced": 185,
    "totalTokensUsed": 8342,
    "estimatedCost": 0.42
  },
  "errors": [
    {
      "jobId": "etl-6719xyz...",
      "error": "OpenAI API timeout",
      "retrying": true
    },
    {
      "jobId": "etl-6719uvw...",
      "error": "Weaviate connection refused",
      "retrying": true
    }
  ],
  "nextStep": "Data ready for discovery queries"
}
```

---

## Phase 3: User Discovery Query

### Step 3.1: User Submits Query

**HTTP Request:**
```bash
POST http://localhost:3000/api/v1/discovery/query
Content-Type: application/json

{
  "query": "Best food festivals in Delhi this October"
}
```

---

### Step 3.2: Entity Extraction

**LLM Prompt to GPT-4o-mini:**
```
You are a travel query analyzer. Extract structured entities from the user's query.

Query: Best food festivals in Delhi this October

Return ONLY a valid JSON object with these fields:
- city: string (city name)
- country: string (country name)
- month: string (month name or null)
- year: number (year or current year)
- interests: string[] (user interests)
- eventType: string[] (event, festival, attraction, etc.)
- duration: number (trip duration in days, or null)
- budget: string (low, medium, high, luxury, or null)
- travelStyle: string[] (adventure, relaxation, cultural, etc.)

Be precise and extract only what's explicitly mentioned.
```

**LLM Response:**
```javascript
{
  "city": "Delhi",
  "country": "India",
  "month": "October",
  "year": 2025,
  "interests": ["food"],
  "eventType": ["festival"],
  "duration": null,
  "budget": null,
  "travelStyle": ["culinary"]
}
```

---

### Step 3.3: Cache Check

**Generate Cache Key:**
```javascript
const cacheKey = crypto
  .createHash('sha256')
  .update(JSON.stringify({
    city: "Delhi",
    country: "India",
    month: "October",
    year: 2025,
    interests: ["food"],
    eventType: ["festival"]
  }))
  .digest('hex');

// Result: "a7f9e2c8b6d4f1e8c9a7b5d3e1f2c4a6b8d0e2f4a6c8e0f2a4b6c8d0e2f4a6b8"
```

**Redis Check:**
```bash
GET query:a7f9e2c8b6d4f1e8c9a7b5d3e1f2c4a6b8d0e2f4a6c8e0f2a4b6c8d0e2f4a6b8:v1
# Result: (nil) - Cache MISS
```

---

### Step 3.4: Generate Query Embeddings

**Input to OpenAI:**
```javascript
{
  model: "text-embedding-3-small",
  input: "Best food festivals in Delhi this October"
}
```

**Response:**
```javascript
{
  embedding: [
    -0.012345678, 0.034567890, -0.021234567, 0.045678901, 0.018765432,
    // ... (1536 dimensions)
    0.029876543, -0.009876543, 0.031234567, -0.016789012
  ]
}
```

---

### Step 3.5: Hybrid Search

#### Vector Search (Weaviate)

**GraphQL Query:**
```graphql
{
  Get {
    TravelContent(
      nearVector: {
        vector: [-0.012345678, 0.034567890, ...]
      }
      where: {
        operator: And
        operands: [
          {
            path: ["city"]
            operator: Equal
            valueString: "Delhi"
          }
          {
            path: ["startDate"]
            operator: GreaterThanEqual
            valueDate: "2025-10-01T00:00:00Z"
          }
          {
            path: ["startDate"]
            operator: LessThanEqual
            valueDate: "2025-10-31T23:59:59Z"
          }
          {
            path: ["categories"]
            operator: ContainsAny
            valueString: ["food", "festival"]
          }
        ]
      }
      limit: 30
    ) {
      title
      enrichedSummary
      city
      startDate
      endDate
      rating
      mongoId
      _additional {
        distance
        certainty
      }
    }
  }
}
```

**Weaviate Response (Top 5 of 30):**
```javascript
[
  {
    title: "Grub Fest 2025",
    enrichedSummary: "Experience Delhi's ultimate culinary extravaganza...",
    city: "Delhi",
    startDate: "2025-11-15T10:00:00Z",
    endDate: "2025-11-17T22:00:00Z",
    rating: 4.5,
    mongoId: "6719abc123def456789012345",
    _additional: {
      distance: 0.087,
      certainty: 0.956
    }
  },
  {
    title: "Delhi Street Food Festival",
    enrichedSummary: "Explore authentic Old Delhi flavors with 50+ vendors...",
    city: "Delhi",
    startDate: "2025-10-28T16:00:00Z",
    endDate: "2025-10-28T23:00:00Z",
    rating: 4.7,
    mongoId: "6719abc456def789012345678",
    _additional: {
      distance: 0.112,
      certainty: 0.944
    }
  },
  {
    title: "Diwali Food Mela",
    enrichedSummary: "Celebrate Diwali with traditional Indian sweets and festive dishes...",
    city: "Delhi",
    startDate: "2025-10-22T10:00:00Z",
    endDate: "2025-10-24T22:00:00Z",
    rating: 4.3,
    mongoId: "6719abc789def012345678901",
    _additional: {
      distance: 0.145,
      certainty: 0.927
    }
  },
  // ... 27 more results
]
```

---

#### Keyword Search (MongoDB)

**MongoDB Query:**
```javascript
db.places.find({
  "location.city": /Delhi/i,
  "dates.start": { 
    $gte: new Date("2025-10-01T00:00:00Z"),
    $lte: new Date("2025-10-31T23:59:59Z")
  },
  "categories": { $in: ["food", "festival"] }
}).sort({ "ratings.score": -1 }).limit(30)
```

**MongoDB Response (Top 5 of 30):**
```javascript
[
  {
    _id: "6719abc456def789012345678",
    title: "Delhi Street Food Festival",
    description: "Explore the authentic flavors of Old Delhi...",
    location: { city: "Delhi", venue: "India Gate Lawns" },
    dates: { 
      start: ISODate("2025-10-28T16:00:00Z"),
      end: ISODate("2025-10-28T23:00:00Z")
    },
    categories: ["food", "cultural", "evening"],
    ratings: { score: 4.7, count: 892 }
  },
  {
    _id: "6719abc789def012345678901",
    title: "Diwali Food Mela",
    description: "Celebrate Diwali with traditional Indian sweets...",
    location: { city: "Delhi", venue: "Connaught Place" },
    dates: {
      start: ISODate("2025-10-22T10:00:00Z"),
      end: ISODate("2025-10-24T22:00:00Z")
    },
    categories: ["food", "festival", "cultural"],
    ratings: { score: 4.3, count: 567 }
  },
  {
    _id: "6719abcdefabc012345678902",
    title: "Oktoberfest Delhi 2025",
    description: "German beer festival comes to Delhi with authentic cuisine...",
    location: { city: "Delhi", venue: "Garden of Five Senses" },
    dates: {
      start: ISODate("2025-10-10T17:00:00Z"),
      end: ISODate("2025-10-12T23:00:00Z")
    },
    categories: ["food", "festival", "beer"],
    ratings: { score: 4.4, count: 723 }
  },
  // ... 27 more results
]
```

---

#### Merge & Deduplicate

**Combined Results (45 unique items after deduplication):**
```javascript
[
  { id: "6719abc456def789012345678", title: "Delhi Street Food Festival", score: 0.944, source: "vector" },
  { id: "6719abc789def012345678901", title: "Diwali Food Mela", score: 0.927, source: "both" },
  { id: "6719abcdefabc012345678902", title: "Oktoberfest Delhi 2025", score: 0.891, source: "keyword" },
  { id: "6719abc123def456789012345", title: "Grub Fest 2025", score: 0.956, source: "vector" },
  // ... 41 more items
]
```

---

### Step 3.6: LLM Reranking

**LLM Prompt to GPT-4o-mini:**
```
You are a travel recommendation expert. Rank these events by relevance to the user's query.

User Query: "Best food festivals in Delhi this October"

Events (showing top 10 of 45):
1. Delhi Street Food Festival - Oct 28, 2025 - Rating: 4.7 - Explore authentic Old Delhi flavors with 50+ street food vendors...
2. Diwali Food Mela - Oct 22-24, 2025 - Rating: 4.3 - Celebrate Diwali with traditional Indian sweets and festive dishes...
3. Oktoberfest Delhi 2025 - Oct 10-12, 2025 - Rating: 4.4 - German beer festival with authentic Bavarian cuisine...
4. Grub Fest 2025 - Nov 15-17, 2025 - Rating: 4.5 - Delhi's biggest food festival with 150+ stalls...
5. Spice Market Food Tour - Ongoing - Rating: 4.6 - Guided tour through Delhi's historic spice markets...
6. Chandni Chowk Food Walk - Ongoing - Rating: 4.8 - Evening food walk in Old Delhi's iconic market...
7. Indian Cooking Workshop - Oct 15, 2025 - Rating: 4.2 - Learn to cook authentic North Indian cuisine...
8. Wine & Dine Festival - Oct 20-21, 2025 - Rating: 4.1 - Premium wine tasting with gourmet food pairings...
9. Vegetarian Food Fest - Oct 5-7, 2025 - Rating: 4.0 - Celebrating vegetarian cuisine from across India...
10. Farm to Table Experience - Ongoing - Rating: 4.5 - Visit organic farms and enjoy fresh farm meals...

Ranking criteria:
- Temporal match (events in October 2025 get higher priority)
- Type match (festivals > tours > workshops)
- Relevance to "food" interest
- Popularity (rating × rating count)
- Uniqueness (festival > restaurant)

Return ONLY a JSON array of IDs in ranked order: ["id1", "id2", "id3", ...]
```

**LLM Reranked Response:**
```javascript
[
  "6719abc456def789012345678", // Delhi Street Food Festival (Oct 28)
  "6719abc789def012345678901", // Diwali Food Mela (Oct 22-24)
  "6719abcdefabc012345678902", // Oktoberfest Delhi 2025 (Oct 10-12)
  "6719abc111def222345678903", // Wine & Dine Festival (Oct 20-21)
  "6719abc222def333345678904", // Vegetarian Food Fest (Oct 5-7)
  "6719abc333def444345678905", // Indian Cooking Workshop (Oct 15)
  "6719abc444def555345678906", // Chandni Chowk Food Walk
  "6719abc555def666345678907", // Spice Market Food Tour
  "6719abc123def456789012345", // Grub Fest 2025 (November - lower rank)
  "6719abc666def777345678908"  // Farm to Table Experience
]
```

---

### Step 3.7: Generate AI Summary

**LLM Prompt to GPT-4o-mini:**
```
You are a travel content writer. Create an engaging summary for these top food festivals in Delhi for October 2025.

Top Events:
1. Delhi Street Food Festival - Oct 28 at India Gate Lawns
2. Diwali Food Mela - Oct 22-24 at Connaught Place
3. Oktoberfest Delhi 2025 - Oct 10-12 at Garden of Five Senses

Generate:
1. headline: A catchy, exciting title (5-8 words)
2. overview: 2-3 sentences describing the overall experience
3. highlights: Array of 5 must-see/must-do items
4. bestTimeToVisit: Best time period within October
5. localTips: 3 insider tips for visitors
6. estimatedBudget: Budget range and what it covers

Be enthusiastic and informative. Focus on unique experiences.
```

**LLM Response:**
```javascript
{
  "headline": "Delhi's October Food Festival Extravaganza Awaits",
  "overview": "October brings Delhi's most exciting food festivals, from the vibrant Diwali Food Mela celebrating traditional Indian sweets to the authentic Delhi Street Food Festival showcasing Old Delhi's legendary street cuisine. Experience everything from German Oktoberfest celebrations to intimate cooking workshops, making it the perfect month for food enthusiasts to explore India's capital.",
  "highlights": [
    "Sample authentic Old Delhi street food from 50+ vendors at India Gate",
    "Celebrate Diwali with traditional sweets and festive delicacies",
    "Experience German Oktoberfest with craft beers and Bavarian cuisine",
    "Join cooking workshops to learn North Indian culinary secrets",
    "Explore evening food walks through historic Chandni Chowk"
  ],
  "bestTimeToVisit": "Late October (22-28) for the best weather and to catch multiple festivals including the Diwali Food Mela and Delhi Street Food Festival",
  "localTips": [
    "Arrive early (before 11 AM) to popular festivals to avoid crowds and heat",
    "Try lesser-known vendors at street food festivals for hidden gems",
    "Book cooking workshops in advance as they fill up quickly during Diwali season"
  ],
  "estimatedBudget": "₹500-2,000 per person per festival (includes entry, food samples, and activities). Most street food items cost ₹50-200, while premium events like wine tastings range ₹1,500-3,000."
}
```

---

### Step 3.8: Categorize Results

**Categorization Logic:**
```javascript
const categorized = {
  festivals: results.filter(r => r.categories.includes('festival')),
  events: results.filter(r => r.categories.includes('event') && !r.categories.includes('festival')),
  attractions: results.filter(r => r.categories.includes('attraction')),
  experiences: results.filter(r => r.categories.includes('experience') || r.categories.includes('tour'))
};
```

**Result:**
```javascript
{
  "festivals": [
    {
      "_id": "6719abc456def789012345678",
      "title": "Delhi Street Food Festival",
      "enrichedSummary": "Explore authentic Old Delhi flavors...",
      "location": {
        "venue": "India Gate Lawns",
        "city": "Delhi",
        "coordinates": { "lat": 28.6129, "lng": 77.2295 }
      },
      "dates": {
        "start": "2025-10-28T16:00:00Z",
        "end": "2025-10-28T23:00:00Z"
      },
      "pricing": { "min": 0, "max": 1000, "currency": "INR" },
      "ratings": { "score": 4.7, "count": 892 },
      "images": ["https://cdn.eventbrite.com/delhi/street-food-fest-main.jpg"],
      "tags": ["evening", "cultural", "local-cuisine", "budget-friendly"]
    },
    {
      "_id": "6719abc789def012345678901",
      "title": "Diwali Food Mela",
      "enrichedSummary": "Celebrate Diwali with traditional Indian sweets...",
      "location": {
        "venue": "Connaught Place",
        "city": "Delhi",
        "coordinates": { "lat": 28.6328, "lng": 77.2197 }
      },
      "dates": {
        "start": "2025-10-22T10:00:00Z",
        "end": "2025-10-24T22:00:00Z"
      },
      "pricing": { "min": 200, "max": 1500, "currency": "INR" },
      "ratings": { "score": 4.3, "count": 567 },
      "images": ["https://cdn.example.com/diwali-food-mela.jpg"],
      "tags": ["festival", "cultural", "sweets", "family"]
    }
    // ... more festivals
  ],
  "events": [
    {
      "_id": "6719abc333def444345678905",
      "title": "Indian Cooking Workshop",
      "enrichedSummary": "Learn authentic North Indian cuisine from expert chefs...",
      "location": {
        "venue": "Culinary Academy Delhi",
        "city": "Delhi"
      },
      "dates": {
        "start": "2025-10-15T10:00:00Z",
        "end": "2025-10-15T15:00:00Z"
      },
      "pricing": { "min": 2500, "max": 2500, "currency": "INR" },
      "ratings": { "score": 4.2, "count": 134 }
    }
    // ... more events
  ],
  "experiences": [
    {
      "_id": "6719abc444def555345678906",
      "title": "Chandni Chowk Food Walk",
      "enrichedSummary": "Evening guided food tour through Old Delhi's iconic market...",
      "location": {
        "venue": "Chandni Chowk",
        "city": "Delhi"
      },
      "dates": { "permanent": true },
      "pricing": { "min": 800, "max": 1200, "currency": "INR" },
      "ratings": { "score": 4.8, "count": 2341 }
    }
    // ... more experiences
  ],
  "attractions": []
}
```

---

### Step 3.9: Knowledge Graph Enhancement

**Graph Query:**
```javascript
// Build graph from top result
const graphState = {
  currentPlace: "Delhi Street Food Festival",
  entities: {
    city: "Delhi",
    country: "India",
    interests: ["food"],
    eventType: ["festival"]
  }
};

// Traverse graph for recommendations
const graphRecommendations = await knowledgeGraph.query(graphState);
```

**Graph Recommendations:**
```javascript
[
  {
    "title": "Old Delhi Heritage Walk",
    "reason": "Visitors to Delhi Street Food Festival often explore Old Delhi heritage sites",
    "type": "attraction",
    "score": 0.87,
    "distance": "0.5 km",
    "category": "historical"
  },
  {
    "title": "Chandni Chowk Spice Market",
    "reason": "Perfect complement to your street food experience",
    "type": "market",
    "score": 0.82,
    "distance": "0.8 km",
    "category": "shopping"
  },
  {
    "title": "Paranthe Wali Gali",
    "reason": "Famous street food lane, similar culinary experience",
    "type": "food-destination",
    "score": 0.79,
    "distance": "1.2 km",
    "category": "food"
  },
  {
    "title": "Jama Masjid",
    "reason": "Iconic landmark near food festival area",
    "type": "attraction",
    "score": 0.76,
    "distance": "0.7 km",
    "category": "historical"
  }
]
```

---

### Step 3.10: Build Final Response

**Complete Response Object:**
```javascript
{
  "success": true,
  "query": "Best food festivals in Delhi this October",
  "entities": {
    "city": "Delhi",
    "country": "India",
    "month": "October",
    "year": 2025,
    "interests": ["food"],
    "eventType": ["festival"],
    "duration": null,
    "budget": null,
    "travelStyle": ["culinary"]
  },
  "summary": {
    "headline": "Delhi's October Food Festival Extravaganza Awaits",
    "overview": "October brings Delhi's most exciting food festivals...",
    "highlights": [
      "Sample authentic Old Delhi street food from 50+ vendors at India Gate",
      "Celebrate Diwali with traditional sweets and festive delicacies",
      "Experience German Oktoberfest with craft beers and Bavarian cuisine",
      "Join cooking workshops to learn North Indian culinary secrets",
      "Explore evening food walks through historic Chandni Chowk"
    ],
    "bestTimeToVisit": "Late October (22-28) for the best weather...",
    "localTips": [
      "Arrive early (before 11 AM) to popular festivals to avoid crowds and heat",
      "Try lesser-known vendors at street food festivals for hidden gems",
      "Book cooking workshops in advance as they fill up quickly during Diwali season"
    ],
    "estimatedBudget": "₹500-2,000 per person per festival..."
  },
  "results": {
    "total": 45,
    "returned": 10,
    "categorized": {
      "festivals": [ /* 6 festivals */ ],
      "events": [ /* 2 events */ ],
      "experiences": [ /* 2 experiences */ ],
      "attractions": []
    }
  },
  "recommendations": [
    {
      "title": "Old Delhi Heritage Walk",
      "reason": "Visitors to Delhi Street Food Festival often explore Old Delhi heritage sites",
      "type": "attraction",
      "score": 0.87
    },
    {
      "title": "Chandni Chowk Spice Market",
      "reason": "Perfect complement to your street food experience",
      "type": "market",
      "score": 0.82
    },
    {
      "title": "Paranthe Wali Gali",
      "reason": "Famous street food lane, similar culinary experience",
      "type": "food-destination",
      "score": 0.79
    }
  ],
  "metadata": {
    "processingTime": 3247,
    "sources": ["timeout", "eventbrite", "tripadvisor", "google", "lonelyplanet"],
    "searchResults": {
      "vector": 30,
      "keyword": 28,
      "merged": 45,
      "reranked": 10
    },
    "cacheStatus": "miss",
    "llmCalls": {
      "entityExtraction": 1,
      "reranking": 1,
      "summary": 1,
      "total": 3
    },
    "timestamp": "2025-10-23T10:25:42.123Z"
  }
}
```

---

### Step 3.11: Cache Result

**Redis SET:**
```bash
SET query:a7f9e2c8b6d4f1e8c9a7b5d3e1f2c4a6b8d0e2f4a6c8e0f2a4b6c8d0e2f4a6b8:v1 
'<serialized JSON response>' 
EX 3600
```

---

### Step 3.12: Return to Client

**HTTP Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Processing-Time: 3247ms
X-Cache-Status: MISS

{
  "success": true,
  "query": "Best food festivals in Delhi this October",
  // ... (complete response from Step 3.10)
}
```

---

## Real-World Example: Delhi Food Festivals

### Complete End-to-End Flow Timeline

```
Day 1: October 23, 2025, 10:00 AM
├── 10:00:00 - Admin triggers crawl via CLI
├── 10:00:05 - Crawler Manager initializes
├── 10:00:10 - 6 crawlers start in parallel
├── 10:04:48 - All crawlers complete (4m 38s)
├── 10:04:50 - 187 documents stored in MongoDB
├── 10:04:55 - 187 ETL jobs queued
├── 10:05:00 - ETL workers start processing
├── 10:08:37 - ETL complete (3m 37s)
└── 10:08:40 - System ready for queries

Day 1: October 23, 2025, 10:25 AM
├── 10:25:35 - User submits query
├── 10:25:36 - Entity extraction complete (1.2s)
├── 10:25:37 - Cache check: MISS
├── 10:25:38 - Generate embeddings (0.8s)
├── 10:25:39 - Hybrid search complete (1.3s)
├── 10:25:40 - LLM reranking complete (1.1s)
├── 10:25:41 - Generate summary (1.5s)
├── 10:25:42 - Build response (0.3s)
├── 10:25:42 - Cache result
└── 10:25:42 - Return to user (Total: 3.2s)

Day 1: October 23, 2025, 10:30 AM
├── 10:30:15 - Another user submits same query
├── 10:30:15 - Cache check: HIT
└── 10:30:15 - Return cached response (Total: 0.05s)
```

---

## Example Datasets

### Sample cities.json for Batch Crawling

```json
{
  "cities": [
    {
      "city": "Delhi",
      "country": "India",
      "priority": "high",
      "crawlFrequency": "daily"
    },
    {
      "city": "Mumbai",
      "country": "India",
      "priority": "high",
      "crawlFrequency": "daily"
    },
    {
      "city": "Bangalore",
      "country": "India",
      "priority": "medium",
      "crawlFrequency": "weekly"
    },
    {
      "city": "Paris",
      "country": "France",
      "priority": "high",
      "crawlFrequency": "daily"
    },
    {
      "city": "London",
      "country": "United Kingdom",
      "priority": "high",
      "crawlFrequency": "daily"
    },
    {
      "city": "Tokyo",
      "country": "Japan",
      "priority": "medium",
      "crawlFrequency": "weekly"
    },
    {
      "city": "New York",
      "country": "United States",
      "priority": "high",
      "crawlFrequency": "daily"
    },
    {
      "city": "Dubai",
      "country": "United Arab Emirates",
      "priority": "medium",
      "crawlFrequency": "weekly"
    }
  ]
}
```

### MongoDB Document Examples

**Event Document:**
```javascript
{
  _id: ObjectId("6719abc123def456789012345"),
  title: "Grub Fest 2025",
  description: "Delhi's biggest food festival...",
  location: {
    venue: "Jawaharlal Nehru Stadium",
    address: "Pragati Vihar, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { type: "Point", coordinates: [77.2090, 28.6139] }
  },
  dates: {
    start: ISODate("2025-11-15T10:00:00Z"),
    end: ISODate("2025-11-17T22:00:00Z"),
    permanent: false
  },
  categories: ["food", "festival", "music"],
  pricing: { min: 500, max: 2000, currency: "INR", type: "ticketed" },
  ratings: { score: 4.5, count: 1247, source: "timeout" },
  images: ["https://cdn.timeout.com/delhi/grub-fest-2025-hero.jpg"],
  tags: ["outdoor", "family-friendly", "weekend", "popular"],
  source: "timeout",
  sourceUrl: "https://www.timeout.com/delhi/events/grub-fest-2025",
  weaviateId: "e8b9c7d6-5a4f-3e2d-1c0b-9a8f7e6d5c4b",
  enrichedSummary: "Experience Delhi's ultimate culinary extravaganza...",
  createdAt: ISODate("2025-10-23T10:15:30Z"),
  updatedAt: ISODate("2025-10-23T10:20:15Z")
}
```

**Attraction Document:**
```javascript
{
  _id: ObjectId("6719def456abc789012345679"),
  title: "Red Fort (Lal Qila)",
  description: "A stunning 17th-century fort complex...",
  location: {
    venue: "Red Fort",
    address: "Netaji Subhash Marg, Chandni Chowk, New Delhi",
    city: "Delhi",
    country: "India",
    coordinates: { type: "Point", coordinates: [77.2410, 28.6562] }
  },
  dates: {
    start: null,
    end: null,
    permanent: true
  },
  categories: ["attraction", "historical", "unesco-site"],
  pricing: { min: 35, max: 500, currency: "INR", type: "entry-fee" },
  ratings: { score: 4.6, count: 87534, source: "google" },
  images: ["https://maps.googleapis.com/places/photo/red-fort-main.jpg"],
  tags: ["historical", "unesco", "architecture", "must-visit"],
  openingHours: {
    monday: { open: "09:30", close: "16:30" },
    tuesday: { open: "09:30", close: "16:30" },
    // ... more days
  },
  source: "google",
  sourceUrl: "https://www.google.com/maps/place/Red+Fort",
  weaviateId: "f9c8d7e6-4b3a-2d1c-0e9f-8a7b6c5d4e3f",
  enrichedSummary: "This magnificent UNESCO World Heritage Site...",
  createdAt: ISODate("2025-10-23T10:17:45Z"),
  updatedAt: ISODate("2025-10-23T10:21:30Z")
}
```

### Weaviate Schema

```javascript
{
  "class": "TravelContent",
  "description": "Travel events, attractions, and experiences",
  "vectorizer": "none",
  "properties": [
    { "name": "title", "dataType": ["string"] },
    { "name": "description", "dataType": ["text"] },
    { "name": "enrichedSummary", "dataType": ["text"] },
    { "name": "city", "dataType": ["string"] },
    { "name": "country", "dataType": ["string"] },
    { "name": "venue", "dataType": ["string"] },
    { "name": "startDate", "dataType": ["date"] },
    { "name": "endDate", "dataType": ["date"] },
    { "name": "categories", "dataType": ["string[]"] },
    { "name": "tags", "dataType": ["string[]"] },
    { "name": "priceMin", "dataType": ["number"] },
    { "name": "priceMax", "dataType": ["number"] },
    { "name": "currency", "dataType": ["string"] },
    { "name": "rating", "dataType": ["number"] },
    { "name": "ratingCount", "dataType": ["int"] },
    { "name": "source", "dataType": ["string"] },
    { "name": "sourceUrl", "dataType": ["string"] },
    { "name": "latitude", "dataType": ["number"] },
    { "name": "longitude", "dataType": ["number"] },
    { "name": "mongoId", "dataType": ["string"] }
  ]
}
```

---

## Performance Metrics

### Crawler Performance

| Metric | Value |
|--------|-------|
| Cities crawled per day | 50-100 |
| Documents per city | 150-200 |
| Crawl time per city | 3-5 minutes |
| Success rate | 94-98% |
| Duplicate removal rate | 5-8% |
| Cache hit rate (24h) | 75-85% |

### ETL Performance

| Metric | Value |
|--------|-------|
| Documents processed per minute | 30-50 |
| Embedding generation time | 0.3-0.5s per doc |
| LLM enrichment time | 0.8-1.2s per doc |
| Weaviate sync time | 0.1-0.2s per doc |
| Total ETL time per doc | 1.2-1.9s |
| Success rate | 97-99% |

### Discovery Query Performance

| Metric | Value |
|--------|-------|
| Query response time (cache miss) | 2-5 seconds |
| Query response time (cache hit) | 50-100ms |
| Entity extraction | 1-1.5s |
| Hybrid search | 1-2s |
| LLM reranking | 1-1.5s |
| Summary generation | 1.5-2s |
| Cache hit rate | 60-70% |

### Cost Estimates (per 1000 queries)

| Service | Cost |
|---------|------|
| OpenAI Embeddings | $0.02 |
| OpenAI GPT-4o-mini | $0.15 |
| Weaviate (cloud) | $0.10 |
| MongoDB Atlas | $0.05 |
| Redis Cloud | $0.03 |
| **Total** | **$0.35** |

---

## Summary

This flow document demonstrates:

✅ **Complete data journey** from web sources to user responses  
✅ **Realistic dummy data** at every step  
✅ **Actual API requests and responses**  
✅ **Database queries and results**  
✅ **LLM prompts and completions**  
✅ **Performance metrics and timings**  
✅ **Cost estimates**  

The system processes **50-100 cities daily**, generating **7,500-20,000 documents**, and serving **thousands of discovery queries** with **2-5 second response times** (or 50ms with caching).

**Next Steps:**
1. Review the flow to understand the system
2. Test with actual data using the CLI: `npm run crawl -- -c "Delhi" -C "India"`
3. Monitor using: `npm run crawl:stats`
4. Query the API: `POST /api/v1/discovery/query`
