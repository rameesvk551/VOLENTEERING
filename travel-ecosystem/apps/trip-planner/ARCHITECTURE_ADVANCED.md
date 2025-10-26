# Trip Planner — Advanced Architecture & Design

This document explains the architecture, design concepts, technology choices, key integrations, data flows, and advanced considerations for the Trip Planner application in this repository.

It is written for engineers and automated coding agents who must be productive quickly: it references concrete files and patterns present in `travel-ecosystem/apps/trip-planner` and the related `travel-ecosystem/services/discovery-engine` service.

---

## Purpose and high-level goals

- Provide a collaborative, optimized trip planning experience that combines user input, geographic routing, automated route optimization, and discovery of POIs (points-of-interest).
- Deliver fast interactive UI with offline-friendly patterns, deterministic state handling, and extendable recommendation/AI features.
- Keep integration boundaries small and clear: the trip-planner app is a frontend app (React + Vite + TypeScript) that relies on backend services for heavy compute and data (route optimizer, discovery engine, knowledge graph).

## Where the code lives (key paths)

- Frontend app root: `travel-ecosystem/apps/trip-planner`
  - Main entry: `src/main.tsx`, `index.html`
  - UI: `src/components` (e.g., `RouteMap.tsx`, `RouteOptimizer.tsx`, `TripPlanCard.tsx`)
  - State: `src/store/tripStore.ts`
  - Services: `src/services/routeOptimization.service.ts`, `routeOptimizer.ts`, `aiTravelGuide.ts`
  - Hooks: `src/hooks/useDiscovery.ts`
  - Data: `src/data/dummyData.ts`

- Discovery data & crawlers: `travel-ecosystem/services/discovery-engine`
  - Service entry: `src/index.ts`, API server in `src/api/` (routes & simple-server)
  - Crawlers & workers: `src/crawlers/*`, `src/workers/*`
  - Integrations: `src/services/google-places.service.ts`, `tavily.service.ts`
  - Graph & storage: `src/graph/knowledge.graph.ts`, `src/database/*`

## Big-picture architecture

1. Client (trip-planner app)
   - Built with React + TypeScript + Vite. Produces a SPA focusing on map-first UX.
   - Local state (trip store) holds the user's itinerary, destinations, and optimization preferences.
   - UI components call lightweight service modules in `src/services` which translate intent into API calls or local compute.

2. Discovery Engine (separate service)
   - Crawls, transforms and stores POI data, exposing discovery APIs consumed by the frontend.
   - Maintains a knowledge graph used for semantic queries, suggestions, and entity linking.

3. Route Optimization / Route Service
   - The heavy-lift compute (TSP solver, route optimizer) can either run in a dedicated backend service (recommended) or in a web-worker on the frontend for smaller payloads.
   - The repo includes `routeOptimizer.ts` and `routeOptimization.service.ts` — these modules provide route optimization logic and a service wrapper used by UI components like `RouteOptimizer`.

4. Integrations & External Systems
   - Maps & routing providers (e.g., OpenRouteService, Google Maps, or custom routing engines).
   - Places data: `google-places.service.ts` or Tavily integration in the discovery engine.
   - AI/ML models for recommendations: inference may be via a cloud API or local model-serving service.

5. Data flows
   - User adds destinations in the UI → `tripStore` updates → UI may call `routeOptimization.service` (local or API) to get an optimized route.
   - User searches discovery: frontend `useDiscovery` hook queries discovery-engine API → discovery returns POIs and entity metadata → UI shows `RecommendationCarousel` / `ResultCard`.
   - When user accepts suggestions, entities are added to itinerary and route re-optimized.

## Component responsibilities & examples

- `TripStore` (`src/store/tripStore.ts`)
  - Single source of truth for current itinerary, preferences, and collaborative session state.
  - All UI components read and dispatch updates through this store.

- `RouteMap.tsx` & `TripMap.tsx`
  - Map rendering and route visualization. Keep mapping code focused on view-only responsibilities; calculations and optimization should live in services.

- `RouteOptimizer.tsx` & `routeOptimizer.ts` / `routeOptimization.service.ts`
  - Implements the route optimization algorithm and coordinates input validation, objective function (shortest time, least walking, prioritized stops), and output normalization.

- `useDiscovery.ts` + `DiscoverySearch.tsx`
  - Encapsulates search, debouncing, and pagination for the discovery-engine API.

- `aiTravelGuide.ts`
  - Wraps calls to AI-backed recommendation endpoints; used for generating itinerary suggestions and explanations.

## Data model (conceptual)

- Destination / POI
  - id, name, location {lat,lng}, category, popularityScore, openingHours, metadata

- Itinerary
  - id, owner, list of Waypoints (destination id + scheduled time window + visitDuration), optimizationConstraints

- Route / Leg
  - start, end, distance, duration, geometry, transportMode

- Session / Collaboration
  - sessionId, participants[], lastUpdate, changeLog

## Algorithms and advanced features

- Route optimization
  - TSP variants with time windows and priorities. Heuristics: Christofides, simulated annealing, or insertion heuristics for real-time updates.
  - Multi-modal routing (drive, walk, transit). Distinguish optimization per transport mode.

- Recommendations
  - Hybrid approach: combine discovery-engine (graph + crawled data) + user preferences + AI ranking from `aiTravelGuide`.
  - Re-rank by context: time-of-day, weather, user constraints.

- Offline-first & progressive enhancement
  - Keep route and itinerary JSON serializable in `tripStore`; persist to localStorage for offline access.
  - Fall back to local heuristics if API offline (use small in-browser optimizer for basic cases).

- Collaboration
  - Use optimistic updates in UI, broadcast deltas via WebSocket or WebRTC (server-side socket manager not present in this app but supported in other `server/` projects in repo).

## Scalability & deployment patterns

- Frontend
  - Built with Vite; deploy as static assets behind CDN (Netlify, Vercel, S3 + CloudFront) or served by a simple Nginx container.

- Backend services
  - Discovery engine: containerized (see `travel-ecosystem/services/discovery-engine/Dockerfile` and `docker-compose.yml`). It uses worker processes for crawling and ETL.
  - Route optimization: stateless service exposing a REST/gRPC endpoint. Scale horizontally behind a queue for long-running jobs.

- Data storage
  - Discovery graph: use a scalable graph DB (e.g., Neo4j or a document DB sharded by region). Keep raw crawler data in object storage for re-ingestion.

- CI / CD
  - Repo-level `docker-compose` and per-service `package.json` scripts are present. Use GitHub Actions to run lint/tests and publish images.

## Observability & testing

- Logging
  - Discovery engine uses `src/utils/logger.ts`; follow similar patterns in frontend for debug logs.

- Monitoring
  - Add health checks for backend routes (discovery-engine has `health-check.js`). Track latency on route optimization endpoints.

- Tests
  - Frontend: unit tests for pure functions (optimizers), component tests with React Testing Library for core UI flows.
  - Integration: route optimization service should have deterministic test cases (known input -> known output). Discovery-engine includes seed data and examples in `examples/` for reproducible tests.

## Security & secrets

- API keys and secrets live in `.env` files in each app (`.env.example` present). Never commit secrets. For production, use secret manager (AWS Secrets Manager, GCP Secret Manager) and inject at runtime.
- Frontend should never hold private keys; only public map keys allowed client-side.
- Validate and sanitize any external input returned from discovery crawlers before persisting or showing in UI.

## Project-specific conventions & patterns

- Small service-per-responsibility model inside `travel-ecosystem/apps/*` and `services/*`.
- Discovery data is treated as eventual-consistent: crawlers run, ETL workers transform and push into the graph; UI should handle slight staleness.
- UI components prefer thinness: complex algorithms live in `src/services/*` or dedicated backend services.
- Use TypeScript types across the stack (frontend `tsconfig.json` present) and mirror types (entity shapes) between frontend and discovery-engine where possible.

## Integration points (concrete files)

- Discovery API client used by the frontend: `src/hooks/useDiscovery.ts` and service wrappers in `src/services`.
- Route optimization service wrappers: `src/services/routeOptimization.service.ts` and `src/services/routeOptimizer.ts`.
- Discovery-engine graph and services: `travel-ecosystem/services/discovery-engine/src/graph/knowledge.graph.ts` and `src/services/google-places.service.ts`.

## Performance considerations

- Avoid sending whole itinerary geometries across the wire on every small change; send deltas and allow client-side merge.
- Use cached distance matrices for commonly visited zones to minimize repeated routing calls.
- Rate-limit discovery queries and add debouncing in `DiscoverySearch.tsx` (debounce at UI level — `useDiscovery` implements this pattern).

## Privacy and data protection

- Treat location and itinerary data as personal. Provide opt-out for analytics and persistent storage.
- When storing or sharing collaborative sessions, ensure access control tokens and session-scoped permissions.

## Extensibility & plugin points

- Recommendation pipeline: the `aiTravelGuide.ts` service is a clear extension point to add new models or rerankers.
- Route constraints: the optimizer accepts constraints; adding custom constraint types (e.g., accessibility constraints) should be pluggable.
- Data connectors: discovery-engine `src/services` supports multiple upstream connectors (Google Places, Tavily). Add connectors consistently with that pattern.

## Suggested roadmap / advanced improvements

- Move heavy optimizers to a dedicated microservice with job queue for long-running optimizations and webhooks for results.
- Add region-aware discovery caches and precomputed POI clusters for faster suggestions.
- Add context-aware AI: person-specific preferences stored in a privacy-preserving profile; use on-device models for personalization if possible.
- Add telemetry for optimizer decisions (why a stop was chosen) to explain results to users.

## Quick references (where to look next)

- Frontend entry & major components: `travel-ecosystem/apps/trip-planner/src`
- Trip state: `travel-ecosystem/apps/trip-planner/src/store/tripStore.ts`
- Route optimizer & services: `travel-ecosystem/apps/trip-planner/src/services`
- Discovery engine service: `travel-ecosystem/services/discovery-engine/src`
- Discovery crawler patterns: `travel-ecosystem/services/discovery-engine/src/crawlers` and `src/workers`.

---

If you want, I can:
- Convert this into a shorter README or a checklist for onboarding new developers.
- Add diagrams (architecture flow) or a simple sequence diagram.
- Create a smaller `README.md` version in the trip-planner root.

Would you like me to add a summarized `README.md` in the app root as well, or expand any section further (e.g., detailed API contract examples)?
