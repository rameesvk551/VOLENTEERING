# Route Optimizer Microservice

Advanced route optimization service using state-of-the-art graph algorithms. **NO AI/ML** - Pure algorithmic optimization for maximum performance and reliability.

## Features

### 🚀 Advanced Algorithms
- **Nearest Neighbor**: Fast greedy algorithm O(n²)
- **2-Opt Optimization**: Local search for better routes
- **Christofides Algorithm**: Guarantees 1.5x optimal solution
- **Genetic Algorithm**: Evolutionary optimization for large datasets
- **Priority-Based**: Considers attraction importance

### 💰 Cost Optimization
- Budget-aware route planning
- Multiple travel methods (walk, bike, ride, drive, public transport)
- Travel type selection (budget, comfort, luxury, speed)

### 📊 Real-time Calculations
- Haversine distance calculation
- Time estimation based on travel method
- Cost estimation with travel type multipliers

## Installation

```bash
cd route-optimizer
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=3007
NODE_ENV=development
```

## Running the Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### 1. Optimize Route
`POST /api/optimize-route`

**Request Body:**
```json
{
  "attractions": [
    {
      "name": "Eiffel Tower",
      "latitude": 48.8584,
      "longitude": 2.2945,
      "image": "https://example.com/eiffel.jpg",
      "priority": 9,
      "visitDuration": 120
    },
    {
      "name": "Louvre Museum",
      "latitude": 48.8606,
      "longitude": 2.3376,
      "priority": 10,
      "visitDuration": 180
    }
  ],
  "budget": 50,
  "travelType": "comfort",
  "travelMethod": "public_transport",
  "algorithm": "2opt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimizedRoute": [...],
    "totalDistance": 15.5,
    "totalDuration": 420,
    "estimatedCost": 35.50,
    "algorithm": "2-Opt",
    "segments": [...]
  },
  "stats": {
    "numberOfStops": 2,
    "totalDistance": "15.50 km",
    "totalDuration": "7h 0m",
    "estimatedCost": "$35.50",
    "algorithm": "2-Opt"
  }
}
```

### 2. Compare Algorithms
`POST /api/compare-algorithms`

Compare multiple algorithms for the same route.

### 3. Get Travel Methods
`GET /api/travel-methods`

Get available travel methods and their parameters.

### 4. Get Algorithms
`GET /api/algorithms`

Get available optimization algorithms and their characteristics.

### 5. Health Check
`GET /api/health`

## Travel Methods

| Method | Speed (km/h) | Cost/km | Ideal For |
|--------|-------------|---------|-----------|
| walk | 5 | $0 | < 5 km |
| bike | 15 | $0 | < 15 km |
| ride | 40 | $1.50 | 1-100 km |
| drive | 50 | $0.50 | Long distances |
| public_transport | 30 | $0.30 | 0.5-50 km |

## Travel Types

- **budget**: Cost-optimized, 70% base cost
- **comfort**: Balanced, 100% base cost
- **luxury**: Premium, 200% base cost
- **speed**: Fast routes, 150% base cost

## Algorithm Selection Guide

| Attractions | Recommended Algorithm | Time Complexity |
|------------|----------------------|-----------------|
| 2-10 | 2-Opt | O(n²) |
| 10-20 | Christofides | O(n³) |
| 20+ | Nearest Neighbor | O(n²) |
| Any (with priorities) | Priority-Based | O(n log n + n²) |
| Large datasets | Genetic | O(n·pop·gen) |

## Architecture

```
route-optimizer/
├── src/
│   ├── index.ts                 # Main server
│   ├── algorithms/
│   │   └── tsp-solver.ts        # TSP algorithms
│   ├── services/
│   │   └── route-optimizer.service.ts
│   └── utils/
│       └── distance.ts          # Haversine calculations
├── package.json
└── tsconfig.json
```

## Technologies Used

- **Fastify**: High-performance web framework
- **TypeScript**: Type safety
- **Zod**: Runtime validation
- **Pino**: Fast logging
- **Haversine**: Geodesic distance calculations
- **Graph Algorithms**: TSP optimization

## Performance

- **Nearest Neighbor**: < 10ms for 20 attractions
- **2-Opt**: < 50ms for 20 attractions
- **Christofides**: < 200ms for 20 attractions
- **Genetic**: < 1s for 50 attractions

## Integration Example

```typescript
// From Discovery Engine
const response = await fetch('http://localhost:3007/api/optimize-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attractions: discoveredAttractions,
    budget: userBudget,
    travelType: 'comfort',
    travelMethod: 'public_transport',
    algorithm: 'auto'
  })
});

const { data } = await response.json();
```

## License

MIT
