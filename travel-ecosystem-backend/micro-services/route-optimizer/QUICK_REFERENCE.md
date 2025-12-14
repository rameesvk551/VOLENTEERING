# Route Optimizer - Quick Reference Card

## 🚀 Start Service
```bash
npm run dev              # Development mode
npm start                # Production mode
.\start.ps1             # Windows PowerShell
./start.sh              # Linux/Mac
```

## 📍 Endpoints

### Base URL: `http://localhost:3007/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/optimize-route` | POST | Optimize route |
| `/insert-attraction` | POST | Add attraction to existing route |
| `/compare-algorithms` | POST | Compare algorithms |
| `/travel-methods` | GET | Get transport info |
| `/algorithms` | GET | Get algorithm info |
| `/health` | GET | Health check |

## 🎯 Algorithms

| Algorithm | Speed | Quality | Best For |
|-----------|-------|---------|----------|
| `nearest_neighbor` | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Large datasets |
| `advanced` | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Small-medium (default ≤10) |
| `2opt` | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | < 20 attractions |
| `christofides` | ⚡⚡ | ⭐⭐⭐⭐ | 10-20 attractions |
| `simulated_annealing` | ⚡ | ⭐⭐⭐⭐⭐ | High quality needed |
| `genetic` | ⚡ | ⭐⭐⭐⭐ | > 20 attractions |
| `priority` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Priority-based |
| `time_windows` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Time constraints |
| `multi_modal` | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Mixed transport |
| `auto` | Adaptive | ⭐⭐⭐⭐ | Let system choose |

## 🚶 Travel Methods

| Method | Speed | Cost/km | Ideal For |
|--------|-------|---------|-----------|
| `walk` | 5 km/h | $0 | < 2 km |
| `bike` | 15 km/h | $0 | 2-10 km |
| `ride` | 40 km/h | $1.50 | Convenience |
| `drive` | 50 km/h | $0.50 | Long distances |
| `public_transport` | 30 km/h | $0.30 | Cost-effective |

## 💰 Travel Types

| Type | Cost Multiplier | Description |
|------|----------------|-------------|
| `budget` | 0.7x | Cost-optimized |
| `comfort` | 1.0x | Balanced |
| `luxury` | 2.0x | Premium |
| `speed` | 1.5x | Fastest routes |

## 📝 Request Format

### Basic Optimization
```json
{
  "attractions": [
    {
      "name": "Place Name",
      "latitude": 48.8584,
      "longitude": 2.2945,
      "priority": 8,
      "visitDuration": 120
    }
  ],
  "travelType": "comfort",
  "travelMethod": "public_transport",
  "algorithm": "auto"
}
```

### With Time Windows
```json
{
  "attractions": [
    {
      "name": "Museum",
      "latitude": 48.8606,
      "longitude": 2.3376,
      "timeWindow": {
        "open": "09:00",
        "close": "18:00"
      },
      "visitDuration": 180
    }
  ],
  "considerTimeWindows": true,
  "startTime": "2024-01-15T08:00:00Z",
  "travelType": "comfort",
  "travelMethod": "public_transport"
}
```

### Multi-Modal
```json
{
  "attractions": [...],
  "travelType": "budget",
  "travelMethod": "public_transport",
  "multiModal": true
}
```

### Real-Time Insertion
```json
{
  "currentRoute": [...existing attractions...],
  "newAttraction": {
    "name": "New Place",
    "latitude": 48.8738,
    "longitude": 2.2950
  },
  "travelType": "comfort",
  "travelMethod": "public_transport"
}
```

## 🧪 Testing

```bash
# Basic tests
node test-api.js

# Advanced features
node test-advanced-features.js

# Health check
curl http://localhost:3007/api/health
```

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "optimizedRoute": [...attractions in order...],
    "totalDistance": 15.5,
    "totalDuration": 420,
    "estimatedCost": 35.50,
    "algorithm": "Advanced TSP (NN + 2-Opt)",
    "segments": [
      {
        "from": {...},
        "to": {...},
        "distance": 5.2,
        "duration": 140,
        "cost": 12.50,
        "method": "public_transport"
      }
    ]
  },
  "stats": {
    "numberOfStops": 3,
    "totalDistance": "15.50 km",
    "totalDuration": "7h 0m",
    "estimatedCost": "$35.50",
    "algorithm": "Advanced TSP",
    "averageDistanceBetweenStops": "7.75 km"
  },
  "processingTime": "15ms"
}
```

## ⚡ Performance Tips

1. **Small datasets (≤10)**: Use `advanced` or `2opt`
2. **Medium (10-20)**: Use `christofides` or `simulated_annealing`
3. **Large (>20)**: Use `nearest_neighbor`
4. **Time constraints**: Enable `considerTimeWindows`
5. **Cost savings**: Enable `multiModal` with `budget` type
6. **Real-time updates**: Use `/insert-attraction` endpoint

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Service not starting | Check port 3007 availability |
| Slow optimization | Use faster algorithm or reduce attractions |
| Over budget | Enable `multiModal` or use `budget` type |
| Invalid coordinates | Check lat (-90 to 90), lng (-180 to 180) |
| Missing attractions | Check `considerTimeWindows` settings |

## 📚 Documentation

- `README.md` - Overview
- `ADVANCED_FEATURES.md` - New features guide
- `API_REFERENCE.md` - Complete API docs
- `INTEGRATION_GUIDE.md` - Integration help
- `ENHANCEMENT_SUMMARY.md` - What's new

## 🔗 Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3007/api/optimize-route', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attractions: myAttractions,
    travelType: 'comfort',
    travelMethod: 'public_transport',
    algorithm: 'auto'
  })
});
const result = await response.json();
```

### cURL
```bash
curl -X POST http://localhost:3007/api/optimize-route \
  -H "Content-Type: application/json" \
  -d '{"attractions":[...],"travelType":"comfort","travelMethod":"public_transport"}'
```

---

## ✨ Key Features

✅ 9 optimization algorithms  
✅ 5 travel methods  
✅ 4 travel types  
✅ Time windows support  
✅ Multi-modal transport  
✅ Real-time updates  
✅ Budget optimization  
✅ Priority-based routing  
✅ Production-ready  
✅ No AI/ML - Pure algorithms  

**Service Version:** 1.0.0  
**Port:** 3007  
**Tech Stack:** TypeScript, Fastify, Graph Algorithms
