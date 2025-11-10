# Google Places Test Scripts

This directory contains test scripts for fetching and storing Google Places data.

## Scripts

### 1. `test-google-places.js`
Simple test script that fetches attractions from Google Places API and logs the results to console.

**Usage:**
```bash
node scripts/test-google-places.js
```

**Output:** JSON data logged to console

---

### 2. `test-google-places-with-db.js`
Enhanced script that fetches attractions and saves them to both MongoDB and Redis.

**Features:**
- Fetches top attractions from Google Places Text Search API
- Retrieves detailed information for each place
- Saves data to MongoDB in the `attractions` collection
- Caches data in Redis with 7-day expiration
- Creates an index of all places for quick lookups

**Usage:**
```bash
node scripts/test-google-places-with-db.js
```

**Data Stored:**

**MongoDB Collection: `attractions`**
- placeId (unique identifier)
- name
- description
- address
- location (city, country, coordinates)
- rating & userRatingsTotal
- types & categories
- photos (up to 3 URLs)
- website, phoneNumber, url
- openingHours
- source & timestamps

**Redis Keys:**
- `place:delhi:{placeId}` - Individual place data (TTL: 7 days)
- `places:delhi:index` - Index of all Delhi attractions (TTL: 7 days)

---

### 3. `verify-db-data.js`
Verification script that checks data stored in MongoDB and Redis.

**Usage:**
```bash
node scripts/verify-db-data.js
```

**Output:** 
- Total count of attractions in MongoDB
- Sample data from MongoDB
- Redis cache statistics
- Sample cached data from Redis

---

## Environment Variables

Make sure your `.env` file contains:

```env
# Google Places API
GOOGLE_PLACE_API=your_api_key_here
# OR
GOOGLE_PLACES_API_KEY=your_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/travel_discovery

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

---

## Prerequisites

1. **Google Places API Key**
   - Get it from: https://console.cloud.google.com/apis/credentials
   - Enable: Places API, Geocoding API

2. **MongoDB** (running locally or remote)
   - Default: `mongodb://localhost:27017/travel_discovery`

3. **Redis** (running locally or remote)
   - Default: `localhost:6379`

4. **Node.js packages** (already installed)
   - mongoose
   - ioredis

---

## Data Flow

```
Google Places API
       ↓
  Text Search (query: "attractions in Delhi")
       ↓
  Place Details (for each result)
       ↓
   ┌─────────────┐
   │   MongoDB   │  ← Persistent storage
   └─────────────┘
       ↓
   ┌─────────────┐
   │    Redis    │  ← Cache (7 days TTL)
   └─────────────┘
```

---

## Querying the Data

### MongoDB (using mongosh)

```javascript
// Connect to database
use travel_discovery

// Find all attractions
db.attractions.find().pretty()

// Find by city
db.attractions.find({ "location.city": "Delhi" })

// Find by rating
db.attractions.find({ rating: { $gte: 4.5 } })

// Count total attractions
db.attractions.countDocuments()
```

### Redis (using redis-cli)

```bash
# Get all Delhi place keys
KEYS place:delhi:*

# Get place index
GET places:delhi:index

# Get specific place data
GET place:delhi:{placeId}

# Check TTL
TTL place:delhi:{placeId}
```

### Using Node.js

```javascript
const mongoose = require('mongoose');
const Redis = require('ioredis');

// MongoDB
await mongoose.connect('mongodb://localhost:27017/travel_discovery');
const Attraction = mongoose.model('Attraction', new mongoose.Schema({}, { strict: false, collection: 'attractions' }));
const places = await Attraction.find({ "location.city": "Delhi" });

// Redis
const redis = new Redis();
const indexData = await redis.get('places:delhi:index');
const index = JSON.parse(indexData);
console.log(index.placeIds); // Array of place IDs
```

---

## Extending the Scripts

To fetch attractions for other cities, modify the query in the scripts:

```javascript
// Change this line:
const query = 'attractions in Delhi';

// To:
const query = 'attractions in Mumbai';
// or
const query = 'attractions in Paris';
```

You can also modify the filters:
- Number of results: `.slice(0, 5)` → `.slice(0, 10)`
- Place types: `type: 'tourist_attraction'`
- Radius: `radius: 50000` (meters)

---

## Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `.env`

**Redis connection failed:**
- Ensure Redis is running: `redis-server` or check service status
- Verify host/port in `.env`

**API key error:**
- Check that your Google Places API key is valid
- Ensure Places API is enabled in Google Cloud Console
- Check API quotas and billing

**Module not found:**
- Run `npm install` in the discovery-engine directory

---

## API Quotas

Google Places API free tier:
- Text Search: $17 per 1000 requests
- Place Details: $17 per 1000 requests
- Photo: $7 per 1000 requests

**Recommendation:** Cache aggressively (Redis TTL) and use MongoDB for persistent storage to minimize API calls.
