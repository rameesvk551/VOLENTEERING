# 🚀 Quick Start: Getting Dynamic Data

## What You Need

### 1. OpenRouter API Key (Required for AI)
- **Get it**: https://openrouter.ai/keys
- **Cost**: FREE models available (Google Gemini Flash)
- **Used for**: Smart search, AI summaries, entity extraction

### 2. Google Places API Key (Required for REAL Attractions)
- **Get it**: https://console.cloud.google.com/apis/credentials
- **Cost**: $200 FREE credit/month (~40,000 requests)
- **Used for**: Real attractions with images, coordinates, ratings
- **Why**: Without this, you get blog posts instead of actual places

### 3. Tavily API Key (Optional for Web Search)
- **Get it**: https://tavily.com
- **Cost**: FREE tier (1,000 searches/month)
- **Used for**: Real-time web data, current events/festivals

## Setup (10 minutes)

### Step 1: Get OpenRouter Key
```bash
1. Visit: https://openrouter.ai/
2. Sign in with Google/GitHub
3. Go to: https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your key (starts with sk-or-v1-...)
```

### Step 2: Get Google Places API Key (IMPORTANT!)
```bash
1. Visit: https://console.cloud.google.com/
2. Create a new project: "Travel-Discovery-Engine"
3. Enable APIs:
   - Places API
   - Geocoding API
4. Go to: Credentials → Create Credentials → API Key
5. Copy your key (starts with AIza...)
6. Restrict the key (recommended):
   - Application restrictions: IP addresses
   - API restrictions: Places API, Geocoding API
```

**📖 Detailed Guide**: See `GOOGLE_PLACES_SETUP.md` for complete instructions

### Step 3: Update .env File
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
nano .env
```

Replace/update these lines:
```bash
OPENAI_API_KEY=sk-or-v1-PASTE_YOUR_OPENROUTER_KEY_HERE
GOOGLE_PLACES_API_KEY=AIzaSyC-PASTE_YOUR_GOOGLE_KEY_HERE
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Restart Service
```bash
# Stop current service (Ctrl+C if running)
npm run dev
```

### Step 5: Test It
```bash
# Test with a city query
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Delhi India", "filters": {}}' | \
  jq '.metadata.sources'
```

Look for: `["google-places"]` ✅  
If you see: `["tavily-realtime"]` ⚠️ Google Places not configured

## Free Model Recommendations

Best free models to start:
```bash
# In .env file:
OPENAI_MODEL=google/gemini-2.0-flash-001
```

Alternative free models:
- `meta-llama/llama-3.1-8b-instruct:free`
- `google/gemini-flash-1.5`

## What Changes With API Keys?

### Before (No API Keys) ❌
- Basic keyword search
- No AI understanding
- No web data
- Limited results
- **Blog posts instead of real attractions**

### After (With OpenRouter Only) ⚠️
- Smart query understanding
- AI-powered search
- Intelligent summaries
- **Still getting blog posts** (need Google Places)

### After (With OpenRouter + Google Places) ✅
- Everything above PLUS
- **REAL attractions** (Taj Mahal, Qutub Minar, etc.)
- **Real photos** from Google Maps
- **Precise GPS coordinates**
- **User ratings and reviews**

### After (With All Keys) 🚀
- Everything above PLUS
- Real-time web data
- Current events
- Live festivals/attractions

## Example: Before vs After

### Without Google Places ❌
```json
{
  "title": "Things to do in Delhi",
  "description": "Explore the best attractions...",
  "coordinates": [0, 0],
  "images": ["https://images.unsplash.com/..."],
  "source": "tavily"
}
```

### With Google Places ✅
```json
{
  "title": "Red Fort",
  "description": "Historic fort complex serving as the main residence of Mughal emperors...",
  "coordinates": [77.2410, 28.6562],
  "rating": 0.88,
  "images": ["https://maps.googleapis.com/maps/api/place/photo?..."],
  "source": "google-places",
  "address": "Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006",
  "website": "http://www.delhitourism.gov.in/"
}
```

## Troubleshooting

**Q: Still seeing "hasOpenAIKey: false"?**
A: Make sure you saved .env and restarted the service

**Q: Getting blog posts instead of attractions?**
A: You need Google Places API key! See `GOOGLE_PLACES_SETUP.md`

**Q: Getting API errors?**
A: Check your key at https://openrouter.ai/keys or https://console.cloud.google.com/

**Q: Want web search too?**
A: Get Tavily key and add: `TAVILY_API_KEY=tvly-your-key`

## Full Documentation

See detailed guide: `OPENROUTER_SETUP_GUIDE.md`

## Quick Links

- OpenRouter: https://openrouter.ai/
- Get API Key: https://openrouter.ai/keys
- Model List: https://openrouter.ai/docs#models
- Tavily: https://tavily.com/
