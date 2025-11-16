# 🚀 Real-Time Multimodal Transportation Setup Guide

## Overview

This guide will help you set up the complete real-time multimodal transportation system with:
- ✅ OSRM routing for walking/cycling/driving
- ✅ RAPTOR algorithm for optimal public transit routing
- ✅ GTFS-RT integration for real-time delays and vehicle positions
- ✅ Google Directions API integration (optional)
- ✅ Multi-provider fallback system

---

## 🏗️ Architecture

```
Route Optimizer Service (Port 4010)
        ↓ (requests multi-modal routes)
Transportation Service (Port 3008)
        ↓
┌───────┴─────────────────────────────────┐
│ MultiModalRouter Service                │
├─────────────────────────────────────────┤
│ • RAPTOR (Transit + GTFS-RT)           │
│ • OSRM (Walking/Cycling/Driving)       │
│ • Google Directions (Optional)          │
│ • HERE/TomTom (Optional)                │
└─────────────────────────────────────────┘
        ↓
┌───────┴─────────────────────────────────┐
│ Data Sources                            │
├─────────────────────────────────────────┤
│ • PostgreSQL + PostGIS (GTFS Static)   │
│ • Redis (Caching)                       │
│ • GTFS-RT Feeds (Real-time)            │
│ • External APIs                         │
└─────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Required
- **Node.js** 20+ and npm
- **PostgreSQL** 14+ with PostGIS extension
- **Redis** 6+
- **MongoDB** 6+ (for route-optimizer persistence)

### Optional (for enhanced features)
- **Google Maps API Key** (for Directions API)
- **Mapbox API Key** (for enhanced routing)
- **HERE Maps API Key** (alternative provider)
- **TomTom API Key** (alternative provider)

---

## ⚡ Quick Start

### 1. Install Dependencies

```powershell
# Transportation Service
cd travel-ecosystem-backend\micro-services\transportation-service
npm install

# Route Optimizer Service
cd ..\route-optimizer
npm install
```

### 2. Setup PostgreSQL with PostGIS

```powershell
# Start PostgreSQL with Docker
docker run -d `
  --name postgres-gtfs `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_USER=gtfs_user `
  -e POSTGRES_DB=gtfs `
  -p 5432:5432 `
  postgis/postgis:14-3.2

# Wait for PostgreSQL to start
Start-Sleep -Seconds 10

# Create tables (run migrations)
cd travel-ecosystem-backend\micro-services\transportation-service
npm run db:migrate
```

### 3. Setup Redis

```powershell
# Start Redis with Docker
docker run -d `
  --name redis-transport `
  -p 6379:6379 `
  redis:7-alpine
```

### 4. Configure Environment Variables

Create `.env` files for each service:

**transportation-service/.env**
```env
# Server
PORT=3008
NODE_ENV=development

# Database (PostgreSQL + PostGIS)
DATABASE_URL=postgresql://gtfs_user:your_password@localhost:5432/gtfs
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL_REALTIME=60
REDIS_CACHE_TTL_STATIC=300

# External APIs (Optional)
GOOGLE_MAPS_API_KEY=your_google_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
HERE_API_KEY=your_here_api_key_here
TOMTOM_API_KEY=your_tomtom_api_key_here

# GTFS Static Feeds (comma-separated URLs)
GTFS_FEED_URLS=https://example.com/gtfs.zip,https://another-agency.com/gtfs.zip
GTFS_UPDATE_CRON=0 3 * * *

# GTFS Real-Time Feeds
GTFS_RT_VEHICLE_POSITIONS_URL=https://example.com/gtfs-rt/vehicle-positions
GTFS_RT_TRIP_UPDATES_URL=https://example.com/gtfs-rt/trip-updates
GTFS_RT_POLL_INTERVAL=15000

# Routing Configuration
MAX_WALK_DISTANCE_METERS=800
MAX_TRANSFERS=3
RAPTOR_TIMEOUT_MS=5000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info
```

**route-optimizer/.env**
```env
PORT=4010
MONGODB_URI=mongodb://localhost:27017
DB_NAME=travel-route-optimizer
OSRM_URL=http://router.project-osrm.org
TRANSPORT_SERVICE_URL=http://localhost:3008
TRANSPORT_TIMEOUT_MS=8000
ROUTE_JOB_TTL_MS=2592000000
```

### 5. Import GTFS Data (Optional - for Transit Routing)

```powershell
# Download GTFS feed for your city
# Example: Singapore LTA GTFS
Invoke-WebRequest -Uri "https://datamall.lta.gov.sg/content/dam/datamall/datasets/PublicTransportRelated/GTFS.zip" -OutFile "gtfs.zip"

# Set GTFS_FEED_URLS in .env, then import
cd travel-ecosystem-backend\micro-services\transportation-service
npm run gtfs:import
```

---

## 🎯 Running the Services

### Start All Services

**Terminal 1: PostgreSQL & Redis**
```powershell
# Already running in Docker (see setup above)
docker ps
```

**Terminal 2: MongoDB**
```powershell
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Terminal 3: Transportation Service**
```powershell
cd travel-ecosystem-backend\micro-services\transportation-service
npm run dev
```

**Terminal 4: Route Optimizer Service**
```powershell
cd travel-ecosystem-backend\micro-services\route-optimizer
npm run dev
```

**Terminal 5: Trip Planner Frontend**
```powershell
cd travel-ecosystem\apps\trip-planner
npm run dev
```

### Expected Console Output

**Transportation Service:**
```
✅ Database connected with PostGIS
✅ Redis connected
✅ Routes registered
✅ GTFS-RT polling started
🚀 Transportation Service running on port 3008
```

**Route Optimizer Service:**
```
✅ MongoDB connected: travel-route-optimizer
✅ MongoDB indexes created
✅ MongoDB persistence layer ready
🚀 Route Optimizer Service running on port 4010
```

---

## 🧪 Testing the Implementation

### Test 1: Basic Multimodal Routing

```powershell
# Test walking route
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route `
  -H "Content-Type: application/json" `
  -d '{
    "origin": {"name":"Marina Bay","lat":1.2805,"lng":103.8574},
    "destination": {"name":"Orchard Road","lat":1.3048,"lng":103.8318},
    "preferences": {"modes":["walking"]}
  }'
```

### Test 2: Transit with Real-Time

```powershell
# Test transit route with real-time delays
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route `
  -H "Content-Type: application/json" `
  -d '{
    "origin": {"name":"Changi Airport","lat":1.3644,"lng":103.9915},
    "destination": {"name":"Marina Bay Sands","lat":1.2834,"lng":103.8607},
    "departureTime": "'$(Get-Date -Format "o")'",
    "preferences": {
      "modes":["transit","walking"],
      "maxWalkDistance":800,
      "maxTransfers":2,
      "budget":"balanced"
    }
  }'
```

### Test 3: Multiple Travel Modes

```powershell
# Test all modes: transit, walking, cycling, driving, e-scooter
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route `
  -H "Content-Type: application/json" `
  -d '{
    "origin": {"name":"Sentosa","lat":1.2494,"lng":103.8303},
    "destination": {"name":"Jewel Changi","lat":1.3594,"lng":103.9890},
    "preferences": {
      "modes":["transit","walking","cycling","driving","escooter"],
      "budget":"balanced"
    }
  }'
```

### Test 4: End-to-End via Route Optimizer

```powershell
# Test complete route optimization with real transport data
curl -X POST http://localhost:4010/api/v2/optimize-route `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user",
    "places": [
      {"id":"p1","name":"Merlion Park","lat":1.2868,"lng":103.8545,"priority":8},
      {"id":"p2","name":"Gardens by the Bay","lat":1.2816,"lng":103.8636,"priority":7},
      {"id":"p3","name":"Chinatown","lat":1.2816,"lng":103.8443,"priority":6}
    ],
    "constraints": {
      "timeBudgetMinutes": 480,
      "travelTypes": ["PUBLIC_TRANSPORT","WALKING"],
      "budget": 30
    },
    "options": {
      "includeRealtimeTransit": true,
      "priorityWeighting": 0.3
    }
  }'
```

---

## 📊 Monitoring & Debugging

### Check Service Health

```powershell
# Transportation Service
curl http://localhost:3008/health

# Route Optimizer Service
curl http://localhost:4010/api/health
```

### Monitor Real-Time Updates

```powershell
# Check Redis for cached routes
docker exec -it redis-transport redis-cli
> KEYS *multimodal*
> GET route:...

# Check PostgreSQL for GTFS-RT data
docker exec -it postgres-gtfs psql -U gtfs_user -d gtfs
> SELECT COUNT(*) FROM vehicle_positions;
> SELECT COUNT(*) FROM trip_updates;
```

### View Logs

```powershell
# Transportation Service logs
cd travel-ecosystem-backend\micro-services\transportation-service
npm run dev | Select-String "RAPTOR|GTFS-RT|multimodal"

# Route Optimizer logs
cd ..\route-optimizer
npm run dev | Select-String "transport|leg|real"
```

---

## 🔧 Configuration Options

### Transport Modes Priority

The system ranks transport options based on:
- **Budget**: Cost → Duration
- **Balanced**: (Duration/60 + Cost×10)
- **Premium**: Duration only

### GTFS-RT Update Frequency

- **Vehicle Positions**: Every 15 seconds (default)
- **Trip Updates**: Every 15 seconds (default)
- **Cache TTL**: 60 seconds for realtime, 300 seconds for static

### Fallback Hierarchy

1. **RAPTOR + GTFS-RT** (transit with real-time)
2. **OSRM** (walking/cycling/driving)
3. **Google Directions** (if API key provided)
4. **Haversine** (straight-line fallback)

---

## 🐛 Troubleshooting

### "realtime transport unavailable, used fallback"

**Causes:**
1. Transportation service not running
2. No GTFS data imported
3. GTFS-RT feeds not configured
4. Database connection failed

**Solutions:**
```powershell
# Check transportation service status
curl http://localhost:3008/health

# Check if GTFS data exists
docker exec -it postgres-gtfs psql -U gtfs_user -d gtfs -c "SELECT COUNT(*) FROM stops;"

# Check environment variables
cd travel-ecosystem-backend\micro-services\transportation-service
cat .env | Select-String "GTFS"

# Restart services
npm run dev
```

### "No transit routes found"

**Causes:**
1. Origin/destination too far from transit stops
2. No service at requested time
3. maxWalkDistance too restrictive

**Solutions:**
```powershell
# Increase walk distance
curl -X POST http://localhost:3008/api/v1/transport/multi-modal-route `
  -d '{"preferences":{"maxWalkDistance":1200}}'

# Check nearby stops
curl "http://localhost:3008/api/v1/transport/nearby-stops?lat=1.28&lng=103.85&radius=1000"
```

### PostgreSQL Connection Errors

```powershell
# Check if PostGIS is enabled
docker exec -it postgres-gtfs psql -U gtfs_user -d gtfs -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Verify connection string
$env:DATABASE_URL="postgresql://gtfs_user:your_password@localhost:5432/gtfs"
npm run dev
```

---

## 📚 API Documentation

### POST /api/v1/transport/multi-modal-route

**Request:**
```json
{
  "origin": {
    "name": "Start Point",
    "lat": 1.28,
    "lng": 103.85
  },
  "destination": {
    "name": "End Point",
    "lat": 1.30,
    "lng": 103.86
  },
  "departureTime": "2025-11-15T09:00:00Z",
  "preferences": {
    "modes": ["transit", "walking", "cycling", "driving", "escooter"],
    "maxWalkDistance": 800,
    "maxTransfers": 3,
    "budget": "balanced"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "origin": {...},
      "destination": {...},
      "steps": [
        {
          "mode": "transit",
          "from": "Stop A",
          "to": "Stop B",
          "distance": 5000,
          "duration": 600,
          "route": "Bus 175",
          "routeColor": "#FF5733",
          "departureTime": "2025-11-15T09:05:00Z",
          "arrivalTime": "2025-11-15T09:15:00Z",
          "stops": 8,
          "delay": 30
        }
      ],
      "totalDistance": 5000,
      "totalDuration": 600,
      "estimatedCost": 2.50
    }
  ],
  "cached": false
}
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] PostgreSQL running with PostGIS extension
- [ ] Redis running and accessible
- [ ] MongoDB running (for route-optimizer)
- [ ] Transportation service running on port 3008
- [ ] Route optimizer service running on port 4010
- [ ] Can query `/health` endpoints
- [ ] Can query `/nearby-stops` endpoint
- [ ] GTFS data imported (if using transit)
- [ ] GTFS-RT feeds configured (if using real-time)
- [ ] Can get walking routes via OSRM
- [ ] Can get transit routes via RAPTOR
- [ ] Route optimizer returns transport legs (not "fallback")
- [ ] Frontend shows transport details in results page

---

## 🎉 Success Indicators

When everything works, you'll see:

### Backend Logs
```
✅ GTFS-RT: Updated vehicle positions (count: 145)
✅ GTFS-RT: Updated trip updates (count: 89)
✅ RAPTOR: Finding transit route
✅ MultiModalRouter: Computing multimodal routes
✅ Route cached for 60s
```

### API Response
```json
{
  "success": true,
  "data": [
    {
      "steps": [...],
      "totalDistance": 5234,
      "totalDuration": 1205,
      "estimatedCost": 2.50
    }
  ],
  "cached": false
}
```

### Frontend Results Page
- ✅ Map shows polylines for each leg
- ✅ Timeline shows transport mode icons
- ✅ Transport details show route numbers and colors
- ✅ Costs are realistic (not $0.00)
- ✅ Real-time delays visible (if GTFS-RT active)

---

## 🆘 Need Help?

1. **Check logs** in terminal for error messages
2. **Verify environment** variables in `.env` files
3. **Test each service** independently with curl
4. **Review database** tables for GTFS data
5. **Check Docker** containers are running

**Common Issues:**
- No GTFS data → Import GTFS feeds
- No real-time → Configure GTFS-RT URLs
- Fallback always used → Check transportation service logs
- PostgreSQL errors → Verify PostGIS extension
- Redis errors → Check Redis container status

---

**Last Updated**: November 15, 2025  
**Version**: 3.0.0 - Complete Real-Time Multimodal Transportation
