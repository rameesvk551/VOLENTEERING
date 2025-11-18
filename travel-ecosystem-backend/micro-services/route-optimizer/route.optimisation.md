1. High-Level User Flow

User selects Delhi as the destination.

User provides a starting city (GPS or manual input), start date & time, and travel preferences (budget/comfort/fastest).

App fetches long-distance travel options:

Flights via Duffel/Amadeus

Trains from official/unofficial Indian Railways datasets

Bus driving-time approximation using Google Directions

Driving via Google Directions

User chooses arrival time/location in Delhi.

App optimizes a route through 10 Delhi attractions using OSRM + TSP.

Each route segment shows mode options: walking, driving, metro, bus.

App generates a timeline, map, and smart recommendations (metro-first, budget-aware, weather-aware, skip & re-route).

2. Long-Distance Travel Logic (Kozhikode → Delhi)

Flight: Duffel/Amadeus → real fares, durations, departures.

Train: IRCTC (partnership) or open datasets/third-party providers (marked as low-confidence).

Bus: No reliable national API → use driving time + buffer (25–40%) and mark as estimated.

Driving: Google Directions (mode=driving) → real distance, duration, tolls.

All modes shown side-by-side with cost, time, flags for reliability.

3. Delhi Local Routing & Optimization

User’s Delhi arrival point becomes the starting node.

Attractions list = 10 curated POIs with coordinates.

OSRM Table API creates a distance matrix.

2-opt TSP solver finds optimal order.

For each leg, Google Directions fetches:

Walking

Driving

Transit (metro/bus/local train)

Results stored with travel time, distance, confidence.

4. Travel Mode Detection Logic

Walking: If ≤1.5 km or ≤20 min → preferred option.

Metro: If both endpoints near metro stations and Google Directions transit_mode=subway returns a path → highly recommended.

Driving: If walking is long and metro is inefficient/unavailable → fallback option.

Bus/local train: Returned via Google transit (no subway filter) if available.

Output: ranked modes with ETA, distance, and cost.

5. Metro Detection (GTFS + Google Directions)

Input: Delhi Metro GTFS static files (stops, routes, trips, stop_times).

Build spatial index for station proximity.

If both points have nearby stations → check GTFS connectivity.

Validate metro routes via Google Directions (transit_mode=subway).

Compute total metro journey: walk → station → metro → walk.

Show line names, stations, changeovers, and real fares (Delhi Metro fare table).

6. Timeline & Day Planner

Starting from arrival time:

arrival → visit duration → travel → next arrival.

Insert buffers (10–20 min) automatically.

If total active hours > 8–10 hours → auto-split into multiple days.

Insert meal breaks after long sessions.

Consider closure days and re-order if required.

Allow “skip and re-route” and “running late” adjustments.

7. API & Architecture Overview
Frontend (React/Next.js + Zustand)

TripSetup (destination, start location, date/time).

LongDistanceOptions.

RouteOptimizerModal.

RouteResults (timeline + map).

DayPlanner.

Backend Microservices

API Gateway: Orchestrates all.

Transport Service: Duffel/Amadeus + train/bus fetchers.

Matrix Service: OSRM + Redis caching.

Optimizer Service: TSP solver + day splitting.

Transit Enricher: GTFS metro routing & station logic.

Job Worker: Background processing + SSE/WebSocket updates.

Key Endpoints

POST /optimize-route

POST /long-distance-options

GET /jobs/:id

8. Unique Features (Stand-Out Differentiators)

Metro-first routing with full metro detail visualization.

Data confidence levels (high/medium/low) per travel mode.

Weather-aware itinerary (if weather API available).

Budget vs Comfort presets.

AI-based interest clusters (e.g., historical Delhi day).

Skip & Re-route instantly using cached matrix.

Popular Times-based crowd avoidance (legal sources only).

Multi-day auto splitting with user override.

PDF export with metro maps and offline navigation.

9. Implementation Checklist (Condensed)
Phase 1 — Setup

Google Places Autocomplete

GPS location input

10 curated Delhi attractions

Duffel/Amadeus integration

Train/bus dataset integration

OSRM deployment

GTFS Delhi metro parsing

Phase 2 — Routing

OSRM distance matrix

TSP solver

Directions API for multi-modal travel

Per-leg transport mode logic

Phase 3 — Timeline

Visit duration

Buffers

Day splitting

Smart re-route

Phase 4 — UX

Metro-first design

Budget/comfort toggle

Running-late button

Drag/drop day planner

Phase 5 — Extras

Cost breakdown

Weather-aware swaps

PDF export

Confidence labels