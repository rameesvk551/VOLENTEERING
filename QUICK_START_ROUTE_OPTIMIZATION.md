# 🚀 Quick Start - Route Optimization

## Prerequisites

- Node.js 18+
- npm or pnpm
- API Gateway running (port 4000)
- Route Optimizer service running (port 4010)

---

## 🏃‍♂️ Start in 3 Commands

### 1. Start Backend Services

```powershell
# Terminal 1: API Gateway
cd travel-ecosystem-backend\api-gateway
npm run dev

# Terminal 2: Route Optimizer
cd travel-ecosystem-backend\micro-services\route-optimizer
npm run dev
```

Wait for:
```
✅ API Gateway running on port 4000
✅ Route Optimizer Service running on port 4010
```

### 2. Start Frontend

```powershell
# Terminal 3: Trip Planner
cd travel-ecosystem\apps\trip-planner
npm run dev
```

Wait for:
```
✅ Local: http://localhost:5173
```

### 3. Test the Flow

1. Open http://localhost:5173
2. Search for attractions (e.g., "Singapore attractions")
3. **Select 2+ attractions** (click checkbox pills on cards)
4. **Click the blue FAB** (floating button bottom-right)
5. **Select travel types** (e.g., Walking + Public Transport)
6. Click **"Optimize Route"**
7. See result in alert!

---

## 🧪 Test API Directly

```powershell
# Quick test (no frontend needed)
cd travel-ecosystem-backend
node ..\test-route-optimization.js
```

Expected output:
```
✅ SUCCESS!

🗺️  Optimized Route Order:
  1. Merlion Park (7/10 priority)
  2. Marina Bay Sands (8/10 priority)
  3. Gardens by the Bay (9/10 priority)
  4. Clarke Quay (6/10 priority)

📏 Total Distance: 4.52 km
⏰ Estimated Duration: 85 minutes
```

---

## 🔍 Debug Checklist

### Frontend not sending request?
- Open browser DevTools → Console
- Check for `📤 Sending optimization request:` log
- Verify `selectedAttractions` count > 0

### Backend not responding?
```powershell
# Check if services are running
netstat -ano | findstr :4000  # API Gateway
netstat -ano | findstr :4010  # Route Optimizer
```

### CORS error?
Edit `api-gateway/.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

---

## 📊 Expected Logs

### Frontend Console
```
Deselected: p1, Total selected: 2
Selected: p2, Total selected: 3
Planning trip with selected attractions: ['p1', 'p2', 'p3']
📤 Sending optimization request: { places: [...], constraints: {...} }
✅ Route optimized successfully: { jobId: '...', optimizedOrder: [...] }
```

### API Gateway Log
```
Proxying to Route Optimizer: POST /api/v1/optimize-route
Route Optimizer Response: 200
```

### Route Optimizer Log
```
Route optimization request received { placesCount: 3, travelTypes: ['WALKING'] }
📊 Building distance matrix...
🧮 Running TSP optimization...
⚖️ Applying constraints...
Route optimization completed { jobId: '...', stopsCount: 3, estimatedDuration: 85 }
```

---

## 🎯 What to Look For

### ✅ Success Indicators
- Blue FAB appears when attractions selected
- Modal opens smoothly
- "Optimize Route" button works
- Alert shows: "Route optimized! X stops in optimal order"
- No red errors in console

### ❌ Common Issues

| Issue | Solution |
|-------|----------|
| FAB doesn't appear | Check `selectedAttractions.size > 0` in console |
| Modal doesn't open | Verify `isModalOpen` state |
| API call fails | Check backend services are running |
| CORS error | Add frontend URL to CORS_ORIGIN |
| TypeScript errors | Run `npm install` |

---

## 📂 File Locations

| Component | File Path |
|-----------|-----------|
| Frontend API | `apps/trip-planner/src/api/routeOptimizer.api.ts` |
| Frontend Hook | `apps/trip-planner/src/hooks/useRouteOptimizer.ts` |
| Frontend Component | `apps/trip-planner/src/components/discovery/VirtualizedAttractionFeed.tsx` |
| Backend Handler | `route-optimizer/src/handlers/optimize-route.handler.ts` |
| Backend Service | `route-optimizer/src/services/route-optimizer-v2.service.ts` |

---

## 🔧 Troubleshooting

### Port already in use
```powershell
# Find process using port 4000
netstat -ano | findstr :4000
# Kill process (replace PID)
taskkill /F /PID <PID>
```

### Services won't start
```powershell
# Reinstall dependencies
cd travel-ecosystem-backend\micro-services\route-optimizer
rm -rf node_modules
npm install
```

### Frontend build errors
```powershell
cd travel-ecosystem\apps\trip-planner
rm -rf node_modules
npm install
```

---

## 🎉 Success!

When everything works, you should see:

1. ✅ Attractions selectable with checkboxes
2. ✅ FAB appears with count badge
3. ✅ Modal opens with options
4. ✅ Request sent to backend
5. ✅ Optimized route returned
6. ✅ Result displayed to user

**Time to complete:** ~30 seconds  
**API response time:** ~1 second  
**User experience:** Smooth ✨

---

## 📚 Full Documentation

For detailed information, see:
- `ROUTE_OPTIMIZATION_IMPLEMENTATION.md` - Complete technical guide
- `IMPLEMENTATION_SUMMARY_ROUTE_OPTIMIZATION.md` - What was built
- `test-route-optimization.js` - API test script

---

## 🚀 Ready to Go!

You now have a **fully functional** route optimization system!

Next steps (optional):
1. Add transport options per leg
2. Add polyline generation
3. Add PDF export

But for now, **the core flow works perfectly!** 🎯
