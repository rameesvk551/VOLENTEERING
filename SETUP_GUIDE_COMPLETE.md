# 🚀 Installation & Setup Guide

## Complete Route Optimization System Setup

This guide will help you set up and run the complete route optimization system with all new features.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Docker)
- Git
- Windows PowerShell (or terminal of choice)

---

## ⚡ Quick Install

### 1. Install Backend Dependencies

```powershell
# Navigate to route optimizer service
cd travel-ecosystem-backend\micro-services\route-optimizer

# Install dependencies (includes new mongodb package)
npm install

# Create .env file
New-Item -Path ".env" -ItemType File -Force
Add-Content -Path ".env" -Value "PORT=4010"
Add-Content -Path ".env" -Value "MONGODB_URI=mongodb://localhost:27017"
Add-Content -Path ".env" -Value "DB_NAME=travel-route-optimizer"
Add-Content -Path ".env" -Value "OSRM_URL=http://router.project-osrm.org"
Add-Content -Path ".env" -Value "TRANSPORT_SERVICE_URL=http://localhost:3008"
```

### 2. Install Frontend Dependencies

```powershell
# Navigate to trip planner
cd travel-ecosystem\apps\trip-planner

# Install dependencies (includes new @mapbox/polyline and types)
npm install
```

### 3. Start MongoDB

**Option A: Docker (Recommended)**
```powershell
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Option B: Local MongoDB**
```powershell
# If you have MongoDB installed locally
mongod --dbpath C:\data\db
```

---

## 🎯 Running the System

### Start All Services

**Terminal 1: API Gateway**
```powershell
cd travel-ecosystem-backend\api-gateway
npm run dev
```

**Terminal 2: Route Optimizer** (NEW - with persistence)
```powershell
cd travel-ecosystem-backend\micro-services\route-optimizer
npm run dev
```

**Terminal 3: Transportation Service** (Optional - for real-time transit)
```powershell
cd travel-ecosystem-backend\micro-services\transportation-service
npm run dev
```

**Terminal 4: Trip Planner Frontend**
```powershell
cd travel-ecosystem\apps\trip-planner
npm run dev
```

### Expected Console Output

**Route Optimizer Service:**
```
✅ MongoDB connected: travel-route-optimizer
✅ MongoDB indexes created
✅ MongoDB persistence layer ready
🚀 Route Optimizer Service running on port 4010
📍 Health check: http://localhost:4010/api/health
🗺️  Optimize route: POST http://localhost:4010/api/optimize-route
```

---

## 🧪 Testing the Implementation

### 1. Test Basic Optimization

```powershell
# Open browser
Start-Process "http://localhost:5173"
```

Then:
1. Search for "Singapore attractions"
2. Select 3+ attractions
3. Click the blue FAB
4. Select travel types
5. Click "Optimize Route"
6. View the **NEW results page** with:
   - Interactive map with polylines ✨
   - Timeline with transport details ✨
   - Cost breakdown ✨
   - Export buttons ✨

### 2. Test Persistence

```powershell
# Test creating an optimization
curl -X POST http://localhost:4010/api/v2/optimize-route `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "places": [
      {"id":"p1","name":"Place 1","lat":1.28,"lng":103.85,"priority":8},
      {"id":"p2","name":"Place 2","lat":1.29,"lng":103.86,"priority":6}
    ],
    "constraints": {
      "timeBudgetMinutes": 480,
      "travelTypes": ["WALKING"],
      "budget": 50
    },
    "options": {
      "includeRealtimeTransit": true,
      "priorityWeighting": 0.3
    }
  }'

# Get user history
curl http://localhost:4010/api/v2/optimizations?userId=test-user-123

# Get user stats
curl http://localhost:4010/api/v2/optimizations/stats/test-user-123
```

### 3. Test Priority & Budget Constraints

Create optimization with different priorities:
- High priority (8-10): Visited first
- Low priority (1-3): Visited last or excluded if budget tight

```json
{
  "places": [
    {"id":"p1","name":"Museum","lat":1.28,"lng":103.85,"priority":9},
    {"id":"p2","name":"Mall","lat":1.29,"lng":103.86,"priority":3},
    {"id":"p3","name":"Beach","lat":1.30,"lng":103.87,"priority":7}
  ],
  "constraints": {"budget": 20},
  "options": {"priorityWeighting": 0.5}
}
```

Expected: Museum → Beach → Mall (or Mall excluded if budget exceeded)

---

## 📂 New Files Created

### Backend
- `database/connection.ts` - MongoDB connection manager
- `database/optimization-job.repository.ts` - Job CRUD operations
- `handlers/optimize-route-enhanced.handler.ts` - Enhanced API handlers

### Frontend
- `pages/RouteOptimizationResultsPage.tsx` - Complete results page with map
- Updated `types/trip-planner.types.ts` - Extended types for legs, timeline, geometry

### Documentation
- `COMPLETE_ROUTE_OPTIMIZATION_IMPLEMENTATION.md` - Full feature documentation

---

## 🔧 Configuration Options

### Backend Environment Variables

```env
# Route Optimizer Service
PORT=4010
MONGODB_URI=mongodb://localhost:27017
DB_NAME=travel-route-optimizer
OSRM_URL=http://router.project-osrm.org
TRANSPORT_SERVICE_URL=http://localhost:3008
TRANSPORT_TIMEOUT_MS=8000
ROUTE_JOB_TTL_MS=2592000000  # 30 days
```

### Frontend Package Updates

Added to `trip-planner/package.json`:
```json
{
  "dependencies": {
    "@mapbox/polyline": "^1.2.0"
  },
  "devDependencies": {
    "@types/mapbox__polyline": "^1.0.5"
  }
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```powershell
# Check if MongoDB is running
docker ps | Select-String mongodb

# Restart MongoDB
docker restart mongodb

# Check logs
docker logs mongodb
```

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :4010

# Kill process
taskkill /F /PID <PID>
```

### Frontend Build Errors
```powershell
# Clear node_modules and reinstall
cd travel-ecosystem\apps\trip-planner
Remove-Item -Recurse -Force node_modules
npm install
```

### Polylines Not Showing
- Ensure OSRM_URL is accessible
- Check browser console for polyline decode errors
- Fallback to straight lines is automatic

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MongoDB connected and indexes created
- [ ] Route optimizer service running on port 4010
- [ ] Frontend shows discovery page
- [ ] Can select attractions
- [ ] Optimization modal opens
- [ ] Optimization completes successfully
- [ ] Results page shows:
  - [ ] Interactive map with route
  - [ ] Polylines connecting stops
  - [ ] Timeline with transport details
  - [ ] Cost estimates
  - [ ] Export buttons visible
- [ ] Can retrieve optimization history
- [ ] Priority constraints affect order
- [ ] Budget constraints filter places

---

## 📚 API Documentation

### New Endpoints

**POST /api/v2/optimize-route**
- Body: OptimizeRouteRequest with userId, places, constraints, options
- Returns: Complete optimization with legs, timeline, geometry
- Auto-saves to MongoDB

**GET /api/v2/optimize-route/:jobId**
- Returns: Saved optimization job by ID

**GET /api/v2/optimizations?userId=X&limit=20**
- Returns: User's optimization history

**GET /api/v2/optimizations/stats/:userId**
- Returns: User statistics (total jobs, avg distance, avg duration)

**DELETE /api/v2/optimize-route/:jobId?userId=X**
- Deletes: Optimization job (requires userId for ownership check)

---

## 🎉 Success!

If everything works, you should see:

1. ✅ All services running without errors
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Can select and optimize routes
4. ✅ Results page shows complete details
5. ✅ Data persists in MongoDB
6. ✅ Priority and budget constraints work

**You now have a COMPLETE route optimization system!** 🚀

---

## 🆘 Need Help?

Check these files:
- `COMPLETE_ROUTE_OPTIMIZATION_IMPLEMENTATION.md` - Feature details
- `ROUTE_OPTIMIZATION_COMPLETE.md` - Architecture overview
- Backend service logs in console
- Browser developer console for frontend errors

---

**Last Updated**: November 15, 2025
**Version**: 2.0.0 - Complete Implementation
