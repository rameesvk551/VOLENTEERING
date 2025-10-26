# Travel Planning Engine - Dynamic Data Setup

## Overview

The Travel Planning Engine has been updated to use **dynamic data** from the Discovery Engine backend API instead of hardcoded dummy data.

## What Was Fixed

### 1. **Backend Integration**
- Created a simplified Discovery Engine server (`simple-server.ts`) that works without full database dependencies
- Generates dynamic mock data for destinations, attractions, and places
- Provides REST API endpoints for the frontend to consume

### 2. **Frontend Updates**
- Updated `PlanYourTrip.tsx` to fetch dynamic destinations from the API
- Added loading states and refresh functionality
- Falls back to dummy data if API is unavailable
- Integrated with `useDiscovery` hook for API calls

### 3. **Data Flow**
```
Frontend (Trip Planner) → API Request → Backend (Discovery Engine) → Dynamic Data → Frontend Display
```

## Running the Services

### Option 1: Using the Startup Script (Recommended)
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem
./start-travel-planning.sh
```

This script will:
- Check and free up ports 3000 and 5173
- Start the Discovery Engine backend on port 3000
- Start the Trip Planner frontend on port 5004
- Display logs and status

### Option 2: Manual Start

#### Start Discovery Engine Backend
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run dev:simple
```
Backend will run on: `http://localhost:3000`

#### Start Trip Planner Frontend
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/trip-planner
npm run dev
```
Frontend will run on: `http://localhost:5004`

## Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-25T...",
  "mode": "simple",
  "message": "Discovery Engine running in development mode"
}
```

### 2. Test Discovery API
```bash
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "popular destinations", "filters": {}}'
```

### 3. Test Frontend
Open your browser and navigate to:
- **Trip Planner**: http://localhost:5004

## Features

### Dynamic Data Loading
- Destinations are loaded from the API when the page loads
- Click "Refresh Destinations" button to reload data from the API
- Loading indicators show when data is being fetched
- Graceful fallback to dummy data if API fails

### API Endpoints

#### Discovery Engine Backend (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/discover` | POST | Main discovery endpoint |
| `/api/v1/entity/:id` | GET | Get entity details |
| `/api/v1/trending/:city` | GET | Get trending places |

## Configuration

### Frontend Environment Variables
Located at: `/travel-ecosystem/apps/trip-planner/.env`

```env
VITE_DISCOVERY_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Travel Discovery & Trip Planner
VITE_ENABLE_AI_DISCOVERY=true
```

### Backend Environment Variables
Located at: `/travel-ecosystem/services/discovery-engine/.env`

```env
NODE_ENV=development
PORT=3000
# Add real API keys for full functionality
OPENAI_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

## Architecture

### Frontend Components
```
PlanYourTrip.tsx
├── useDiscovery hook (API calls)
├── DestinationCard (Display)
├── SearchFilter (User input)
└── TripPlanCard (Plans)
```

### Backend Architecture
```
simple-server.ts
├── Fastify server
├── CORS enabled
├── Mock data generator
└── REST API endpoints
```

## Data Format

### Destination Object
```typescript
{
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  bestTimeToVisit: string;
  estimatedCost: string;
  duration: string;
  highlights: string[];
  category: string;
  coordinates: { lat: number; lng: number };
}
```

### Discovery Entity
```typescript
{
  id: string;
  type: 'festival' | 'attraction' | 'event' | 'place';
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  metadata: {
    category: string[];
    tags: string[];
    popularity: number;
    cost?: string;
    duration?: string;
  };
  media: {
    images: string[];
  };
}
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5004
lsof -ti:5004 | xargs kill -9
```

### Backend Not Responding
1. Check if backend is running: `lsof -i :3000`
2. Check logs: `tail -f /tmp/discovery-engine.log`
3. Restart backend: `npm run dev:simple`

### Frontend Shows Dummy Data
1. Check if backend is running and healthy
2. Verify VITE_DISCOVERY_API_URL in .env
3. Check browser console for errors
4. Click "Refresh Destinations" button

### CORS Errors
- Backend has CORS enabled for all origins (`*`)
- If issues persist, check browser console for specific errors

## Next Steps

### For Production Use
1. **Configure Real API Keys**: Add OpenAI, Tavily, and other API keys to `.env`
2. **Setup Databases**: Configure MongoDB, Redis, and Weaviate
3. **Enable Full Features**: Use `npm run dev` instead of `dev:simple`
4. **Add Authentication**: Implement user authentication
5. **Deploy Services**: Deploy both frontend and backend to production

### For Enhanced Development
1. **Add More Mock Data**: Expand the mock data generator
2. **Implement Caching**: Add Redis caching layer
3. **Add Analytics**: Track user interactions
4. **Improve Error Handling**: Add retry logic and better error messages

## Key Files Modified

### Frontend
- `/apps/trip-planner/src/pages/PlanYourTrip.tsx` - Added dynamic data loading
- `/apps/trip-planner/src/hooks/useDiscovery.ts` - Added searchDestinations method
- `/apps/trip-planner/.env` - API URL configuration

### Backend
- `/services/discovery-engine/src/api/simple-server.ts` - New simplified server
- `/services/discovery-engine/package.json` - Added dev:simple script

### Scripts
- `/travel-ecosystem/start-travel-planning.sh` - Startup script for both services

## Current Status

✅ **Working Features:**
- Dynamic data generation on backend
- API integration between frontend and backend
- Real-time data loading with loading states
- Refresh functionality
- Graceful fallback to dummy data
- CORS enabled for cross-origin requests
- Health check endpoint

🔄 **In Progress:**
- Full database integration
- Real AI-powered recommendations
- User authentication
- Caching layer

⏭️ **Future Enhancements:**
- Real-time updates via WebSocket
- Offline support
- Advanced filtering
- Personalized recommendations

## Support

For issues or questions:
1. Check the logs in `/tmp/discovery-engine.log` and `/tmp/trip-planner.log`
2. Verify all services are running with `lsof -i :3000 -i :5004`
3. Check browser console for frontend errors
4. Review this documentation for troubleshooting steps

---

**Last Updated**: October 25, 2025  
**Status**: ✅ Running with Dynamic Data  
**Backend**: http://localhost:3000  
**Frontend**: http://localhost:5004
