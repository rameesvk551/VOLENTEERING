# Hotel Discovery & Booking Service

A production-ready microservice for hotel search, discovery, and booking following enterprise-grade architecture patterns.

## 🎯 Service Responsibilities

This service is responsible for:

### ✅ IN SCOPE
- **Hotel Search & Discovery**: Meta-search across internal and external sources
- **Hotel Listing & Details**: Provide comprehensive hotel information
- **Booking Decision Logic**: Determine internal vs external booking flow
- **Reservation Management**: Handle internal hotel bookings (CRUD)
- **Event Emission**: Publish events for payment and notification services
- **Caching**: Cache-first strategy for optimal performance
- **Circuit Breaker**: Graceful degradation when external APIs fail

### ❌ OUT OF SCOPE
- **Authentication**: Handled by separate Auth Service (JWT validation only)
- **Payment Processing**: Delegated to Payment Service via events
- **Notifications**: Delegated to Notification Service via events
- **Hotel Management (CRUD)**: Handled by Hotel Owner Service
- **User Management**: Handled by Auth Service

## 🏗️ Architecture

### Design Patterns
- **Meta-Search Pattern**: Aggregates results from multiple sources
- **Circuit Breaker**: Prevents cascading failures
- **Event-Driven**: Kafka-based event emission
- **Cache-First**: Redis-like caching for performance
- **Booking Decision Engine**: Strategy pattern for booking logic

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Fastify (high performance)
- **Event Bus**: Kafka
- **Caching**: In-memory (production: Redis)
- **Database**: In-memory (production: PostgreSQL/MongoDB)
- **External API**: RapidAPI Booking.com integration

## 📡 API Endpoints

### Search & Discovery (Public/Optional Auth)

#### `GET /api/hotels/search`
Unified meta-search across internal and external hotel sources.

**Query Parameters:**
- `location` or `city` (required): Search location
- `country`: Country filter
- `checkInDate`: ISO date string
- `checkOutDate`: ISO date string
- `guests`: Number of guests
- `rooms`: Number of rooms
- `minPrice`, `maxPrice`: Price range
- `minRating`: Minimum rating (0-5)
- `starRating`: Hotel star rating (1-5)
- `amenities`: Comma-separated amenities
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": [...],
    "total": 45,
    "offset": 0,
    "limit": 20
  },
  "cached": false
}
```

#### `GET /api/hotels/:hotelId`
Get detailed information about a specific hotel.

#### `GET /api/hotels/:hotelId/rooms`
Get available rooms for a hotel.

#### `GET /api/hotels/:hotelId/booking-decision`
Get booking decision (internal vs external redirect).

**Response:**
```json
{
  "success": true,
  "data": {
    "decision": {
      "canBookInternally": true,
      "message": "This hotel can be booked directly",
      "hotelSource": "INTERNAL"
    }
  }
}
```

### Reservations (Protected - Requires Authentication)

#### `POST /api/reservations`
Create a new reservation (internal hotels only).

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Body:**
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

#### `GET /api/reservations`
Get all reservations for authenticated user.

#### `GET /api/reservations/:reservationId`
Get specific reservation details.

#### `POST /api/reservations/:reservationId/confirm`
Confirm a pending reservation.

#### `POST /api/reservations/:reservationId/cancel`
Cancel a reservation.

### Legacy Endpoints

#### `GET /hotels`
Legacy endpoint for backward compatibility.

#### `GET /health`
Service health check with circuit breaker status.

## 📊 Database Schema

### Hotels (Internal Catalog)
```typescript
{
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  starRating: number;
  price: { amount: number; currency: string };
  images: string[];
  amenities: string[];
  source: 'INTERNAL' | 'EXTERNAL';
}
```

### Rooms
```typescript
{
  id: string;
  hotelId: string;
  type: 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'PRESIDENTIAL';
  name: string;
  capacity: number;
  price: { amount: number; currency: string };
  amenities: string[];
  totalRooms: number;
}
```

### Reservations
```typescript
{
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  guestDetails: { name, email, phone };
  createdAt: string;
  updatedAt: string;
}
```

## 🔄 Event Contracts

### Kafka Topics

#### `hotel.reservation.created`
Emitted when a new reservation is created.

```json
{
  "eventType": "RESERVATION_CREATED",
  "reservationId": "uuid",
  "userId": "user-123",
  "hotelId": "hotel-001",
  "timestamp": "2024-12-13T10:00:00Z",
  "data": { /* full reservation object */ }
}
```

#### `hotel.reservation.confirmed`
Emitted when a reservation is confirmed (payment successful).

#### `hotel.reservation.cancelled`
Emitted when a reservation is cancelled.

#### `payment.requests`
Payment request sent to Payment Service.

```json
{
  "eventType": "PAYMENT_REQUESTED",
  "reservationId": "uuid",
  "userId": "user-123",
  "amount": 897.00,
  "currency": "USD",
  "timestamp": "2024-12-13T10:00:00Z"
}
```

## 🚀 Development

### Prerequisites
- Node.js 20+
- npm 9+
- Kafka (optional, set KAFKA_ENABLED=false to disable)

**NOTE**: This service runs on port **4005** (changed from legacy port 4002 to avoid conflicts with admin service).

### Installation
```bash
cd travel-ecosystem-backend/micro-services/hotel-service
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 🔒 Authentication

This service validates JWT tokens from the Auth Service but does NOT handle login/signup.

**Headers for protected endpoints:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Payload:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "role": "user"
}
```

## 🛡️ Resilience & Performance

### Circuit Breaker
- **Failure Threshold**: 3 consecutive failures
- **Success Threshold**: 2 consecutive successes to close
- **Timeout**: 30 seconds before retry

### Caching Strategy
- **Search Results**: 5 minutes TTL
- **Hotel Details**: 10 minutes TTL
- **Cache Invalidation**: On reservation updates

### Rate Limiting
- **Default**: 100 requests per minute per IP
- **Configurable**: via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW

## 🧪 Testing

Test endpoints using curl or Postman:

```bash
# Search hotels
curl "http://localhost:4002/api/hotels/search?location=New%20York&limit=10"

# Get booking decision
curl "http://localhost:4002/api/hotels/hotel-internal-001/booking-decision"

# Create reservation (requires auth token)
curl -X POST http://localhost:4002/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## 🔧 Configuration

See `.env.example` for all configuration options.

## 📚 Integration

### With API Gateway
The API Gateway should route requests to this service:
- `/api/hotels/*` → Hotel Service

### With Other Services
- **Auth Service**: JWT validation
- **Payment Service**: Consumes reservation events
- **Notification Service**: Consumes reservation events
- **Analytics Service**: Consumes reservation events

## 🚀 Production Deployment

For production:
1. Replace in-memory database with PostgreSQL/MongoDB
2. Use Redis for caching
3. Configure Kafka brokers
4. Set up monitoring and observability
5. Configure rate limiting per environment
6. Use proper JWT secret management

## 📖 API Documentation

Full API documentation available at `/docs` (when Swagger is enabled).

## 🤝 Contributing

Follow SOLID principles and maintain clean architecture.

