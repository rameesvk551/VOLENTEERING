# Route Optimizer API Reference

## Base URL
```
http://localhost:3007/api
```

## Authentication
No authentication required (add JWT if needed in production)

---

## Endpoints

### 1. Optimize Route

Optimize the order of visiting attractions based on distance, cost, and preferences.

**Endpoint:** `POST /optimize-route`

**Request Body:**
```typescript
{
  attractions: Array<{
    name: string;              // Attraction name
    latitude: number;          // -90 to 90
    longitude: number;         // -180 to 180
    image?: string;            // Optional image URL
    priority?: number;         // 1-10, higher = more important
    visitDuration?: number;    // Minutes to spend at this attraction
  }>;
  budget?: number;             // Maximum budget in USD
  travelType: 'budget' | 'comfort' | 'luxury' | 'speed';
  travelMethod: 'walk' | 'bike' | 'ride' | 'drive' | 'public_transport';
  startTime?: string;          // ISO timestamp (future feature)
  algorithm?: 'nearest_neighbor' | '2opt' | 'christofides' | 'genetic' | 'priority' | 'auto';
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    optimizedRoute: Attraction[];  // Sorted attractions
    totalDistance: number;          // Kilometers
    totalDuration: number;          // Minutes
    estimatedCost: number;          // USD
    algorithm: string;              // Algorithm used
    segments: Array<{
      from: Attraction;
      to: Attraction;
      distance: number;             // km
      duration: number;             // minutes
      cost: number;                 // USD
      method: string;
    }>;
  };
  stats: {
    numberOfStops: number;
    totalDistance: string;          // Formatted
    totalDuration: string;          // Formatted
    estimatedCost: string;          // Formatted
    algorithm: string;
    averageDistanceBetweenStops: string;
  };
  processingTime: string;
}
```

**Example:**
```bash
curl -X POST http://localhost:3007/api/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "attractions": [
      {
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945,
        "priority": 10,
        "visitDuration": 120
      },
      {
        "name": "Louvre",
        "latitude": 48.8606,
        "longitude": 2.3376,
        "priority": 9,
        "visitDuration": 180
      }
    ],
    "budget": 50,
    "travelType": "comfort",
    "travelMethod": "public_transport"
  }'
```

---

### 2. Compare Algorithms

Compare the results of different optimization algorithms for the same route.

**Endpoint:** `POST /compare-algorithms`

**Request Body:**
```typescript
{
  attractions: Attraction[];  // Same as optimize-route
  budget?: number;
  travelType: 'budget' | 'comfort' | 'luxury' | 'speed';
  travelMethod: 'walk' | 'bike' | 'ride' | 'drive' | 'public_transport';
}
```

**Response:**
```typescript
{
  success: boolean;
  comparison: Array<{
    algorithm: string;
    totalDistance: number;
    totalDuration: number;
    estimatedCost: number;
    numberOfStops: number;
  }>;
  details: Record<string, RouteOptimizationResult>;
}
```

---

### 3. Get Travel Methods

Get information about available travel methods.

**Endpoint:** `GET /travel-methods`

**Response:**
```typescript
{
  methods: {
    walk: { speedKmh: 5, costPerKm: 0, ideal: string };
    bike: { speedKmh: 15, costPerKm: 0, ideal: string };
    ride: { speedKmh: 40, costPerKm: 1.5, ideal: string };
    drive: { speedKmh: 50, costPerKm: 0.5, ideal: string };
    public_transport: { speedKmh: 30, costPerKm: 0.3, ideal: string };
  };
  travelTypes: {
    budget: string;
    comfort: string;
    luxury: string;
    speed: string;
  };
}
```

---

### 4. Get Algorithms

Get information about available optimization algorithms.

**Endpoint:** `GET /algorithms`

**Response:**
```typescript
{
  algorithms: {
    [algorithmName: string]: {
      description: string;
      bestFor: string;
      complexity: string;
    };
  };
}
```

---

### 5. Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Response:**
```typescript
{
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;  // seconds
  timestamp: string;  // ISO format
}
```

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request data",
  "details": [/* validation errors */]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Route optimization failed",
  "message": "Error details"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

Currently no rate limiting. Add in production if needed.

---

## Data Validation Rules

### Attractions
- **Minimum**: 2 attractions required
- **Latitude**: -90 to 90
- **Longitude**: -180 to 180
- **Priority**: 1 to 10 (optional)
- **visitDuration**: >= 0 minutes (optional)

### Budget
- Must be positive number if provided
- Currency: USD

### Travel Method
- One of: `walk`, `bike`, `ride`, `drive`, `public_transport`

### Travel Type
- One of: `budget`, `comfort`, `luxury`, `speed`

### Algorithm
- One of: `nearest_neighbor`, `2opt`, `christofides`, `genetic`, `priority`, `auto`
- Default: `auto` (automatic selection)

---

## Performance Characteristics

| Algorithm | Time Complexity | Best For | Quality |
|-----------|----------------|----------|---------|
| Nearest Neighbor | O(n²) | Quick results, any size | Good |
| 2-Opt | O(n²) per iteration | Small datasets (< 20) | Excellent |
| Christofides | O(n³) | Medium datasets (10-20) | Very Good |
| Genetic | O(n·pop·gen) | Large datasets (> 15) | Very Good |
| Priority | O(n log n + n²) | Priority-based routing | Good |

---

## Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3007/api/optimize-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attractions: [...],
    travelType: 'comfort',
    travelMethod: 'public_transport'
  })
});
const result = await response.json();
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3007/api/optimize-route',
    json={
        'attractions': [...],
        'travelType': 'comfort',
        'travelMethod': 'public_transport'
    }
)
result = response.json()
```

### cURL
```bash
curl -X POST http://localhost:3007/api/optimize-route \
  -H "Content-Type: application/json" \
  -d '{"attractions":[...],"travelType":"comfort","travelMethod":"public_transport"}'
```

---

## Troubleshooting

### Common Issues

1. **"At least 2 attractions required"**
   - Ensure attractions array has 2+ items

2. **"Invalid coordinates"**
   - Check latitude is between -90 and 90
   - Check longitude is between -180 and 180

3. **"Service unavailable"**
   - Check if service is running: `curl http://localhost:3007/api/health`
   - Check port 3007 is not in use

4. **Slow response**
   - Use `nearest_neighbor` algorithm for large datasets
   - Reduce number of attractions
   - Use `algorithm: 'auto'` for automatic selection

---

## Support

For issues or questions:
1. Check service health: `GET /health`
2. Review logs
3. Run test suite: `node test-api.js`
