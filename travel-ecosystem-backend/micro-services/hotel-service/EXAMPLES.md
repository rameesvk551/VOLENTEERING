# Hotel Aggregation Service - API Examples

## Example 1: Basic Search (First Page)

### Request
```bash
GET http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5
```

### Response (200 OK)
```json
{
  "hotels": [
    {
      "id": "providerA-4",
      "name": "budget stay hotel",
      "lat": 28.61,
      "lng": 77.23,
      "price": 45,
      "currency": "USD",
      "rating": 3.5,
      "provider": "ProviderA",
      "address": "12 Economy Street",
      "city": "Delhi",
      "country": "",
      "amenities": ["WiFi"],
      "images": ["https://example.com/img4.jpg"],
      "url": ""
    },
    {
      "id": "providerC-505",
      "name": "airport inn",
      "lat": 28.5562,
      "lng": 77.1,
      "price": 70,
      "currency": "USD",
      "rating": 3.9,
      "provider": "ProviderC",
      "address": "1 Airport Road",
      "city": "Delhi",
      "amenities": ["WiFi", "Shuttle", "Parking"],
      "images": ["https://example.com/imgC5.jpg"]
    },
    {
      "id": "providerB-103",
      "name": "comfort inn downtown",
      "lat": 28.6129,
      "lng": 77.2295,
      "price": 80,
      "currency": "USD",
      "rating": 4.1,
      "provider": "ProviderB",
      "address": "456 Central Ave",
      "city": "Delhi",
      "amenities": ["WiFi", "Parking", "Breakfast"],
      "images": ["https://example.com/imgB3.jpg"]
    },
    {
      "id": "providerC-503",
      "name": "city center express",
      "lat": 28.615,
      "lng": 77.225,
      "price": 95,
      "currency": "USD",
      "rating": 3.8,
      "provider": "ProviderC",
      "address": "77 Commerce Street",
      "city": "Delhi",
      "amenities": ["WiFi", "Breakfast"],
      "images": ["https://example.com/imgC3.jpg"]
    },
    {
      "id": "providerB-104",
      "name": "mountain view inn",
      "lat": 28.62,
      "lng": 77.21,
      "price": 120,
      "currency": "USD",
      "rating": 4.3,
      "provider": "ProviderB",
      "address": "111 Hill Station Road",
      "city": "Delhi",
      "amenities": ["WiFi", "Restaurant", "Parking"],
      "images": ["https://example.com/imgB4.jpg"]
    }
  ],
  "cursor": 5,
  "hasMore": true,
  "total": 10
}
```

**Explanation:**
- Returns first 5 hotels sorted by price (cheapest first)
- `cursor: 5` means next page starts at index 5
- `hasMore: true` indicates more results are available
- `total: 10` shows total unique hotels after deduplication

---

## Example 2: Pagination (Second Page)

### Request
```bash
GET http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=5&limit=5
```

### Response (200 OK)
```json
{
  "hotels": [
    {
      "id": "providerA-1",
      "name": "grand plaza hotel",
      "lat": 28.6139,
      "lng": 77.209,
      "price": 150,
      "currency": "USD",
      "rating": 4.5,
      "provider": "ProviderA",
      "address": "123 Main Street",
      "city": "Delhi",
      "amenities": ["WiFi", "Pool", "Restaurant"],
      "images": ["https://example.com/img1.jpg"]
    },
    {
      "id": "providerC-504",
      "name": "boutique hotel elegance",
      "lat": 28.618,
      "lng": 77.212,
      "price": 175,
      "currency": "USD",
      "rating": 4.6,
      "provider": "ProviderC",
      "address": "22 Fashion District",
      "city": "Delhi",
      "amenities": ["WiFi", "Restaurant", "Rooftop Bar", "Art Gallery"],
      "images": ["https://example.com/imgC4.jpg"]
    },
    {
      "id": "providerB-102",
      "name": "seaside resort",
      "lat": 28.605,
      "lng": 77.24,
      "price": 180,
      "currency": "USD",
      "rating": 4.7,
      "provider": "ProviderB",
      "address": "999 Beach Road",
      "city": "Delhi",
      "amenities": ["WiFi", "Beach Access", "Restaurant"],
      "images": ["https://example.com/imgB2.jpg"]
    },
    {
      "id": "providerC-501",
      "name": "luxury suites",
      "lat": 28.6145,
      "lng": 77.2088,
      "price": 245,
      "currency": "USD",
      "rating": 4.9,
      "provider": "ProviderC",
      "address": "789 Elite Blvd",
      "city": "Delhi",
      "amenities": ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Concierge"],
      "images": ["https://example.com/imgC1.jpg"]
    },
    {
      "id": "providerC-502",
      "name": "heritage palace",
      "lat": 28.6267,
      "lng": 77.2151,
      "price": 300,
      "currency": "USD",
      "rating": 4.9,
      "provider": "ProviderC",
      "address": "555 Royal Avenue",
      "city": "Delhi",
      "amenities": ["WiFi", "Pool", "Spa", "Museum", "Restaurant"],
      "images": ["https://example.com/imgC2.jpg"]
    }
  ],
  "cursor": 10,
  "hasMore": false,
  "total": 10
}
```

**Explanation:**
- Returns next 5 hotels (indices 5-9)
- `cursor: 10` would be the start of page 3 (if it existed)
- `hasMore: false` indicates this is the last page

---

## Example 3: Small Page Size

### Request
```bash
GET http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=3
```

### Response (200 OK)
```json
{
  "hotels": [
    {
      "id": "providerA-4",
      "name": "budget stay hotel",
      "lat": 28.61,
      "lng": 77.23,
      "price": 45,
      "currency": "USD",
      "rating": 3.5,
      "provider": "ProviderA"
    },
    {
      "id": "providerC-505",
      "name": "airport inn",
      "lat": 28.5562,
      "lng": 77.1,
      "price": 70,
      "currency": "USD",
      "rating": 3.9,
      "provider": "ProviderC"
    },
    {
      "id": "providerB-103",
      "name": "comfort inn downtown",
      "lat": 28.6129,
      "lng": 77.2295,
      "price": 80,
      "currency": "USD",
      "rating": 4.1,
      "provider": "ProviderB"
    }
  ],
  "cursor": 3,
  "hasMore": true,
  "total": 10
}
```

---

## Example 4: Invalid Request (Missing Parameters)

### Request
```bash
GET http://localhost:4002/search?location=Delhi
```

### Response (400 Bad Request)
```json
{
  "hotels": [],
  "cursor": 0,
  "hasMore": false,
  "total": 0
}
```

**Note:** In production, this would return a proper error message:
```json
{
  "error": "Bad Request",
  "message": "Missing required parameters: checkin, checkout, guests",
  "statusCode": 400
}
```

---

## Example 5: Health Check

### Request
```bash
GET http://localhost:4002/health
```

### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "service": "hotel-aggregation-service",
  "version": "1.0.0"
}
```

---

## Example 6: Using cURL

```bash
# Search hotels
curl -X GET "http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5" \
  -H "Accept: application/json"

# Health check
curl http://localhost:4002/health

# With pretty print (using jq)
curl -s "http://localhost:4002/search?location=Delhi&checkin=2025-12-01&checkout=2025-12-05&guests=2&cursor=0&limit=5" | jq .
```

---

## Example 7: Using JavaScript Fetch

```javascript
const searchHotels = async () => {
  const params = new URLSearchParams({
    location: 'Delhi',
    checkin: '2025-12-01',
    checkout: '2025-12-05',
    guests: '2',
    cursor: '0',
    limit: '5'
  });

  const response = await fetch(`http://localhost:4002/search?${params}`);
  const data = await response.json();
  
  console.log('Hotels:', data.hotels);
  console.log('Total:', data.total);
  console.log('Has more:', data.hasMore);
  
  return data;
};

searchHotels();
```

---

## Example 8: Infinite Scroll Pattern

```javascript
let cursor = 0;
const limit = 20;

async function loadMoreHotels() {
  const params = new URLSearchParams({
    location: 'Delhi',
    checkin: '2025-12-01',
    checkout: '2025-12-05',
    guests: '2',
    cursor: cursor.toString(),
    limit: limit.toString()
  });

  const response = await fetch(`http://localhost:4002/search?${params}`);
  const data = await response.json();
  
  // Append hotels to UI
  appendHotelsToUI(data.hotels);
  
  // Update cursor for next load
  cursor = data.cursor;
  
  // Show/hide "Load More" button
  document.getElementById('loadMore').style.display = 
    data.hasMore ? 'block' : 'none';
}

// Call on "Load More" button click
document.getElementById('loadMore').addEventListener('click', loadMoreHotels);
```

---

## Response Headers

The service includes these response headers:

```
Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=300
X-Response-Time: 156ms
```

- **Cache-Control**: Responses are cacheable for 5 minutes
- **X-Response-Time**: Shows how long the request took

---

## Provider Breakdown

The mock data includes:
- **ProviderA**: 4 hotels
- **ProviderB**: 4 hotels (2 duplicates with ProviderA)
- **ProviderC**: 5 hotels (1 duplicate with ProviderA)

**Total**: 13 hotels → **10 unique** after deduplication

### Duplicate Detection Example

These are considered duplicates:

1. **Grand Plaza Hotel**
   - ProviderA: `{name: "Grand Plaza Hotel", lat: 28.6139, lng: 77.2090, price: 150}`
   - ProviderB: `{name: "Grand Plaza Hotel", lat: 28.6139, lng: 77.2090, price: 155}`
   - → Kept: ProviderA (lower price)

2. **Comfort Inn Downtown**
   - ProviderA: `{name: "Comfort Inn Downtown", lat: 28.6129, lng: 77.2295, price: 85}`
   - ProviderB: `{name: "Comfort Inn Downtown", lat: 28.6129, lng: 77.2295, price: 80}`
   - → Kept: ProviderB (lower price)

3. **Luxury Suites**
   - ProviderA: `{name: "Luxury Suites", lat: 28.6145, lng: 77.2088, price: 250}`
   - ProviderC: `{name: "Luxury Suites", lat: 28.6145, lng: 77.2088, price: 245}`
   - → Kept: ProviderC (lower price)
