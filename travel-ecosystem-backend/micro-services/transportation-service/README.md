# Transportation Service - Architecture & Implementation Guide

## Overview
The Transportation Service provides multimodal transport options for trip legs using GTFS (General Transit Feed Specification) data, GTFS-RT (realtime), and Google Directions API as fallback.

## Core Responsibilities
1. **GTFS Data Management**: Import, normalize, and query static GTFS feeds
2. **Realtime Transit**: Stream/poll GTFS-RT for live vehicle positions and delays
3. **Multimodal Routing**: Calculate routes for walking, cycling, transit, driving, e-scooter
4. **Caching**: Redis caching for frequent queries
5. **Fallback**: Google Directions API when GTFS unavailable

## Tech Stack
- **Runtime**: Node.js 20+ (TypeScript)
- **Framework**: Fastify (high-performance HTTP)
- **Database**: PostgreSQL with PostGIS extension
- **Cache**: Redis 7+
- **Queue**: BullMQ (for GTFS import jobs)
- **Routing Engine**: Custom RAPTOR + OpenTripPlanner (optional)

## Database Schema

### GTFS Tables (Normalized)

```sql
-- agencies
CREATE TABLE gtfs_agencies (
  agency_id VARCHAR(255) PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  agency_url VARCHAR(512),
  agency_timezone VARCHAR(100),
  feed_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- stops
CREATE TABLE gtfs_stops (
  stop_id VARCHAR(255) PRIMARY KEY,
  stop_code VARCHAR(50),
  stop_name VARCHAR(255) NOT NULL,
  stop_desc TEXT,
  stop_lat DECIMAL(10, 8) NOT NULL,
  stop_lon DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS
  zone_id VARCHAR(100),
  stop_url VARCHAR(512),
  location_type INTEGER DEFAULT 0,
  parent_station VARCHAR(255),
  wheelchair_boarding INTEGER,
  feed_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stops_location ON gtfs_stops USING GIST (location);
CREATE INDEX idx_stops_feed ON gtfs_stops(feed_id);

-- routes
CREATE TABLE gtfs_routes (
  route_id VARCHAR(255) PRIMARY KEY,
  agency_id VARCHAR(255) REFERENCES gtfs_agencies(agency_id),
  route_short_name VARCHAR(50),
  route_long_name VARCHAR(255),
  route_desc TEXT,
  route_type INTEGER NOT NULL, -- 0=tram, 1=subway, 2=rail, 3=bus, 4=ferry, etc.
  route_url VARCHAR(512),
  route_color VARCHAR(6),
  route_text_color VARCHAR(6),
  feed_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- trips
CREATE TABLE gtfs_trips (
  trip_id VARCHAR(255) PRIMARY KEY,
  route_id VARCHAR(255) REFERENCES gtfs_routes(route_id),
  service_id VARCHAR(100) NOT NULL,
  trip_headsign VARCHAR(255),
  trip_short_name VARCHAR(50),
  direction_id INTEGER,
  block_id VARCHAR(100),
  shape_id VARCHAR(100),
  wheelchair_accessible INTEGER,
  bikes_allowed INTEGER,
  feed_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_route ON gtfs_trips(route_id);
CREATE INDEX idx_trips_service ON gtfs_trips(service_id);

-- stop_times
CREATE TABLE gtfs_stop_times (
  id BIGSERIAL PRIMARY KEY,
  trip_id VARCHAR(255) REFERENCES gtfs_trips(trip_id),
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  stop_id VARCHAR(255) REFERENCES gtfs_stops(stop_id),
  stop_sequence INTEGER NOT NULL,
  stop_headsign VARCHAR(255),
  pickup_type INTEGER DEFAULT 0,
  drop_off_type INTEGER DEFAULT 0,
  shape_dist_traveled DECIMAL(10, 2),
  feed_id VARCHAR(100) NOT NULL
);

CREATE INDEX idx_stop_times_trip ON gtfs_stop_times(trip_id, stop_sequence);
CREATE INDEX idx_stop_times_stop ON gtfs_stop_times(stop_id, arrival_time);

-- calendar (service patterns)
CREATE TABLE gtfs_calendar (
  service_id VARCHAR(100) PRIMARY KEY,
  monday BOOLEAN,
  tuesday BOOLEAN,
  wednesday BOOLEAN,
  thursday BOOLEAN,
  friday BOOLEAN,
  saturday BOOLEAN,
  sunday BOOLEAN,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  feed_id VARCHAR(100) NOT NULL
);

-- calendar_dates (exceptions)
CREATE TABLE gtfs_calendar_dates (
  service_id VARCHAR(100),
  date DATE NOT NULL,
  exception_type INTEGER NOT NULL, -- 1=service added, 2=service removed
  feed_id VARCHAR(100) NOT NULL,
  PRIMARY KEY (service_id, date)
);

-- shapes (route geometry)
CREATE TABLE gtfs_shapes (
  id BIGSERIAL PRIMARY KEY,
  shape_id VARCHAR(100) NOT NULL,
  shape_pt_lat DECIMAL(10, 8) NOT NULL,
  shape_pt_lon DECIMAL(11, 8) NOT NULL,
  shape_pt_sequence INTEGER NOT NULL,
  shape_dist_traveled DECIMAL(10, 2),
  feed_id VARCHAR(100) NOT NULL
);

CREATE INDEX idx_shapes_shape_id ON gtfs_shapes(shape_id, shape_pt_sequence);

-- Realtime data (GTFS-RT)
CREATE TABLE gtfs_rt_vehicle_positions (
  vehicle_id VARCHAR(255) PRIMARY KEY,
  trip_id VARCHAR(255),
  route_id VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  bearing DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_positions_location ON gtfs_rt_vehicle_positions USING GIST (location);

CREATE TABLE gtfs_rt_trip_updates (
  id BIGSERIAL PRIMARY KEY,
  trip_id VARCHAR(255) NOT NULL,
  route_id VARCHAR(255),
  stop_id VARCHAR(255),
  stop_sequence INTEGER,
  arrival_delay INTEGER, -- seconds
  departure_delay INTEGER, -- seconds
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_updates_trip ON gtfs_rt_trip_updates(trip_id, timestamp);
```

## GTFS Import Process

### 1. Download & Extract GTFS ZIP
```typescript
async function importGTFSFeed(feedUrl: string, feedId: string): Promise<void> {
  const tempDir = await downloadAndExtract(feedUrl);
  
  const files = [
    'agency.txt', 'stops.txt', 'routes.txt', 'trips.txt', 
    'stop_times.txt', 'calendar.txt', 'calendar_dates.txt', 'shapes.txt'
  ];
  
  for (const file of files) {
    await importCSVToPostgres(path.join(tempDir, file), feedId);
  }
  
  await cleanup(tempDir);
}
```

### 2. Normalize & Index
- Parse CSV using `csv-parser` or `papaparse`
- Bulk insert with `COPY` command (fastest)
- Create PostGIS geometries: `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`
- Update materialized views for fast lookups

### 3. Schedule Updates
```typescript
// Cron job: update feeds daily
schedule.scheduleJob('0 3 * * *', async () => {
  await updateAllGTFSFeeds();
});
```

## RAPTOR Algorithm (Public Transit Routing)

RAPTOR (Round-based Public Transit Optimized Router) is the fastest algorithm for timetable-based transit routing.

### Implementation Stub

```typescript
interface RaptorResult {
  legs: Array<{
    from: Stop;
    to: Stop;
    departure: Date;
    arrival: Date;
    route: Route;
    transfers: number;
  }>;
  totalDuration: number;
  transfers: number;
}

class RaptorRouter {
  constructor(
    private stops: Map<string, Stop>,
    private routes: Map<string, Route>,
    private stopTimes: Map<string, StopTime[]>
  ) {}

  async route(
    fromStopId: string,
    toStopId: string,
    departureTime: Date,
    maxTransfers: number = 3
  ): Promise<RaptorResult[]> {
    const labels: Map<string, Label[]> = new Map(); // Round-indexed earliest arrival times
    const markedStops: Set<string> = new Set([fromStopId]);
    
    // Initialize
    labels.set(fromStopId, [{ round: 0, arrival: departureTime, parent: null }]);
    
    for (let round = 0; round <= maxTransfers; round++) {
      const newMarkedStops: Set<string> = new Set();
      
      // For each marked stop
      for (const stopId of markedStops) {
        const routesAtStop = this.getRoutesAtStop(stopId);
        
        for (const route of routesAtStop) {
          // Traverse route
          const trip = this.getEarliestTrip(route, stopId, labels.get(stopId)![round].arrival);
          if (!trip) continue;
          
          for (const nextStopId of this.getStopsAfter(route, stopId)) {
            const arrivalTime = this.getArrival(trip, nextStopId);
            
            // Improve label
            if (this.improves(labels, nextStopId, round + 1, arrivalTime)) {
              labels.set(nextStopId, [
                ...(labels.get(nextStopId) || []),
                { round: round + 1, arrival: arrivalTime, parent: { stopId, route, trip } }
              ]);
              newMarkedStops.add(nextStopId);
            }
          }
        }
      }
      
      // Foot transfers
      for (const stopId of newMarkedStops) {
        const nearby = this.getNearbyStops(stopId, 200); // 200m walking
        for (const nearbyStop of nearby) {
          const walkTime = this.getWalkTime(stopId, nearbyStop.id);
          const arrivalTime = new Date(labels.get(stopId)![round + 1].arrival.getTime() + walkTime);
          
          if (this.improves(labels, nearbyStop.id, round + 1, arrivalTime)) {
            labels.set(nearbyStop.id, [
              ...(labels.get(nearbyStop.id) || []),
              { round: round + 1, arrival: arrivalTime, parent: { stopId, foot: true } }
            ]);
            newMarkedStops.add(nearbyStop.id);
          }
        }
      }
      
      markedStops.clear();
      newMarkedStops.forEach(s => markedStops.add(s));
    }
    
    // Extract paths to destination
    return this.extractPaths(labels, toStopId);
  }
}
```

## GTFS-RT Integration

### Fetch Vehicle Positions
```typescript
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

async function fetchVehiclePositions(feedUrl: string): Promise<void> {
  const response = await fetch(feedUrl);
  const buffer = await response.arrayBuffer();
  
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
  );
  
  for (const entity of feed.entity) {
    if (entity.vehicle) {
      await db.query(`
        INSERT INTO gtfs_rt_vehicle_positions (vehicle_id, trip_id, route_id, latitude, longitude, location, timestamp)
        VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8)
        ON CONFLICT (vehicle_id) DO UPDATE SET
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          location = EXCLUDED.location,
          timestamp = EXCLUDED.timestamp,
          updated_at = NOW()
      `, [
        entity.vehicle.vehicle.id,
        entity.vehicle.trip?.tripId,
        entity.vehicle.trip?.routeId,
        entity.vehicle.position.latitude,
        entity.vehicle.position.longitude,
        entity.vehicle.position.longitude,
        entity.vehicle.position.latitude,
        new Date(entity.vehicle.timestamp * 1000)
      ]);
    }
  }
}

// Poll every 15-30 seconds
setInterval(() => fetchVehiclePositions(GTFS_RT_URL), 15000);
```

## Multimodal Route Endpoint Implementation

```typescript
// src/routes/transport.routes.ts
fastify.post('/multi-modal-route', async (request, reply) => {
  const { from, to, departureTime, modes, preferences } = request.body;
  
  const options: TransportOption[] = [];
  
  // Parallel fetch all modes
  const results = await Promise.allSettled([
    modes.includes('WALKING') ? calculateWalkingRoute(from, to) : null,
    modes.includes('CYCLING') ? calculateCyclingRoute(from, to) : null,
    modes.includes('PUBLIC_TRANSPORT') ? calculateTransitRoute(from, to, departureTime, preferences) : null,
    modes.includes('DRIVE') ? calculateDrivingRoute(from, to) : null,
    modes.includes('E_SCOOTER') ? calculateEScooterRoute(from, to) : null
  ]);
  
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      options.push(result.value);
    }
  }
  
  // Add badges
  if (options.length > 0) {
    const fastest = options.reduce((prev, curr) => prev.durationMinutes < curr.durationMinutes ? prev : curr);
    fastest.badge = 'Fastest';
    
    const cheapest = options.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
    cheapest.badge = 'Cheapest';
  }
  
  // Cache result
  const cacheKey = `route:${from.lat},${from.lng}:${to.lat},${to.lng}:${modes.join(',')}`;
  await redis.setex(cacheKey, 60, JSON.stringify(options)); // 60s TTL for realtime
  
  return reply.send({
    legId: `leg-${Date.now()}`,
    options
  });
});
```

## Google Directions Fallback

```typescript
async function calculateTransitRoute(from, to, departureTime, preferences) {
  // Try GTFS first
  const nearbyStops = await findNearbyStops(from, 500);
  
  if (nearbyStops.length > 0) {
    // Use RAPTOR
    const routes = await raptorRouter.route(nearbyStops[0].id, to, departureTime);
    return routes[0]; // Best option
  }
  
  // Fallback to Google
  const googleResult = await googleDirections.route({
    origin: `${from.lat},${from.lng}`,
    destination: `${to.lat},${to.lng}`,
    mode: 'transit',
    departure_time: departureTime
  });
  
  return parseGoogleResponse(googleResult);
}
```

## Deployment (Docker Compose)

```yaml
version: '3.8'
services:
  transport-service:
    build: ./transportation-service
    ports:
      - "3008:3008"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/gtfs
      REDIS_URL: redis://redis:6379
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: gtfs
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - gtfs_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  gtfs_data:
  redis_data:
```

## Testing Strategy

1. **Unit tests**: RAPTOR algorithm edge cases
2. **Integration tests**: GTFS import with sample feed
3. **E2E tests**: Full multimodal route calculation
4. **Load tests**: 1000 req/s with cached responses

## Performance Targets

- RAPTOR query: < 400ms for 3 transfers
- Nearby stops (PostGIS): < 50ms
- Cached route lookup: < 10ms
- GTFS import: < 5 minutes for 1GB feed
