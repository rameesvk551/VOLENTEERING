# 🎯 QUICK START - Real-Time Transportation System

## ⚡ Fast Setup (5 Minutes)

### Step 1: Start Databases (PowerShell)
```powershell
# Copy and paste this entire block:
.\start-transportation-system.ps1
```

### Step 2: Configure Transportation Service
```powershell
cd travel-ecosystem-backend\micro-services\transportation-service

# Create .env file
@"
PORT=3008
NODE_ENV=development
DATABASE_URL=postgresql://gtfs_user:gtfs_password@localhost:5432/gtfs
DATABASE_POOL_SIZE=20
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL_REALTIME=60
REDIS_CACHE_TTL_STATIC=300
GOOGLE_MAPS_API_KEY=
MAX_WALK_DISTANCE_METERS=800
MAX_TRANSFERS=3
RAPTOR_TIMEOUT_MS=5000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
LOG_LEVEL=info
"@ | Out-File -FilePath .env -Encoding UTF8
```

### Step 3: Initialize Database
```powershell
# Still in transportation-service directory
npm run db:migrate
```

### Step 4: Start All Services (3 Terminals)

**Terminal 1 - Transportation Service:**
```powershell
cd travel-ecosystem-backend\micro-services\transportation-service
npm run dev
```

**Terminal 2 - Route Optimizer:**
```powershell
cd travel-ecosystem-backend\micro-services\route-optimizer
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd travel-ecosystem\apps\trip-planner
npm run dev
```

### Step 5: Test It! 🎉

**Option A - Browser Test:**
1. Open http://localhost:5173
2. Search for attractions (e.g., "Singapore Marina Bay")
3. Select 3+ places
4. Click blue FAB → Click "Optimize Route"
5. **✅ Check results page - should show transport details, NOT "fallback matrix estimates"**

**Option B - API Test:**
```powershell
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route `
  -H "Content-Type: application/json" `
  -d '{
    "origin": {"name":"Start","lat":1.28,"lng":103.85},
    "destination": {"name":"End","lat":1.30,"lng":103.86},
    "preferences": {"modes":["walking","cycling","driving"]}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "steps": [...],
      "totalDistance": 2400,
      "totalDuration": 720,
      "estimatedCost": 0
    }
  ],
  "cached": false
}
```

---

## ✅ Success Indicators

### Console Output
**Transportation Service:**
```
✅ Database connected with PostGIS
✅ Redis connected
✅ Routes registered
🚀 Transportation Service running on port 3008
```

**Route Optimizer:**
```
✅ MongoDB connected
✅ MongoDB persistence layer ready
🚀 Route Optimizer Service running on port 4010
```

### API Response
- ✅ `"success": true`
- ✅ `"provider": "osrm-foot"` or `"osrm-bike"` or `"osrm-car"` (NOT "haversine-fallback")
- ✅ `"steps"` array has real data
- ✅ `"polyline"` field present (for map rendering)

### Frontend Results Page
- ✅ Map shows polylines connecting places
- ✅ Timeline shows transport details
- ✅ Cost estimates are realistic
- ✅ **NO "fallback matrix estimates" messages**

---

## 🐛 Common Issues

### "Database connection failed"
```powershell
# Check if PostgreSQL is running:
docker ps | Select-String "postgres-gtfs"

# If not, start it:
docker start postgres-gtfs

# Or recreate:
.\start-transportation-system.ps1
```

### "Cannot find module '@/services/multi-modal-router.service'"
```powershell
# Ensure TypeScript compiled:
cd travel-ecosystem-backend\micro-services\transportation-service
npm run build
npm run dev
```

### "Still seeing fallback matrix estimates"
```powershell
# Check transportation service is running:
curl http://localhost:3008/health

# Check route-optimizer env:
cd travel-ecosystem-backend\micro-services\route-optimizer
cat .env | Select-String "TRANSPORT_SERVICE_URL"
# Should be: http://localhost:3008
```

---

## 📚 What's Working

| Feature | Status | Provider |
|---------|--------|----------|
| Walking routes | ✅ Ready | OSRM |
| Cycling routes | ✅ Ready | OSRM |
| Driving routes | ✅ Ready | OSRM |
| E-scooter routes | ✅ Ready | OSRM (cycling-based) |
| Transit routes | ⏳ Needs GTFS data | RAPTOR |
| Real-time delays | ⏳ Needs GTFS-RT feeds | GTFS-RT |
| Cost estimation | ✅ Ready | Built-in |
| Polylines | ✅ Ready | OSRM/Google |
| Multiple options | ✅ Ready | Multi-provider |

**Without GTFS data**: Walking, cycling, driving, e-scooter work perfectly  
**With GTFS data**: Full transit routing with transfers  
**With GTFS-RT**: Real-time delays and vehicle positions

---

## 🚀 Quick Commands Reference

```powershell
# Start databases
.\start-transportation-system.ps1

# Stop databases
.\stop-transportation-system.ps1

# Check service health
curl http://localhost:3008/health
curl http://localhost:4010/api/health

# View logs
docker logs postgres-gtfs
docker logs redis-transport
docker logs mongodb

# Test walking route
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route -d '{"origin":{"name":"A","lat":1.28,"lng":103.85},"destination":{"name":"B","lat":1.30,"lng":103.86},"preferences":{"modes":["walking"]}}'

# Test optimization with transport
curl -X POST http://localhost:4010/api/v2/optimize-route -d '{"userId":"test","places":[{"id":"p1","name":"Place 1","lat":1.28,"lng":103.85,"priority":8},{"id":"p2","name":"Place 2","lat":1.30,"lng":103.86,"priority":7}],"constraints":{"timeBudgetMinutes":480,"travelTypes":["WALKING"],"budget":50},"options":{"includeRealtimeTransit":true}}'
```

---

## 🎉 You're Done!

If all services start and API calls return real routing data (not fallback), you've successfully implemented **real-time multimodal transportation optimization**! 🚀

**Next**: See `REALTIME_TRANSPORTATION_SETUP.md` for advanced features (GTFS import, GTFS-RT, Google API)

---

**Last Updated**: November 15, 2025  
**Setup Time**: ~5 minutes  
**Difficulty**: Easy ⭐⭐☆☆☆
