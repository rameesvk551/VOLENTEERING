# 🚍 Transport Data Quality Guide

## ⚠️ Current Data Trustworthiness Issues

Your route optimization system currently produces **UNREALISTIC** routes because:

### 1. **No GTFS Data Loaded**
```env
GTFS_FEED_URLS=          # ← EMPTY! No transit schedules loaded
GTFS_RT_VEHICLE_POSITIONS_URL=  # ← EMPTY! No real-time tracking
```

### 2. **Fallback Creates Impossible Routes**
When GTFS/Google fails, the system calculates routes using:
- Haversine (straight-line) distance
- Fixed walking speed of 1.4 m/s
- **No validation** that distances are realistic

This produces absurd outputs like:
- "Walk 999 km in 1853 minutes" 
- "Walk 325 km between attractions"

### 3. **"Real-time" Label is Misleading**
The "✅ Real-time" label appears but:
- No GTFS-RT feeds are configured
- It's based on Google Directions `departure_time=now`
- Mixed with fabricated fallback data

---

## ✅ How to Get Trustworthy Data

### Option 1: Use Google Directions API Only (Easiest)

Your Google API key is already configured. The system will:
- Use real transit routes from Google
- Get actual bus/metro operators
- Calculate realistic times and distances

**Limitation**: Cannot work offline, requires API quota.

### Option 2: Load Real GTFS Data (Best for Production)

#### Free Indian GTFS Sources:

| City | Source | Status |
|------|--------|--------|
| **Delhi Metro** | [OTD Delhi](https://otd.delhi.gov.in/gtfs/) | ✅ Available |
| **Kochi Metro** | Contact KMRL | 📧 Request needed |
| **Bangalore BMTC** | [OpenCity](https://data.opencity.in/) | ⚠️ Partial |
| **Chennai MTC** | Smart city portal | ⚠️ Limited |
| **Pune PMPML** | Published GTFS | ✅ Available |
| **Hyderabad Metro** | L&T/Telangana data | 📧 Request needed |
| **Ahmedabad BRTS** | AMC Open Data | ✅ Available |

#### Global GTFS Aggregators:
- https://transitfeeds.com
- https://openmobilitydata.org
- https://transit.land (free tier: 1M requests/month)

#### To Configure:
```env
# In transportation-service/.env
GTFS_FEED_URLS=https://otd.delhi.gov.in/gtfs/delhi_metro.zip
```

Then restart the service - it will import the GTFS data.

### Option 3: Combine GTFS + OpenStreetMap (Most Comprehensive)

For a Google Transit-like solution without paying:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Tech Stack                      │
├─────────────────────────────────────────────────────────┤
│ GTFS (routes, stops, schedules)                         │
│    ↓                                                    │
│ PostgreSQL + PostGIS (storage)                          │
│    ↓                                                    │
│ RAPTOR Algorithm (routing) ← Already implemented!       │
│    ↓                                                    │
│ OpenStreetMap (road network) via OSRM                   │
│    ↓                                                    │
│ Multi-modal Router (combines all) ← Already implemented!│
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Validation Layer (Now Implemented)

I've added validation to reject impossible routes:

### In `multi-modal-router.service.ts`:
```typescript
// Maximum realistic distances:
walking: 5 km
cycling: 30 km  
escooter: 20 km
driving: 2000 km/day
transit: 500 km
```

### In `route-optimizer-v2.service.ts`:
```typescript
// Speed sanity checks:
walking: 3-7 km/h
cycling: 10-30 km/h
driving: 20-120 km/h
transit: 15-100 km/h
bus: 15-80 km/h
metro: 25-90 km/h
train: 40-200 km/h
```

Routes exceeding these limits are now flagged with warnings.

---

## 🔧 Quick Fix Checklist

### Minimum for Realistic Data:

- [ ] **Step 1**: Ensure Google Maps API key is valid
  ```env
  GOOGLE_MAPS_API_KEY=your_valid_key
  ```

- [ ] **Step 2**: Test Google API is working
  ```bash
  curl "https://maps.googleapis.com/maps/api/directions/json?origin=Delhi&destination=Mumbai&mode=transit&key=YOUR_KEY"
  ```

- [ ] **Step 3**: Check transportation service is running
  ```bash
  curl http://localhost:3008/health
  ```

- [ ] **Step 4**: Verify route-optimizer connects to transportation service
  ```env
  # In route-optimizer/.env
  TRANSPORT_SERVICE_URL=http://localhost:3008
  ```

### For Production-Grade Data:

- [ ] **Step 5**: Download GTFS for your target cities
- [ ] **Step 6**: Import GTFS data (automatic on startup)
- [ ] **Step 7**: Set up GTFS-RT feeds if available
- [ ] **Step 8**: Configure OpenTripPlanner for complex routing

---

## 📊 How to Identify Bad Data

### Red Flags in Route Output:

| Issue | Indicates |
|-------|-----------|
| Walking > 10 km | Fallback route, not real |
| "haversine-fallback" provider | No real transit data |
| Travel time = distance/1.4 exactly | Mathematical fallback |
| Same bus company for 500+ km | Stitched/fake route |
| "✅ Real-time" with GTFS_RT empty | Misleading label |

### Good Signs:
| Feature | Indicates |
|---------|-----------|
| "google-directions" provider | Real API data |
| "gtfs-raptor" provider | Real GTFS data |
| Specific bus numbers (720, A-8) | Real routes |
| Departure times (10:45 AM) | Real schedules |
| Multiple realistic alternatives | Working system |

---

## 🚀 Recommended Architecture

```
User Request
     ↓
┌────────────────────────────────────────┐
│         Route Optimizer V2             │
│  (TSP, constraints, optimization)      │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│      Transportation Service            │
│                                        │
│  ┌──────────┐  ┌──────────┐           │
│  │  GTFS    │  │ Google   │           │
│  │  RAPTOR  │  │ Fallback │           │
│  └────┬─────┘  └────┬─────┘           │
│       ↓             ↓                  │
│  ┌──────────────────────────┐         │
│  │   Multi-Modal Router     │         │
│  │   (merges + validates)   │         │
│  └──────────────────────────┘         │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│        Validation Layer                │
│  - Distance limits                     │
│  - Speed sanity checks                 │
│  - Mode appropriateness                │
│  - Flag unrealistic routes             │
└────────────────────────────────────────┘
     ↓
Trustworthy Route Response
```

---

## 📚 Further Reading

- [GTFS Specification](https://gtfs.org/schedule/reference/)
- [GTFS-RT Specification](https://gtfs.org/realtime/reference/)
- [OpenTripPlanner](https://www.opentripplanner.org/)
- [OSRM Documentation](http://project-osrm.org/)
- [Google Directions API](https://developers.google.com/maps/documentation/directions/)

---

*Document created: December 4, 2025*
*This guide explains why route data may be untrustworthy and how to fix it.*
