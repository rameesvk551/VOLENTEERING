# Hotel Discovery & Booking Service - API Documentation

## Service Boundary

### ✅ This Service Is Responsible For:
- Hotel search and discovery (meta-search)
- Hotel listing and details
- Booking decision logic (internal vs external)
- Reservation orchestration (internal hotels only)
- Event emission for downstream services
- Caching and performance optimization
- Circuit breaking for external API failures

### ❌ This Service Is NOT Responsible For:
- User authentication (handled by Auth Service)
- Payment processing (handled by Payment Service)
- Email notifications (handled by Notification Service)
- Hotel CRUD operations (handled by Hotel Owner Service)

## Architecture

### Meta-Search Flow
```
User Request
    ↓
Cache Check (5min TTL)
    ↓
[Internal DB] + [External API] (Parallel)
    ↓
Normalization & Merge
    ↓
Deduplication
    ↓
Filtering & Ranking
    ↓
Response + Cache Update
```

### Booking Flow
```
User Selects Hotel
    ↓
Booking Decision Engine
    ├─→ INTERNAL: Create Reservation → Emit Events → Payment Flow
    └─→ EXTERNAL: Return Redirect URL
```

## Event Architecture

### Published Events

#### 1. RESERVATION_CREATED
**Topic:** `hotel.reservation.created`
**When:** New reservation is created (status: PENDING)
**Consumers:** Payment Service, Notification Service, Analytics Service

```json
{
  "eventType": "RESERVATION_CREATED",
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "hotelId": "hotel-internal-001",
  "timestamp": "2024-12-13T10:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "hotelId": "hotel-internal-001",
    "roomId": "room-001",
    "checkInDate": "2024-12-20",
    "checkOutDate": "2024-12-23",
    "guests": 2,
    "totalAmount": 897.00,
    "currency": "USD",
    "status": "PENDING",
    "guestDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "createdAt": "2024-12-13T10:30:00.000Z",
    "updatedAt": "2024-12-13T10:30:00.000Z"
  }
}
```

#### 2. RESERVATION_CONFIRMED
**Topic:** `hotel.reservation.confirmed`
**When:** Reservation is confirmed (after payment success)
**Consumers:** Notification Service, Analytics Service

```json
{
  "eventType": "RESERVATION_CONFIRMED",
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "hotelId": "hotel-internal-001",
  "timestamp": "2024-12-13T10:35:00.000Z",
  "data": {
    /* full reservation object with status: "CONFIRMED" */
  }
}
```

#### 3. RESERVATION_CANCELLED
**Topic:** `hotel.reservation.cancelled`
**When:** User or system cancels a reservation
**Consumers:** Payment Service (refund), Notification Service, Analytics Service

```json
{
  "eventType": "RESERVATION_CANCELLED",
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "hotelId": "hotel-internal-001",
  "timestamp": "2024-12-13T11:00:00.000Z",
  "data": {
    /* full reservation object with status: "CANCELLED" */
  }
}
```

#### 4. PAYMENT_REQUESTED
**Topic:** `payment.requests`
**When:** Reservation created, payment needed
**Consumer:** Payment Service

```json
{
  "eventType": "PAYMENT_REQUESTED",
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "amount": 897.00,
  "currency": "USD",
  "timestamp": "2024-12-13T10:30:00.000Z"
}
```

## API Endpoints

### Public Endpoints (No Auth Required)

#### GET /health
Health check with circuit breaker status.

**Response:**
```json
{
  "status": "ok",
  "service": "hotel-discovery-booking-service",
  "timestamp": "2024-12-13T10:00:00.000Z",
  "circuitBreaker": "CLOSED"
}
```

#### GET /api/hotels/search
Unified meta-search across internal and external sources.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location or city | string | Yes | Search location |
| country | string | No | Country filter |
| checkInDate | ISO date | No | Check-in date |
| checkOutDate | ISO date | No | Check-out date |
| guests | number | No | Number of guests |
| rooms | number | No | Number of rooms |
| minPrice | number | No | Minimum price |
| maxPrice | number | No | Maximum price |
| minRating | number | No | Minimum rating (0-5) |
| starRating | number | No | Star rating (1-5) |
| amenities | string | No | Comma-separated amenities |
| limit | number | No | Results per page (default: 20) |
| offset | number | No | Pagination offset (default: 0) |

**Example Request:**
```
GET /api/hotels/search?location=New%20York&checkInDate=2024-12-20&checkOutDate=2024-12-23&guests=2&minRating=4&amenities=WiFi,Pool&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "hotel-internal-001",
        "name": "The Grand Plaza Hotel",
        "description": "Luxury hotel in the heart of the city",
        "address": "123 Main Street, Downtown",
        "city": "New York",
        "country": "USA",
        "coordinates": {
          "lat": 40.7589,
          "lng": -73.9851
        },
        "rating": 4.8,
        "starRating": 5,
        "reviewCount": 2345,
        "price": {
          "amount": 299,
          "currency": "USD",
          "perNight": true
        },
        "images": [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
        ],
        "amenities": ["WiFi", "Pool", "Spa", "Gym"],
        "roomTypes": ["Single", "Double", "Suite"],
        "url": "https://grandplaza.example.com",
        "availability": true,
        "distanceFromCenter": 0.5,
        "source": "INTERNAL"
      }
    ],
    "total": 45,
    "offset": 0,
    "limit": 10
  },
  "cached": false
}
```

#### GET /api/hotels/:hotelId
Get detailed information about a specific hotel.

**Response:**
```json
{
  "success": true,
  "data": {
    "hotel": {
      /* full hotel object */
    }
  },
  "cached": false
}
```

#### GET /api/hotels/:hotelId/rooms
Get available rooms for a hotel.

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room-001",
        "hotelId": "hotel-internal-001",
        "type": "DELUXE",
        "name": "Deluxe King Room",
        "description": "Spacious room with king bed and city view",
        "capacity": 2,
        "price": {
          "amount": 299,
          "currency": "USD",
          "perNight": true
        },
        "amenities": ["King Bed", "WiFi", "Mini Bar"],
        "images": ["https://images.unsplash.com/..."],
        "available": true,
        "totalRooms": 20
      }
    ]
  }
}
```

#### GET /api/hotels/:hotelId/booking-decision
Get booking decision (internal vs external).

**Response for Internal Hotel:**
```json
{
  "success": true,
  "data": {
    "decision": {
      "canBookInternally": true,
      "message": "This hotel can be booked directly through our platform",
      "hotelSource": "INTERNAL"
    }
  }
}
```

**Response for External Hotel:**
```json
{
  "success": true,
  "data": {
    "decision": {
      "canBookInternally": false,
      "redirectUrl": "https://booking.com/hotel/12345",
      "message": "This hotel requires booking through our partner site",
      "hotelSource": "EXTERNAL"
    }
  }
}
```

### Protected Endpoints (Require Authentication)

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### POST /api/reservations
Create a new reservation (internal hotels only).

**Request Body:**
```json
{
  "hotelId": "hotel-internal-001",
  "roomId": "room-001",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23",
  "guests": 2,
  "guestDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "hotelId": "hotel-internal-001",
      "roomId": "room-001",
      "checkInDate": "2024-12-20",
      "checkOutDate": "2024-12-23",
      "guests": 2,
      "totalAmount": 897.00,
      "currency": "USD",
      "status": "PENDING",
      "guestDetails": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "createdAt": "2024-12-13T10:30:00.000Z",
      "updatedAt": "2024-12-13T10:30:00.000Z"
    }
  },
  "message": "Reservation created successfully"
}
```

**Error Responses:**
```json
// External hotel
{
  "success": false,
  "error": "Failed to create reservation",
  "message": "This hotel cannot be booked internally. Please use the external booking URL."
}

// Room not available
{
  "success": false,
  "error": "Failed to create reservation",
  "message": "Room is not available for the selected dates"
}
```

#### GET /api/reservations
Get all reservations for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        /* reservation objects */
      }
    ]
  }
}
```

#### GET /api/reservations/:reservationId
Get specific reservation details.

**Response:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      /* reservation object */
    }
  }
}
```

#### POST /api/reservations/:reservationId/confirm
Confirm a pending reservation.

**Response:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      /* reservation with status: "CONFIRMED" */
    }
  },
  "message": "Reservation confirmed successfully"
}
```

#### POST /api/reservations/:reservationId/cancel
Cancel a reservation.

**Response:**
```json
{
  "success": true,
  "data": {
    "reservation": {
      /* reservation with status: "CANCELLED" */
    }
  },
  "message": "Reservation cancelled successfully"
}
```

## Caching Strategy

### Cache Keys
- **Search Results:** `search:{location}:{country}:{dates}:{filters}:{limit}:{offset}`
- **Hotel Details:** `hotel:{hotelId}`

### TTL (Time To Live)
- Search Results: 300 seconds (5 minutes)
- Hotel Details: 600 seconds (10 minutes)

### Cache Invalidation
- Automatic expiration based on TTL
- Manual invalidation on reservation updates

## Circuit Breaker

Protects against external API failures.

### Configuration
- **Failure Threshold:** 3 consecutive failures
- **Success Threshold:** 2 consecutive successes to close
- **Timeout:** 30 seconds before retry
- **Fallback:** Internal hotel catalog

### States
- **CLOSED:** Normal operation
- **OPEN:** Service degraded, using fallback
- **HALF_OPEN:** Testing if service recovered

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Configurable:** `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (new reservation)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (downstream service down)

## Best Practices

### For Frontend Developers
1. **Always check booking decision** before showing booking UI
2. **Handle both internal and external booking flows**
3. **Implement exponential backoff** for failed requests
4. **Cache search results** on client side (short TTL)
5. **Show loading states** for async operations

### For Backend Developers
1. **Use circuit breaker** for all external API calls
2. **Emit events** for all state changes
3. **Log all errors** with context
4. **Validate inputs** thoroughly
5. **Use transactions** for critical operations (production DB)

## Integration Examples

### Search Hotels
```javascript
const response = await fetch(
  '/api/hotels/search?location=Paris&checkInDate=2024-12-20&checkOutDate=2024-12-23&guests=2',
  {
    headers: {
      'Authorization': `Bearer ${token}` // optional for search
    }
  }
);
const { data } = await response.json();
console.log(data.hotels);
```

### Create Reservation
```javascript
const response = await fetch('/api/reservations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // required
  },
  body: JSON.stringify({
    hotelId: 'hotel-internal-001',
    roomId: 'room-001',
    checkInDate: '2024-12-20',
    checkOutDate: '2024-12-23',
    guests: 2,
    guestDetails: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    }
  })
});

if (response.ok) {
  const { data } = await response.json();
  console.log('Reservation created:', data.reservation.id);
}
```

## Future Extensibility

### Planned Features
1. **Advanced Filters:** More search criteria (room features, accessibility)
2. **Price Alerts:** Subscribe to price drops
3. **Recommendations:** AI-powered hotel recommendations
4. **Multi-room Booking:** Book multiple rooms in one transaction
5. **Loyalty Program:** Integration with rewards system
6. **Real-time Availability:** WebSocket updates for availability changes

### Integration Points
- **Payment Service:** Handles payment processing
- **Notification Service:** Sends emails/SMS
- **Analytics Service:** Tracks user behavior
- **Review Service:** Manages hotel reviews
- **Image Service:** Optimizes and serves images
