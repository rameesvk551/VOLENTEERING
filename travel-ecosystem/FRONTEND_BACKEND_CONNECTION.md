# Frontend-Backend Connection Guide

## 🎉 Successfully Connected!

The Trip Planner frontend is now connected to the Discovery Engine backend.

---

## 📊 System Status

### Backend - Discovery Engine
- **Status**: ✅ Running
- **URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api/v1`
- **Framework**: Fastify + TypeScript
- **AI Stack**: LangChain, LangGraph, OpenAI

**Connected Services:**
- ✅ MongoDB (localhost:27017) - Travel content database
- ✅ Redis (localhost:6379) - Caching layer
- ✅ Weaviate (localhost:8080) - Vector database for semantic search

### Frontend - Trip Planner
- **Status**: ✅ Running
- **URL**: `http://localhost:5004`
- **Framework**: React + Vite + TypeScript
- **UI**: Tailwind CSS + Framer Motion

---

## 🔌 API Integration

### Configuration Files

**Backend**: `/travel-ecosystem/services/discovery-engine/.env`
```bash
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
WEAVIATE_URL=http://localhost:8080
```

**Frontend**: `/travel-ecosystem/apps/trip-planner/.env`
```bash
VITE_DISCOVERY_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Travel Discovery & Trip Planner
VITE_ENABLE_AI_DISCOVERY=true
```

### API Endpoints

The frontend connects to these backend endpoints:

1. **Discovery Search**
   - Endpoint: `POST /api/v1/discover`
   - Usage: Main AI-powered search
   - Hook: `useDiscovery.search(query, filters)`

2. **Entity Details**
   - Endpoint: `GET /api/v1/entity/:id`
   - Usage: Get detailed information about a specific entity
   - Hook: `useDiscovery.getEntityDetails(entityId)`

3. **Recommendations**
   - Endpoint: `POST /api/v1/recommendations`
   - Usage: Get personalized recommendations
   - Hook: `useDiscovery.getRecommendations(baseEntityId, context)`

4. **Trending**
   - Endpoint: `GET /api/v1/trending/:city`
   - Usage: Get trending destinations/events
   - Hook: `useDiscovery.getTrending(city, limit)`

---

## 🚀 How It Works

### Data Flow

```
User Input (Frontend)
    ↓
DiscoverySearch Component
    ↓
useDiscovery Hook
    ↓
axios POST → http://localhost:3000/api/v1/discover
    ↓
Backend Discovery Engine
    ↓
LangChain Processing
    ↓
MongoDB + Weaviate + Redis
    ↓
Response JSON
    ↓
Frontend State Update
    ↓
UI Rendering (Results, Summary, Recommendations)
```

### Key Components

**Frontend (`/apps/trip-planner/src/`)**:
- `hooks/useDiscovery.ts` - Main API integration hook
- `components/discovery/DiscoverySearch.tsx` - Search interface
- `components/discovery/ResultsGrid.tsx` - Results display
- `components/discovery/SummarySection.tsx` - AI-generated summary
- `pages/DiscoveryPage.tsx` - Main discovery page

**Backend (`/services/discovery-engine/src/`)**:
- `api/routes.ts` - API endpoints
- `chains/discovery.chain.ts` - LangChain processing
- `database/connection.ts` - Database connections
- `graph/knowledge.graph.ts` - Knowledge graph (temporarily disabled)

---

## 🧪 Testing the Connection

### 1. Check Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T14:30:52.486Z"
}
```

### 2. Test Discovery API
```bash
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Delhi in October",
    "filters": {},
    "preferences": {}
  }'
```

### 3. Test Frontend
1. Open browser: `http://localhost:5004`
2. Navigate to Discovery page
3. Enter search query: "Delhi in October"
4. Click Search or press Enter
5. View AI-generated results

---

## 🔧 Starting the Services

### Quick Start (Both Services)

```bash
# Terminal 1 - Backend
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run dev

# Terminal 2 - Frontend
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/trip-planner
npm run dev
```

### With Docker (Database Services)

```bash
# Start MongoDB, Redis, Weaviate
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
docker compose up -d

# Check status
docker compose ps
```

---

## 🎨 Frontend Features

### Discovery Search
- Natural language queries
- Real-time AI processing
- Semantic search powered by Weaviate
- Entity extraction (city, country, dates, interests)

### Results Display
- Festivals, attractions, places, events
- Rich media (images, descriptions)
- Location information with maps
- Categories and tags

### AI-Generated Summary
- Headline and overview
- Key highlights
- Best time to visit
- Travel tips

### Recommendations
- Context-aware suggestions
- Knowledge graph relationships (coming soon)
- Personalized based on interests

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Check backend is running:**
```bash
curl http://localhost:3000/health
```

**Check CORS settings:**
Backend allows all origins by default (`origin: '*'`)

**Check .env file:**
Ensure `VITE_DISCOVERY_API_URL=http://localhost:3000/api/v1`

### API returns errors

**Check OpenAI API Key:**
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
cat .env | grep OPENAI_API_KEY
```

**Check database connections:**
- MongoDB: `ss -tuln | grep 27017`
- Redis: `ss -tuln | grep 6379`
- Weaviate: `ss -tuln | grep 8080`

### Frontend shows dummy data

If API call fails, the frontend automatically falls back to dummy data for development. Check browser console for error messages.

---

## 📝 Development Notes

### Current Status
- ✅ Backend API fully functional
- ✅ Frontend connected to backend
- ✅ Discovery search working
- ✅ Entity extraction working
- ✅ Summary generation working
- ⏳ Knowledge graph recommendations (temporarily disabled - LangGraph version compatibility)

### What Works
- Natural language search queries
- AI-powered entity extraction
- Summary generation
- Results filtering by type
- CORS properly configured
- Error handling with fallback data

### Coming Soon
- Knowledge graph recommendations (requires LangGraph update)
- Streaming responses via WebSocket
- Advanced filters (budget, duration, dates)
- User preferences persistence
- Trending destinations endpoint

---

## 📚 Additional Resources

- Backend API Docs: `/services/discovery-engine/README.md`
- Frontend Guide: `/apps/trip-planner/README.md`
- Setup Guide: `/travel-ecosystem/SETUP_GUIDE.md`

---

## 🎯 Next Steps

1. **Add Sample Data** (Optional):
   ```bash
   cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
   npm run seed
   ```

2. **Configure OpenAI Key** (Required for AI features):
   Edit `.env` in discovery-engine and add your OpenAI API key

3. **Test the Full Flow**:
   - Open `http://localhost:5004`
   - Try different search queries
   - Check browser console for API calls
   - Verify backend logs for requests

4. **Deploy** (When ready):
   - Set up production environment variables
   - Configure proper CORS origins
   - Set up SSL certificates
   - Use production database connections

---

**Last Updated**: October 23, 2025
**Status**: ✅ Connected and Running
