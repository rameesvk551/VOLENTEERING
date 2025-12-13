# Hotel Discovery & Booking Service - Complete Architecture Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Service Architecture](#service-architecture)
3. [Data Models](#data-models)
4. [API Design](#api-design)
5. [Event-Driven Architecture](#event-driven-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Security](#security)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)

---

## 1. System Overview

### Service Boundary

#### In Scope
- Hotel search (meta-search across internal + external sources)
- Hotel listing and details
- Booking decision logic (internal vs external)
- Reservation management (internal hotels only)
- Event emission for downstream services
- Caching and performance optimization

#### Out of Scope
- User authentication (Auth Service)
- Payment processing (Payment Service)
- Email/SMS notifications (Notification Service)
- Hotel CRUD operations (Hotel Owner Service)
- Analytics and reporting (Analytics Service)

### Technology Stack

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify (high performance, low overhead)
- **Language**: TypeScript
- **Event Bus**: Kafka
- **Cache**: In-memory (production: Redis)
- **Database**: In-memory (production: PostgreSQL/MongoDB)
- **External API**: RapidAPI Booking.com

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Build**: Vite + Module Federation
- **HTTP**: Axios

---

## 2. Service Architecture

### Microservice Design

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 4000)                  │
│  - Request routing                                           │
│  - JWT validation                                            │
│  - Rate limiting                                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────────────────────────┐
             │                                      │
             ▼                                      ▼
┌────────────────────────────┐       ┌─────────────────────────┐
│ Hotel Service (Port 4005)  │       │  Auth Service           │
│                            │       │  - JWT generation       │
│  ┌──────────────────────┐ │       │  - User validation      │
│  │ Meta-Search Service  │ │       └─────────────────────────┘
│  │  - Internal DB       │ │
│  │  - External API      │ │       ┌─────────────────────────┐
│  │  - Normalization     │ │       │  Payment Service        │
│  │  - Deduplication     │ │       │  - Payment processing   │
│  │  - Ranking          │ │       │  - Refunds              │
│  └──────────────────────┘ │       └─────────────────────────┘
│                            │
│  ┌──────────────────────┐ │       ┌─────────────────────────┐
│  │ Booking Decision     │ │       │  Notification Service   │
│  │ Engine               │ │       │  - Email                │
│  └──────────────────────┘ │       │  - SMS                  │
│                            │       └─────────────────────────┘
│  ┌──────────────────────┐ │
│  │ Reservation Service  │ │       ┌─────────────────────────┐
│  │  - Create            │ │       │  Analytics Service      │
│  │  - Confirm           │ │       │  - Event tracking       │
│  │  - Cancel            │ │       │  - Reporting            │
│  └──────────────────────┘ │       └─────────────────────────┘
│                            │
│  ┌──────────────────────┐ │
│  │ Cache Service        │ │
│  │  - Search results    │ │
│  │  - Hotel details     │ │
│  └──────────────────────┘ │
│                            │
│  ┌──────────────────────┐ │
│  │ Event Emitter        │ │
│  │  - Kafka producer    │ │
│  └──────────────────────┘ │
└────────────┬───────────────┘
             │
             ▼
      ┌─────────────┐
      │   Kafka     │
      │  Event Bus  │
      └─────────────┘
```

### Circuit Breaker Pattern

Protects against cascading failures when external APIs are unavailable:

```
┌─────────────────────────────────────┐
│      Circuit States                 │
├─────────────────────────────────────┤
│                                     │
│  CLOSED (Normal)                    │
│     │                               │
│     │ 3+ failures                   │
│     ▼                               │
│  OPEN (Degraded)                    │
│     │                               │
│     │ 30s timeout                   │
│     ▼                               │
│  HALF_OPEN (Testing)                │
│     │                               │
│     │ 2 successes                   │
│     ▼                               │
│  CLOSED                             │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Data Models

### Hotel
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Hotel name
  description: string;     // Full description
  address: string;         // Street address
  city: string;            // City
  country: string;         // Country
  coordinates: {           // Geo location
    lat: number;
    lng: number;
  };
  rating: number;          // User rating (0-5)
  starRating: number;      // Hotel star rating (1-5)
  reviewCount: number;     // Number of reviews
  price: {
    amount: number;        // Price per night
    currency: string;      // ISO currency code
    perNight: boolean;     // Always true
  };
  images: string[];        // Image URLs
  amenities: string[];     // Available amenities
  roomTypes: string[];     // Available room types
  url: string;             // Hotel website
  availability: boolean;   // Is available
  distanceFromCenter: number; // km from city center
  source: 'INTERNAL' | 'EXTERNAL'; // Booking source
  externalBookingUrl?: string;     // External booking URL
}
```

### Room
```typescript
{
  id: string;
  hotelId: string;
  type: 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'PRESIDENTIAL';
  name: string;
  description: string;
  capacity: number;
  price: Price;
  amenities: string[];
  images: string[];
  available: boolean;
  totalRooms: number;
}
```

### Reservation
```typescript
{
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;     // ISO date
  checkOutDate: string;    // ISO date
  guests: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'FAILED';
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. API Design

### RESTful Principles
- Resource-based URLs
- HTTP verbs (GET, POST, PUT, DELETE)
- Stateless
- JSON responses
- HTTP status codes

### Response Format
```json
{
  "success": true | false,
  "data": { /* response data */ },
  "error": "Error message",
  "message": "Success message",
  "cached": true | false
}
```

---

## 5. Event-Driven Architecture

### Event Flow

```
User Creates Reservation
         │
         ▼
┌─────────────────────┐
│ Reservation Service │
└──────────┬──────────┘
           │
           │ Emit: RESERVATION_CREATED
           ▼
    ┌──────────────┐
    │    Kafka     │
    └──────┬───────┘
           │
           ├────────────────────────────────┐
           │                                │
           ▼                                ▼
   ┌────────────────┐            ┌──────────────────┐
   │ Payment Service│            │ Notification Svc │
   │  - Process     │            │  - Send email    │
   │  - Confirm     │            │  - Send SMS      │
   └────────┬───────┘            └──────────────────┘
            │
            │ Payment Success
            │
            ▼
    ┌──────────────┐
    │ Emit: PAYMENT│
    │   _CONFIRMED │
    └──────┬───────┘
           │
           ▼
┌──────────────────────┐
│  confirmReservation()│
└──────────┬───────────┘
           │
           │ Emit: RESERVATION_CONFIRMED
           ▼
    ┌──────────────┐
    │    Kafka     │
    └──────────────┘
```

### Event Contracts

#### RESERVATION_CREATED
```json
{
  "eventType": "RESERVATION_CREATED",
  "reservationId": "uuid",
  "userId": "user-123",
  "hotelId": "hotel-001",
  "timestamp": "ISO-8601",
  "data": { /* full reservation */ }
}
```

---

## 6. Frontend Architecture

### Micro-Frontend Structure

```
hotel-booking/ (MFE)
├── src/
│   ├── components/
│   │   ├── HotelSearch.tsx        # Search form
│   │   ├── HotelCard.tsx          # Hotel display card
│   │   ├── HotelList.tsx          # List of hotels
│   │   └── BookingCTA.tsx         # Booking call-to-action
│   ├── pages/
│   │   ├── SearchPage.tsx         # Main search page
│   │   ├── HotelDetailsPage.tsx   # Hotel details
│   │   └── ReservationsPage.tsx   # User reservations
│   ├── services/
│   │   └── hotelApi.ts            # API client
│   ├── store/
│   │   └── hotelStore.ts          # Zustand state
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   └── App.tsx                    # Main app component
└── vite.config.ts                 # Module Federation config
```

### State Management (Zustand)

```typescript
// Global state
{
  searchQuery: SearchQuery | null;
  searchResults: Hotel[];
  isSearching: boolean;
  searchError: string | null;
  selectedHotel: Hotel | null;
  reservations: Reservation[];
}

// Actions
setSearchQuery()
setSearchResults()
setSelectedHotel()
clearSearch()
```

### Module Federation Integration

**hotel-booking/vite.config.ts:**
```typescript
federation({
  name: 'hotelBooking',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true }
  }
})
```

**shell/vite.config.ts:**
```typescript
remotes: {
  hotelBooking: 'http://localhost:1007/assets/remoteEntry.js'
}
```

---

## 7. Security

### Authentication
- JWT tokens from Auth Service
- Token validation in API Gateway
- Token passed to Hotel Service via headers

### Authorization
- User can only access their own reservations
- Role-based access for admin functions (future)

### Data Protection
- HTTPS in production
- Input validation
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

---

## 8. Performance & Scalability

### Caching Strategy
```
Search Request
     │
     ▼
 Cache Check ────┐
     │           │ HIT
     │ MISS      ▼
     ▼        Return
  Database    Cached
     │        Result
     ▼
  Cache Set
     │
     ▼
   Return
```

### Load Balancing
- Multiple Hotel Service instances
- Nginx/HAProxy for load balancing
- Session affinity not required (stateless)

### Database Scaling
- Read replicas for search queries
- Write master for reservations
- Database connection pooling
- Indexing on frequently queried fields

---

## 9. Deployment

### Docker Deployment
```yaml
# docker-compose.yml
services:
  hotel-service:
    build: ./hotel-service
    ports:
      - "4005:4005"
    environment:
      - DATABASE_URL=...
      - KAFKA_BROKERS=...
    depends_on:
      - postgres
      - kafka
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hotel-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hotel-service
  template:
    spec:
      containers:
      - name: hotel-service
        image: hotel-service:latest
        ports:
        - containerPort: 4005
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

---

## 10. Best Practices

### Code Quality
- TypeScript for type safety
- ESLint for code style
- Prettier for formatting
- Unit tests with Jest
- Integration tests

### API Design
- Versioning (/api/v1/hotels)
- Pagination for large datasets
- Rate limiting per user
- API documentation (Swagger/OpenAPI)

### Monitoring
- Health check endpoints
- Prometheus metrics
- Grafana dashboards
- Error tracking (Sentry)
- Logging (Winston)

### Error Handling
- Graceful degradation
- Circuit breaker for external APIs
- Retry logic with exponential backoff
- User-friendly error messages
- Detailed error logging

---

## Summary

This architecture follows enterprise-grade best practices:

1. **Microservices**: Clear service boundaries
2. **Event-Driven**: Async communication via Kafka
3. **Scalable**: Horizontal scaling, caching, load balancing
4. **Resilient**: Circuit breakers, graceful degradation
5. **Secure**: JWT auth, input validation, HTTPS
6. **Performant**: Caching, database optimization
7. **Maintainable**: Clean code, TypeScript, documentation

The system is production-ready and follows patterns used by platforms like Kayak, Booking.com, and Expedia.
