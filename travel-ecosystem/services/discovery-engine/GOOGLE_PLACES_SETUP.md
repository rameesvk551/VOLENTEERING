# Google Places API Setup Guide

## Why Google Places API?

The discovery engine was returning **blog articles and tourism guides** instead of **actual attractions** because it was using the Tavily web search API. To get REAL attractions like:

- **Taj Mahal** with images and coordinates (27.1751, 78.0421)
- **Qutub Minar** with images and coordinates (28.5244, 77.1855)  
- **Red Fort** with images and coordinates (28.6562, 77.2410)

We need **structured data from Google Places API**, which provides:

✅ **Real attraction names and descriptions**  
✅ **Actual photos from Google Maps**  
✅ **Precise latitude/longitude coordinates**  
✅ **User ratings and reviews**  
✅ **Opening hours and contact information**  
✅ **Official websites and addresses**

---

## Step 1: Get Google Places API Key

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create or Select a Project
- Click "Select a Project" → "New Project"
- Name: `Travel-Discovery-Engine`
- Click "Create"

### 1.3 Enable Required APIs
Navigate to: **APIs & Services** → **Library**

Enable these APIs:
1. ✅ **Places API** (New)
2. ✅ **Geocoding API**  
3. ✅ **Maps JavaScript API** (optional, for frontend)

### 1.4 Create API Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **API key**
3. Copy the API key (starts with `AIza...`)

### 1.5 Restrict API Key (Recommended)
1. Click the API key you just created
2. Under **Application restrictions**:
   - Choose "IP addresses" (for server-side)
   - Add your server IP or `0.0.0.0/0` for testing
3. Under **API restrictions**:
   - Choose "Restrict key"
   - Select:
     - ✅ Places API
     - ✅ Geocoding API
4. Click **Save**

---

## Step 2: Configure the Discovery Engine

### 2.1 Update `.env` File

```bash
# Open your .env file
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
nano .env
```

Add or update:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxx

# Keep your existing Tavily key as fallback
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.2 Verify Configuration

```bash
# Check if the key is loaded
grep GOOGLE_PLACES_API_KEY .env
```

---

## Step 3: Test the Integration

### 3.1 Restart the Discovery Engine

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start the server
npm run dev
```

### 3.2 Test with a Query

```bash
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Delhi India",
    "filters": {}
  }' | jq '.results.attractions[] | {
    title: .title,
    coordinates: .location.coordinates,
    images: .media.images[0],
    rating: .metadata.popularity
  }'
```

### 3.3 Expected Output

You should now see REAL attractions like:

```json
{
  "title": "Red Fort",
  "coordinates": [77.2410, 28.6562],
  "images": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=...",
  "rating": 0.88
}
{
  "title": "Qutub Minar",
  "coordinates": [77.1855, 28.5244],
  "images": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=...",
  "rating": 0.92
}
{
  "title": "India Gate",
  "coordinates": [77.2295, 28.6129],
  "images": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=...",
  "rating": 0.90
}
```

---

## Step 4: Understanding the Data Flow

### Before (Tavily - Web Search):
```
User Query → Tavily Web Search → Blog Articles → Generic Images → ❌ No Coordinates
```

### After (Google Places):
```
User Query → Google Places API → Real Attractions → Real Images → ✅ Precise Coordinates
```

### Fallback Strategy:
```
1. Try Database (MongoDB/Weaviate) ← Cached data
2. Try Google Places API       ← Real attractions with images & coordinates
3. Try Tavily API              ← Fallback for events/news
4. Return error if all fail
```

---

## Step 5: API Usage & Pricing

### Free Tier
- **$200 USD credit per month** (enough for ~40,000 Place Details requests)
- Places Nearby Search: $0.032 per request
- Place Details: $0.017 per request
- Photos: **FREE** (when using photo_reference)

### Cost Estimation
For 1,000 attraction searches:
- Geocoding: 1,000 × $0.005 = **$5**
- Places Search: 1,000 × $0.032 = **$32**
- Place Details: 5,000 × $0.017 = **$85**
- **Total: ~$122** (covered by $200 free credit)

### Optimization Tips
1. **Cache results** in MongoDB (already implemented)
2. **Limit requests** to 10 places per search (already configured)
3. **Use radius wisely** (default 50km)
4. **Enable billing alerts** in Google Cloud Console

---

## Step 6: Monitoring & Debugging

### Check API Usage
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project
3. View **API usage statistics**

### Debug API Errors

```bash
# Check logs
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run dev | grep "Google Places"
```

Common errors:
- `OVER_QUERY_LIMIT`: Enable billing or wait for quota reset
- `REQUEST_DENIED`: API not enabled or key restricted incorrectly
- `INVALID_REQUEST`: Check parameters

### Test Specific Attractions

```bash
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Taj Mahal Agra India", "filters": {}}' | \
  jq '.results.attractions[0]'
```

---

## Step 7: Alternative: Use Attraction Crawler (Free)

If you don't want to pay for Google Places API, you can use the built-in attraction crawler:

```bash
# Crawl attractions for a city
npm run crawl:attractions -- --city "Delhi" --country "India"

# This will scrape data from:
# - Google Search results
# - Lonely Planet
# - Atlas Obscura
# - TripAdvisor (if configured)
```

⚠️ **Note**: Crawling is slower and may not have real photos/coordinates.

---

## Troubleshooting

### Issue: Still getting blog posts instead of attractions

**Solution**: Check the data source in the response:

```bash
curl -s http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Delhi", "filters": {}}' | \
  jq '.metadata.sources'
```

Expected: `["google-places"]`  
If you see: `["tavily-realtime"]` → Google Places key not configured correctly

### Issue: API key not working

1. Verify the key in `.env`:
   ```bash
   cat .env | grep GOOGLE_PLACES_API_KEY
   ```

2. Test the key directly:
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Delhi&key=YOUR_API_KEY"
   ```

3. Check API is enabled in Google Cloud Console

---

## Summary

✅ **Before**: Blog articles with generic images, no coordinates  
✅ **After**: Real attractions (Taj Mahal, Qutub Minar) with real images and coordinates  
✅ **Cost**: Free for first $200/month (~40,000 requests)  
✅ **Quality**: 🏆 Professional-grade attraction data from Google Maps  

---

## Need Help?

1. **Google Places API Docs**: https://developers.google.com/maps/documentation/places/web-service/overview
2. **Pricing Calculator**: https://mapsplatform.google.com/pricing/
3. **Support**: https://support.google.com/cloud/
