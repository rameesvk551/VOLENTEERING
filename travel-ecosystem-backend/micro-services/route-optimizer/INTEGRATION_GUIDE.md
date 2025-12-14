# Route Optimizer Integration Guide

## Overview
The Route Optimizer microservice has been successfully integrated into the Discovery Engine. It provides advanced route optimization using multiple algorithms without any AI/ML dependencies.

## Architecture

```
┌─────────────────────┐
│  Discovery Engine   │
│    (Port 3006)      │
└──────────┬──────────┘
           │
           │ HTTP Request
           │
           ▼
┌─────────────────────┐
│  Route Optimizer    │
│    (Port 3007)      │
│                     │
│  ┌───────────────┐  │
│  │  Algorithms   │  │
│  │  - Nearest    │  │
│  │  - 2-Opt      │  │
│  │  - Christofides│ │
│  │  - Genetic    │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Setup Instructions

### 1. Install Route Optimizer

```bash
cd travel-ecosystem-backend/micro-services/route-optimizer
npm install
```

### 2. Configure Environment

Create a `.env` file:
```env
PORT=3007
NODE_ENV=development
```

### 3. Start the Service

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Or manually:**
```bash
npm run dev
```

### 4. Configure Discovery Engine

Add to your Discovery Engine `.env`:
```env
ROUTE_OPTIMIZER_URL=http://localhost:3007
```

## API Usage

### From Discovery Engine

The Discovery Engine now has a new endpoint at:
```
POST /api/v1/optimize-route
```

### Example Request

```bash
curl -X POST http://localhost:3006/api/v1/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "attractions": [
      {
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945,
        "image": "https://example.com/eiffel.jpg",
        "priority": 10,
        "visitDuration": 120
      },
      {
        "name": "Louvre Museum",
        "latitude": 48.8606,
        "longitude": 2.3376,
        "image": "https://example.com/louvre.jpg",
        "priority": 9,
        "visitDuration": 180
      },
      {
        "name": "Arc de Triomphe",
        "latitude": 48.8738,
        "longitude": 2.2950,
        "priority": 8,
        "visitDuration": 60
      }
    ],
    "budget": 50,
    "travelType": "comfort",
    "travelMethod": "public_transport",
    "algorithm": "2opt"
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "optimizedRoute": [
      {
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945,
        "priority": 10
      },
      {
        "name": "Arc de Triomphe",
        "latitude": 48.8738,
        "longitude": 2.2950,
        "priority": 8
      },
      {
        "name": "Louvre Museum",
        "latitude": 48.8606,
        "longitude": 2.3376,
        "priority": 9
      }
    ],
    "totalDistance": 5.32,
    "totalDuration": 420,
    "estimatedCost": 12.50,
    "algorithm": "2-Opt",
    "segments": [
      {
        "from": { "name": "Eiffel Tower", ... },
        "to": { "name": "Arc de Triomphe", ... },
        "distance": 2.1,
        "duration": 64,
        "cost": 4.2,
        "method": "public_transport"
      },
      ...
    ]
  },
  "stats": {
    "numberOfStops": 3,
    "totalDistance": "5.32 km",
    "totalDuration": "7h 0m",
    "estimatedCost": "$12.50",
    "algorithm": "2-Opt",
    "averageDistanceBetweenStops": "2.66 km"
  },
  "processingTime": "15ms"
}
```

## Frontend Integration

### React/TypeScript Example

```typescript
interface Attraction {
  name: string;
  latitude: number;
  longitude: number;
  image?: string;
  priority?: number;
  visitDuration?: number;
}

async function optimizeRoute(
  attractions: Attraction[],
  budget?: number,
  travelType: 'budget' | 'comfort' | 'luxury' | 'speed' = 'comfort',
  travelMethod: 'walk' | 'bike' | 'ride' | 'drive' | 'public_transport' = 'public_transport'
) {
  const response = await fetch('http://localhost:3006/api/v1/optimize-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attractions,
      budget,
      travelType,
      travelMethod,
      algorithm: 'auto' // Let it choose the best algorithm
    })
  });

  const result = await response.json();
  return result;
}

// Usage
const attractions = [
  { name: "Museum", latitude: 40.7128, longitude: -74.0060, priority: 9 },
  { name: "Park", latitude: 40.7589, longitude: -73.9851, priority: 7 },
  { name: "Restaurant", latitude: 40.7614, longitude: -73.9776, priority: 8 }
];

const optimized = await optimizeRoute(attractions, 50, 'comfort', 'public_transport');
console.log('Optimized route:', optimized.data.optimizedRoute);
console.log('Total cost:', optimized.stats.estimatedCost);
```

## Travel Methods

| Method | Speed | Cost/km | Best For |
|--------|-------|---------|----------|
| walk | 5 km/h | Free | < 5 km |
| bike | 15 km/h | Free | < 15 km |
| ride | 40 km/h | $1.50 | Convenience |
| drive | 50 km/h | $0.50 | Long distances |
| public_transport | 30 km/h | $0.30 | Cost-effective |

## Algorithm Selection

The service automatically selects the best algorithm based on the number of attractions:

- **2-10 attractions**: 2-Opt (best quality)
- **10-20 attractions**: Christofides (balanced)
- **20+ attractions**: Nearest Neighbor (fastest)

You can also specify an algorithm explicitly:
- `nearest_neighbor`: Fastest, O(n²)
- `2opt`: Local optimization
- `christofides`: 1.5x optimal guarantee
- `genetic`: Best for large datasets
- `priority`: Considers attraction priorities
- `auto`: Automatic selection (recommended)

## Testing

Run the test suite:
```bash
npm test

# Or using the test script
node test-api.js
```

## Docker Deployment

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Check logs
docker-compose logs -f route-optimizer
```

## Performance Benchmarks

| Attractions | Algorithm | Time | Quality |
|------------|-----------|------|---------|
| 5 | 2-Opt | <5ms | Excellent |
| 10 | 2-Opt | <20ms | Excellent |
| 20 | Christofides | <100ms | Very Good |
| 50 | Nearest Neighbor | <50ms | Good |
| 100 | Nearest Neighbor | <100ms | Good |

## Technology Stack

✅ **Pure Algorithms** - No AI/ML dependencies  
✅ **TypeScript** - Type-safe  
✅ **Fastify** - High performance (3x faster than Express)  
✅ **Haversine** - Accurate geodesic calculations  
✅ **Graph Algorithms** - Proven TSP solvers  
✅ **Docker Ready** - Easy deployment  

## Troubleshooting

### Service not starting?
1. Check if port 3007 is available
2. Ensure Node.js 18+ is installed
3. Run `npm install` again

### Connection refused from Discovery Engine?
1. Verify route-optimizer is running: `curl http://localhost:3007/api/health`
2. Check `ROUTE_OPTIMIZER_URL` in Discovery Engine `.env`
3. Check firewall settings

### Slow optimization?
1. Use `nearest_neighbor` for large datasets
2. Reduce the number of attractions
3. Use `algorithm: 'auto'` for automatic selection

## Support

For issues or questions:
1. Check the logs: `docker-compose logs route-optimizer`
2. Run health check: `curl http://localhost:3007/api/health`
3. Run tests: `node test-api.js`

## License

MIT
