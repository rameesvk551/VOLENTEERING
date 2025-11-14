# Route Optimizer Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  (React/Vue Frontend, Mobile App, External Services)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOVERY ENGINE (Port 3006)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/v1/optimize-route                             │  │
│  │  - Receives attraction data                              │  │
│  │  - Validates request                                     │  │
│  │  - Forwards to Route Optimizer                           │  │
│  │  - Returns optimized route                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ (Axios/Fetch)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ROUTE OPTIMIZER (Port 3007)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │               Fastify Server                            │    │
│  │  - Request validation (Zod)                            │    │
│  │  - Error handling                                       │    │
│  │  - Logging (Pino)                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Route Optimizer Service                         │    │
│  │  - Algorithm selection                                  │    │
│  │  - Budget optimization                                  │    │
│  │  - Cost calculation                                     │    │
│  │  - Route segment generation                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         TSP Algorithms                                  │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Nearest Neighbor        O(n²)               │      │    │
│  │  │  - Greedy algorithm                          │      │    │
│  │  │  - Fast, always finds a solution             │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  2-Opt Optimization      O(n²)               │      │    │
│  │  │  - Local search improvement                  │      │    │
│  │  │  - Eliminates crossing paths                 │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Christofides            O(n³)               │      │    │
│  │  │  - 1.5x optimal guarantee                    │      │    │
│  │  │  - MST + matching algorithm                  │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Genetic Algorithm       O(n·pop·gen)        │      │    │
│  │  │  - Evolutionary optimization                 │      │    │
│  │  │  - Good for large datasets                   │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Priority-Based          O(n log n + n²)     │      │    │
│  │  │  - Considers attraction priorities           │      │    │
│  │  │  - Cluster-based routing                     │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Distance Calculator                             │    │
│  │  - Haversine formula                                    │    │
│  │  - Geodesic distance (km)                               │    │
│  │  - Distance matrix generation                           │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. Client Request
   ↓
2. Discovery Engine (validates & forwards)
   ↓
3. Route Optimizer Service
   │
   ├─→ Select Algorithm (based on dataset size)
   │
   ├─→ Calculate Distances (Haversine)
   │
   ├─→ Run TSP Algorithm
   │   │
   │   ├─→ Nearest Neighbor (if > 20 attractions)
   │   ├─→ 2-Opt (if ≤ 10 attractions)
   │   ├─→ Christofides (if 10-20 attractions)
   │   └─→ Genetic (if explicitly requested)
   │
   ├─→ Calculate Route Segments
   │   │
   │   ├─→ Distance per segment
   │   ├─→ Duration (based on travel method)
   │   └─→ Cost (based on travel type)
   │
   ├─→ Check Budget Constraints
   │   │
   │   ├─→ If over budget: Try cheaper method
   │   └─→ If still over: Reduce attractions
   │
   └─→ Return Optimized Route
       ↓
4. Discovery Engine (returns to client)
   ↓
5. Client receives optimized route
```

## Component Interaction

```
┌──────────────────┐
│   Attraction     │  Input data structure
│   ─────────      │
│   - name         │
│   - latitude     │
│   - longitude    │
│   - priority     │
│   - visitDuration│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Distance Matrix  │  n×n matrix of distances
│ ─────────────    │
│  [0, 2.1, 5.3]   │
│  [2.1, 0, 3.2]   │
│  [5.3, 3.2, 0]   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  TSP Solver      │  Find optimal route
│  ──────────      │
│  Input: matrix   │
│  Output: [0,2,1] │  (indices)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Route Segments   │  Calculate details
│ ──────────────   │
│  A → B: 2.1km    │
│         $3.15     │
│         42min     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Optimized Route  │  Final result
│ ───────────────  │
│  - Route order   │
│  - Total cost    │
│  - Total time    │
│  - Total distance│
└──────────────────┘
```

## Algorithm Selection Logic

```
┌─────────────────────┐
│ Number of           │
│ Attractions?        │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
   ≤ 10        > 10
     │           │
     ▼           ▼
┌─────────┐  ┌──────────┐
│ 2-Opt   │  │ 10-20?   │
│ Best    │  └─────┬────┘
│ Quality │        │
└─────────┘   ┌────┴────┐
              │         │
             YES       NO (>20)
              │         │
              ▼         ▼
        ┌──────────┐  ┌──────────┐
        │Christof. │  │ Nearest  │
        │ Good     │  │ Neighbor │
        │ Balance  │  │ Fast     │
        └──────────┘  └──────────┘
```

## Travel Method Impact

```
Method         Speed    Cost/km   Best For
────────────────────────────────────────────
Walk           5 km/h   $0       < 5 km
Bike          15 km/h   $0       < 15 km
Public        30 km/h   $0.30    Cost-effective
Ride          40 km/h   $1.50    Convenience
Drive         50 km/h   $0.50    Long distance


Travel Type    Cost Multiplier
───────────────────────────────
Budget         0.7x
Comfort        1.0x
Luxury         2.0x
Speed          1.5x
```

## Performance Profile

```
Attractions  |  Algorithm      |  Time      |  Quality
─────────────────────────────────────────────────────────
    5        |  2-Opt          |  < 5ms     |  ⭐⭐⭐⭐⭐
   10        |  2-Opt          |  < 20ms    |  ⭐⭐⭐⭐⭐
   15        |  Christofides   |  < 50ms    |  ⭐⭐⭐⭐
   20        |  Christofides   |  < 100ms   |  ⭐⭐⭐⭐
   50        |  Nearest        |  < 50ms    |  ⭐⭐⭐
  100        |  Nearest        |  < 100ms   |  ⭐⭐⭐
```

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│             Docker Container                 │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Node.js 20 Alpine                │    │
│  │                                     │    │
│  │  ┌──────────────────────────────┐ │    │
│  │  │  Route Optimizer App         │ │    │
│  │  │  - Port 3007                 │ │    │
│  │  │  - Fastify Server            │ │    │
│  │  └──────────────────────────────┘ │    │
│  └────────────────────────────────────┘    │
│                                              │
│  Health Check: /api/health                  │
│  Restart: unless-stopped                    │
└─────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────┐
│           Application Layer                  │
│  - TypeScript (Type Safety)                 │
│  - Zod (Validation)                          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Framework Layer                    │
│  - Fastify (Web Server)                     │
│  - Pino (Logging)                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Algorithm Layer                      │
│  - Graph Algorithms (TSP)                   │
│  - Haversine (Distance)                     │
│  - Custom Optimizations                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Runtime Layer                      │
│  - Node.js 20                               │
│  - Docker (Optional)                        │
└─────────────────────────────────────────────┘
```

## Key Design Principles

1. **Microservice Architecture**
   - Standalone service
   - Single responsibility
   - Easy to scale

2. **No External Dependencies**
   - No database required
   - Stateless operation
   - Pure computation

3. **Performance Optimized**
   - Multiple algorithms
   - Smart selection
   - Efficient calculations

4. **Production Ready**
   - Error handling
   - Logging
   - Health checks
   - Docker support
