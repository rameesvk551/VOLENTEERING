# Discovery Engine - API Orchestrator (NO AI)

## Overview

The Discovery Engine is now a **pure API orchestrator** that fetches real data from multiple external APIs. **No AI or LLMs are used** - all data comes from real services.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Discovery Engine API Orchestrator             │
│                    (No AI Required)                     │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Google Places  │  │  OpenWeather │  │  Visa Service│
│   Real Attractions│  │  Weather Data│  │  Requirements│
│   + Coordinates   │  │  + Forecast  │  │  + Rules     │
└─────────────────┘  └──────────────┘  └──────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Hotel Service  │  │ Travel Crawler│  │   Database   │
│  Static + API   │  │  Tavily + Web │  │   MongoDB    │
└─────────────────┘  └──────────────┘  └──────────────┘
```

## Data Sources

### 1. **Google Places API** (Attractions)
- ✅ Real attractions with coordinates
- ✅ Photos and images
- ✅ Ratings and reviews
- ✅ Opening hours
- ✅ Types: monuments, museums, parks, religious sites

### 2. **OpenWeather API** (Weather)
- ✅ Current weather conditions
- ✅ 5-day forecast
- ✅ Temperature, humidity, wind
- ✅ Weather descriptions and icons

### 3. **Visa Service** (Visa Requirements)
- ✅ Visa requirements by country pair
- ✅ Visa types (visa-free, on-arrival, e-visa, required)
- ✅ Processing time and costs
- ✅ Required documents
- Currently uses static data (can be extended to real API)

### 4. **Hotel Service** (Accommodations)
- ✅ Curated hotel listings
- ✅ Prices and ratings
- ✅ Amenities and photos
- ✅ Location coordinates
- Currently uses static data (can integrate with Booking.com API)

### 5. **Travel Crawler** (Articles & Tips)
- ✅ Travel articles and guides
- ✅ Local tips and recommendations
- ✅ Cultural experiences
- ✅ Uses Tavily AI for web crawling (optional)

## API Endpoints

### Main Discovery Endpoint

**POST `/api/v1/discover`**

Orchestrates all services and returns comprehensive travel data.

**Request:**
```json
{
  "city": "Delhi",
  "country": "India",
  "month": "October",
  "interests": ["culture", "food", "history"],
  "duration": 3,
  "fromCountryCode": "US"
}
```

**Response:**
```json
{
  "query": { ... },
  "attractions": [
    {
      "name": "India Gate",
      "coordinates": { "lat": 28.6129, "lng": 77.2295 },
      "photos": ["https://..."],
      "rating": 4.5,
      "types": ["tourist_attraction", "monument"]
    }
  ],
  "weather": {
    "current": {
      "temperature": 28,
      "description": "Clear sky",
      "icon": "https://..."
    },
    "forecast": [...]
  },
  "visa": {
    "visaRequired": true,
    "visaType": "evisa",
    "processingTime": "1-4 business days",
    "cost": "$80 USD"
  },
  "hotels": [
    {
      "name": "The Imperial New Delhi",
      "price": { "amount": 15000, "currency": "INR" },
      "rating": 4.7,
      "images": ["https://..."]
    }
  ],
  "travelData": {
    "articles": [...],
    "tips": [...],
    "experiences": [...]
  },
  "metadata": {
    "totalResults": 45,
    "processingTime": 2341,
    "sources": ["google-places", "openweather", "visa-api", "hotels-api"],
    "generatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Individual Service Endpoints

#### 1. Attractions
```bash
GET /api/v1/attractions?city=Delhi&country=India
```

#### 2. Weather
```bash
GET /api/v1/weather?city=Delhi&country=India
```

#### 3. Visa Requirements
```bash
GET /api/v1/visa?from=US&to=IN
```

#### 4. Hotels
```bash
GET /api/v1/hotels?city=Delhi&country=India&limit=10
```

#### 5. Travel Articles
```bash
GET /api/v1/travel-articles?city=Delhi&country=India&limit=5
```

#### 6. Travel Tips
```bash
GET /api/v1/travel-tips?city=Delhi&country=India
```

#### 7. Local Experiences
```bash
GET /api/v1/local-experiences?city=Delhi&country=India&type=food
```

## Environment Setup

### Required API Keys

```bash
# Google Places API (REQUIRED for attractions)
GOOGLE_PLACES_API_KEY=your_key_here

# OpenWeather API (REQUIRED for weather)
OPENWEATHER_API_KEY=your_key_here
```

### Optional API Keys

```bash
# RapidAPI (OPTIONAL - for real hotel data)
RAPIDAPI_KEY=your_key_here

# Tavily AI (OPTIONAL - for web crawling)
TAVILY_API_KEY=your_key_here
```

### Get API Keys

1. **Google Places API**: https://console.cloud.google.com/apis/credentials
   - Enable: Places API, Geocoding API
   - Free tier: 28,500 requests/month

2. **OpenWeather API**: https://openweathermap.org/api
   - Free tier: 1,000 calls/day

3. **RapidAPI** (Optional): https://rapidapi.com
   - For hotel data integration

4. **Tavily AI** (Optional): https://tavily.com
   - For web crawling and travel articles

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Add your API keys to .env
nano .env

# Start the server
npm run dev
```

## Usage Examples

### Example 1: Complete Discovery

```bash
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "country": "France",
    "fromCountryCode": "US",
    "interests": ["art", "food"]
  }'
```

### Example 2: Just Attractions

```bash
curl "http://localhost:3000/api/v1/attractions?city=Tokyo&country=Japan"
```

### Example 3: Weather Forecast

```bash
curl "http://localhost:3000/api/v1/weather?city=London&country=UK"
```

### Example 4: Visa Check

```bash
curl "http://localhost:3000/api/v1/visa?from=IN&to=US"
```

## Response Format

All endpoints return JSON with the following structure:

### Success Response
```json
{
  "data": { ... },
  "metadata": {
    "processingTime": 1234,
    "sources": ["google-places", "openweather"],
    "generatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 500
}
```

## Key Features

✅ **No AI/LLM Required** - Pure API orchestration  
✅ **Real-time Data** - Fresh data from live APIs  
✅ **Comprehensive** - Attractions, Weather, Visa, Hotels, Travel Tips  
✅ **Fast** - Parallel API calls for performance  
✅ **Scalable** - Modular service architecture  
✅ **Reliable** - Fallback to static data when APIs fail  

## Service Architecture

```typescript
DiscoveryOrchestrator
├── GooglePlacesService (Attractions)
├── WeatherService (Weather Data)
├── VisaService (Visa Requirements)
├── HotelService (Hotel Listings)
└── TravelCrawlerService (Articles, Tips, Experiences)
```

## Extending the Engine

### Adding a New Service

1. Create service file in `src/services/`
2. Implement service class with API integration
3. Add service to `DiscoveryOrchestrator`
4. Add endpoint in `src/api/routes.ts`

Example:
```typescript
// src/services/restaurant.service.ts
export class RestaurantService {
  async getRestaurants(city: string) {
    // API integration
  }
}

// Add to orchestrator
private async fetchRestaurants(query: DiscoveryQuery) {
  const restaurants = await this.restaurantService.getRestaurants(query.city);
  return restaurants;
}
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### System Stats
```bash
curl http://localhost:3000/api/v1/stats
```

## Performance

- **Parallel API Calls**: All services called simultaneously
- **Typical Response Time**: 1-3 seconds
- **Caching**: Redis caching for frequently accessed data (optional)
- **Rate Limiting**: Built-in rate limiting per API

## Error Handling

- Graceful degradation - partial data returned if some APIs fail
- Fallback to static data when external APIs unavailable
- Detailed error logging
- User-friendly error messages

## Limitations

1. **Google Places API**: Free tier limits to 28,500 requests/month
2. **OpenWeather API**: Free tier limits to 1,000 calls/day
3. **Static Data**: Visa and Hotel data currently use static fallbacks
4. **Coverage**: Limited to destinations with available API data

## Future Enhancements

- [ ] Real-time hotel pricing API integration
- [ ] Flight data integration
- [ ] Restaurant recommendations (Yelp/Zomato)
- [ ] Activity booking integration
- [ ] Real visa API integration
- [ ] User reviews and ratings
- [ ] Itinerary generation
- [ ] Budget estimation

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
