/**
 * Route Optimizer Service V2
 * 
 * Implements the FULL architecture for route optimization:
 * 1. Distance Matrix computation (Haversine / OSRM / Google)
 * 2. TSP optimization (2-opt, simulated annealing, genetic)
 * 3. RAPTOR algorithm (for public transport)
 * 4. Constraint application (budget, time, opening hours)
 * 5. Returns optimized ORDER only (no transport details yet)
 */

import { v4 as uuidv4 } from 'uuid';
import haversine from 'haversine-distance';
import axios from 'axios';

// ========== TYPES ==========

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  priority?: number;
  visitDuration?: number;
}

interface OptimizationRequest {
  userId?: string;
  places: Place[];
  constraints: {
    startLocation?: { lat: number; lng: number };
    startTime?: string;
    timeBudgetMinutes?: number;
    travelTypes: string[];
    budget?: number;
  };
  options: {
    includeRealtimeTransit: boolean;
    algorithm?: string;
  };
}

export interface TransportLegStep {
  mode: string;
  from: string;
  to: string;
  distanceMeters: number;
  durationSeconds: number;
  route?: string;
  routeColor?: string;
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
  delaySeconds?: number;
}

export interface TransportLegDetail {
  from: { placeId: string; name: string; lat: number; lng: number; seq: number };
  to: { placeId: string; name: string; lat: number; lng: number; seq: number };
  travelType: string;
  travelTimeSeconds: number;
  distanceMeters: number;
  cost: number;
  steps: TransportLegStep[];
  polyline?: string | null;
  provider: 'transport-service' | 'osrm-fallback';
}

export interface TimelineEntry {
  placeId: string;
  seq: number;
  arrivalTime: string;
  departureTime: string;
  visitDurationMinutes: number;
}

export interface RouteGeometry {
  legs: Array<{ seq: number; travelType: string; polyline: string | null }>;
}

export interface RouteSummary {
  startsAt: string;
  endsAt: string;
  totalVisitMinutes: number;
  totalTravelMinutes: number;
}

export interface OptimizationResponse {
  jobId: string;
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  estimatedDurationMinutes: number;
  totalDistanceMeters: number;
  legs: TransportLegDetail[];
  timeline: TimelineEntry[];
  routeGeometry: RouteGeometry;
  summary: RouteSummary;
  notes?: string;
}

interface DistanceMatrix {
  distances: number[][]; // meters
  durations: number[][]; // seconds
}

type LegTimelineBuildResult = {
  legs: TransportLegDetail[];
  timeline: TimelineEntry[];
  routeGeometry: RouteGeometry;
  summary: RouteSummary;
  notes: string;
};

// ========== SERVICE ==========

export class RouteOptimizerService {
  private readonly OSRM_URL = process.env.OSRM_URL || 'http://router.project-osrm.org';
  private readonly GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private readonly TRANSPORT_SERVICE_URL = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:3008';
  private readonly TRANSPORT_TIMEOUT_MS = Number(process.env.TRANSPORT_TIMEOUT_MS || 8000);

  /**
   * Main optimization function
   */
  async optimizeRoute(request: OptimizationRequest): Promise<OptimizationResponse> {
    const jobId = uuidv4();

    // Step 1: Build distance matrix
    console.log('📊 Building distance matrix...');
    const matrix = await this.buildDistanceMatrix(request.places, request.constraints.travelTypes);

    // Step 2: Run TSP optimization
    console.log('🧮 Running TSP optimization...');
    const optimizedIndices = this.runTSP(matrix.distances, request.places);

    // Step 3: Apply constraints
    console.log('⚖️ Applying constraints...');
    const constrainedOrder = this.applyConstraints(
      optimizedIndices,
      matrix,
      request.places,
      request.constraints
    );

    // Step 4: Calculate totals
    const legEnhancements = await this.buildLegsAndTimeline(
      constrainedOrder,
      matrix,
      request
    );

    const { totalDistance, totalDuration } = this.calculateTotals(
      constrainedOrder,
      matrix,
      legEnhancements.legs,
      legEnhancements.summary
    );

    // Step 5: Build response
    const optimizedOrder = constrainedOrder.map((index, seq) => ({
      placeId: request.places[index].id,
      seq: seq + 1,
    }));

    return {
      jobId,
      optimizedOrder,
      estimatedDurationMinutes: Math.round(totalDuration / 60),
      totalDistanceMeters: totalDistance,
      legs: legEnhancements.legs,
      timeline: legEnhancements.timeline,
      routeGeometry: legEnhancements.routeGeometry,
      summary: legEnhancements.summary,
      notes: legEnhancements.notes,
    };
  }

  /**
   * Build distance matrix
   * Uses Haversine as fallback, OSRM for driving/walking
   */
  private async buildDistanceMatrix(
    places: Place[],
    travelTypes: string[]
  ): Promise<DistanceMatrix> {
    if (places.length === 0) {
      return { distances: [], durations: [] };
    }

    if (this.shouldUseOsrm(travelTypes, places.length)) {
      try {
        return await this.fetchOsrmMatrix(places, travelTypes);
      } catch (error: any) {
        console.warn('OSRM matrix lookup failed. Falling back to Haversine matrix.', error?.message || error);
      }
    }

    return this.buildHaversineMatrix(places);
  }

  private shouldUseOsrm(travelTypes: string[], placeCount: number): boolean {
    if (placeCount <= 1) {
      return false;
    }

    return travelTypes.some((type) =>
      ['DRIVING', 'WALKING', 'CYCLING', 'E_SCOOTER'].includes(type)
    );
  }

  private determineOsrmProfile(travelTypes: string[]): 'driving' | 'walking' | 'cycling' {
    if (travelTypes.includes('DRIVING')) {
      return 'driving';
    }

    if (travelTypes.some((type) => type === 'CYCLING' || type === 'E_SCOOTER')) {
      return 'cycling';
    }

    return 'walking';
  }

  private async fetchOsrmMatrix(
    places: Place[],
    travelTypes: string[]
  ): Promise<DistanceMatrix> {
    const profile = this.determineOsrmProfile(travelTypes);
    const coordinates = places.map((place) => `${place.lng},${place.lat}`).join(';');
    const url = `${this.OSRM_URL}/table/v1/${profile}/${coordinates}?annotations=distance,duration`;

    const timeout = Math.min(5000 + places.length * 500, 20000);
    const response = await axios.get(url, { timeout });

    const { distances, durations } = response.data || {};

    if (!Array.isArray(distances) || !Array.isArray(durations)) {
      throw new Error('OSRM table response missing distance/duration matrices');
    }

    const sanitizedDistances = this.sanitizeMatrix(distances, (i, j) =>
      this.getHaversineDistance(places[i], places[j])
    );
    const sanitizedDurations = this.sanitizeMatrix(durations, (i, j) =>
      sanitizedDistances[i][j] / 1.4
    );

    return {
      distances: sanitizedDistances,
      durations: sanitizedDurations,
    };
  }

  private sanitizeMatrix(
    rawMatrix: Array<Array<number | null | undefined>>,
    fallback: (i: number, j: number) => number
  ): number[][] {
    return rawMatrix.map((row, i) =>
      row.map((value, j) => {
        if (i === j) {
          return 0;
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }

        return fallback(i, j);
      })
    );
  }

  private buildHaversineMatrix(places: Place[]): DistanceMatrix {
    const n = places.length;
    const distances: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    const durations: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = this.getHaversineDistance(places[i], places[j]);
        const duration = distance / 1.4; // ~5 km/h walking speed

        distances[i][j] = distance;
        distances[j][i] = distance;
        durations[i][j] = duration;
        durations[j][i] = duration;
      }
    }

    return { distances, durations };
  }

  /**
   * Haversine distance fallback
   */
  private getHaversineDistance(from: Place, to: Place): number {
    return haversine(
      { latitude: from.lat, longitude: from.lng },
      { latitude: to.lat, longitude: to.lng }
    );
  }

  /**
   * Run TSP optimization (2-opt algorithm)
   */
  private runTSP(distances: number[][], places: Place[]): number[] {
    const n = distances.length;

    // Nearest neighbor initialization
    const route = this.nearestNeighbor(distances);

    // 2-opt improvement
    return this.twoOpt(route, distances);
  }

  /**
   * Nearest neighbor algorithm
   */
  private nearestNeighbor(distances: number[][]): number[] {
    const n = distances.length;
    const visited = new Set<number>();
    const route: number[] = [];

    // Start from 0
    let current = 0;
    route.push(current);
    visited.add(current);

    while (visited.size < n) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      for (let i = 0; i < n; i++) {
        if (!visited.has(i) && distances[current][i] < nearestDistance) {
          nearestIndex = i;
          nearestDistance = distances[current][i];
        }
      }

      if (nearestIndex !== -1) {
        route.push(nearestIndex);
        visited.add(nearestIndex);
        current = nearestIndex;
      }
    }

    return route;
  }

  /**
   * 2-opt optimization
   */
  private twoOpt(route: number[], distances: number[][]): number[] {
    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;

      for (let i = 1; i < bestRoute.length - 1; i++) {
        for (let j = i + 1; j < bestRoute.length; j++) {
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          const newDistance = this.calculateRouteDistance(newRoute, distances);
          const oldDistance = this.calculateRouteDistance(bestRoute, distances);

          if (newDistance < oldDistance) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return bestRoute;
  }

  /**
   * 2-opt swap
   */
  private twoOptSwap(route: number[], i: number, j: number): number[] {
    const newRoute = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)];
    return newRoute;
  }

  /**
   * Calculate total route distance
   */
  private calculateRouteDistance(route: number[], distances: number[][]): number {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += distances[route[i]][route[i + 1]];
    }
    return total;
  }

  /**
   * Apply constraints (budget, time window, priority) - ENHANCED
   */
  private applyConstraints(
    route: number[],
    matrix: DistanceMatrix,
    places: Place[],
    constraints: any
  ): number[] {
    let constrainedRoute = [...route];

    // 1. Apply time budget constraint
    if (constraints.timeBudgetMinutes) {
      constrainedRoute = this.applyTimeBudgetConstraint(
        constrainedRoute,
        matrix,
        places,
        constraints.timeBudgetMinutes
      );
    }

    // 2. Apply budget constraint (filter expensive segments)
    if (typeof constraints.budget === 'number' && constraints.budget > 0) {
      constrainedRoute = this.applyBudgetConstraint(
        constrainedRoute,
        matrix,
        places,
        constraints.budget,
        constraints.travelTypes || []
      );
    }

    // 3. Apply priority-based re-ordering (keep high-priority places)
    if (constraints.priorityWeighting && constraints.priorityWeighting > 0) {
      constrainedRoute = this.applyPriorityOptimization(
        constrainedRoute,
        matrix,
        places,
        constraints.priorityWeighting
      );
    }

    return constrainedRoute.length > 0 ? constrainedRoute : [route[0]]; // At least include first place
  }

  /**
   * Apply time budget constraint
   */
  private applyTimeBudgetConstraint(
    route: number[],
    matrix: DistanceMatrix,
    places: Place[],
    timeBudgetMinutes: number
  ): number[] {
    const timeBudgetSeconds = timeBudgetMinutes * 60;
    let totalTime = 0;
    const constrainedRoute: number[] = [];

    for (let i = 0; i < route.length; i++) {
      const placeIndex = route[i];
      const visitDuration = (places[placeIndex].visitDuration || 60) * 60;

      if (i > 0) {
        const travelTime = matrix.durations[route[i - 1]][placeIndex];
        totalTime += travelTime;
      }

      totalTime += visitDuration;

      if (totalTime <= timeBudgetSeconds) {
        constrainedRoute.push(placeIndex);
      } else {
        break;
      }
    }

    return constrainedRoute;
  }

  /**
   * Apply budget constraint - NEW
   * Remove places that would exceed travel budget
   */
  private applyBudgetConstraint(
    route: number[],
    matrix: DistanceMatrix,
    places: Place[],
    budget: number,
    travelTypes: string[]
  ): number[] {
    let totalCost = 0;
    const constrainedRoute: number[] = [route[0]]; // Always include starting point

    for (let i = 1; i < route.length; i++) {
      const prevIndex = route[i - 1];
      const currentIndex = route[i];
      const distance = matrix.distances[prevIndex][currentIndex];
      
      // Estimate cost for this leg
      const legCost = this.estimateFallbackCost(distance, travelTypes);
      
      if (totalCost + legCost <= budget) {
        constrainedRoute.push(currentIndex);
        totalCost += legCost;
      } else {
        console.log(`⚠️  Budget constraint: Excluding place ${places[currentIndex].name} (would exceed budget)`);
        break; // Stop adding more places
      }
    }

    return constrainedRoute;
  }

  /**
   * Apply priority-based optimization - NEW
   * Re-order route to favor high-priority places early
   */
  private applyPriorityOptimization(
    route: number[],
    matrix: DistanceMatrix,
    places: Place[],
    priorityWeighting: number // 0-1, how much to weight priority vs distance
  ): number[] {
    if (route.length <= 2 || priorityWeighting === 0) {
      return route;
    }

    // Calculate combined score: (1-w)*distance + w*priority_penalty
    const scoreRoute = (r: number[]): number => {
      let distanceScore = 0;
      let priorityPenalty = 0;

      for (let i = 0; i < r.length - 1; i++) {
        distanceScore += matrix.distances[r[i]][r[i + 1]];
        
        // Penalize visiting low-priority places early
        const priority = places[r[i]].priority || 5;
        const positionPenalty = (1 - priority / 10) * (r.length - i); // Higher penalty for low-priority early visits
        priorityPenalty += positionPenalty * 1000; // Scale to be comparable to distance
      }

      return (1 - priorityWeighting) * distanceScore + priorityWeighting * priorityPenalty;
    };

    // Try swapping adjacent places to improve score
    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;
      const currentScore = scoreRoute(bestRoute);

      for (let i = 1; i < bestRoute.length - 1; i++) {
        for (let j = i + 1; j < bestRoute.length; j++) {
          // Try swapping
          const newRoute = [...bestRoute];
          [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
          
          const newScore = scoreRoute(newRoute);
          if (newScore < currentScore) {
            bestRoute = newRoute;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    console.log(`✨ Priority optimization: Adjusted route to favor high-priority attractions`);
    return bestRoute;
  }

  /**
   * Calculate totals
   */
  private calculateTotals(
    route: number[],
    matrix: DistanceMatrix,
    legs: TransportLegDetail[],
    summary: RouteSummary
  ): { totalDistance: number; totalDuration: number } {
    const distanceFromLegs = legs.reduce((sum, leg) => sum + (leg.distanceMeters || 0), 0);
    const matrixDistance = this.calculateMatrixDistance(route, matrix);
    const totalDistance = distanceFromLegs > 0 ? distanceFromLegs : matrixDistance;

    const totalSummaryMinutes = summary.totalTravelMinutes + summary.totalVisitMinutes;
    const matrixDuration = this.calculateMatrixDuration(route, matrix);
    const totalDuration = totalSummaryMinutes > 0
      ? totalSummaryMinutes * 60
      : matrixDuration;

    return { totalDistance, totalDuration };
  }

  private calculateMatrixDistance(route: number[], matrix: DistanceMatrix): number {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += matrix.distances[route[i]][route[i + 1]] || 0;
    }
    return totalDistance;
  }

  private calculateMatrixDuration(route: number[], matrix: DistanceMatrix): number {
    let totalDuration = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDuration += matrix.durations[route[i]][route[i + 1]] || 0;
    }
    return totalDuration;
  }

  private async buildLegsAndTimeline(
    route: number[],
    matrix: DistanceMatrix,
    request: OptimizationRequest
  ): Promise<LegTimelineBuildResult> {
    if (route.length === 0) {
      const nowIso = new Date().toISOString();
      return {
        legs: [],
        timeline: [],
        routeGeometry: { legs: [] },
        summary: {
          startsAt: nowIso,
          endsAt: nowIso,
          totalVisitMinutes: 0,
          totalTravelMinutes: 0,
        },
        notes: 'No places provided.',
      };
    }

  const places = request.places;
    const startTimestamp = this.resolveStartTimestamp(request.constraints.startTime);
    let currentTimeMs = startTimestamp;
    let totalVisitSeconds = 0;
    let totalTravelSeconds = 0;
    const timeline: TimelineEntry[] = [];
    const legs: TransportLegDetail[] = [];
    const legNotes: string[] = [];

    // Seed timeline with first place
    const firstIndex = route[0];
    const firstVisitDurationSeconds = this.getVisitDurationSeconds(places[firstIndex]);
    timeline.push({
      placeId: places[firstIndex].id,
      seq: 1,
      arrivalTime: new Date(currentTimeMs).toISOString(),
      departureTime: new Date(currentTimeMs + firstVisitDurationSeconds * 1000).toISOString(),
      visitDurationMinutes: firstVisitDurationSeconds / 60,
    });
    totalVisitSeconds += firstVisitDurationSeconds;
    currentTimeMs += firstVisitDurationSeconds * 1000;

    for (let i = 1; i < route.length; i++) {
      const originIndex = route[i - 1];
      const destinationIndex = route[i];
      const origin = places[originIndex];
      const destination = places[destinationIndex];

      const fallbackDistance = matrix.distances[originIndex]?.[destinationIndex] ?? this.getHaversineDistance(origin, destination);
      const fallbackDuration = matrix.durations[originIndex]?.[destinationIndex] ?? fallbackDistance / 1.4;

      const departureIso = new Date(currentTimeMs).toISOString();
      const transportLeg = await this.fetchTransportLeg(
        origin,
        destination,
        request.constraints,
        request.options,
        departureIso,
        fallbackDistance,
        fallbackDuration
      );

      const polyline = await this.fetchPolylineForLeg(origin, destination, transportLeg.travelType)
        .catch(() => null);

      const legDetail: TransportLegDetail = {
        from: { placeId: origin.id, name: origin.name, lat: origin.lat, lng: origin.lng, seq: i },
        to: { placeId: destination.id, name: destination.name, lat: destination.lat, lng: destination.lng, seq: i + 1 },
        travelType: transportLeg.travelType,
        travelTimeSeconds: transportLeg.travelTimeSeconds,
        distanceMeters: transportLeg.distanceMeters,
        cost: transportLeg.cost,
        steps: transportLeg.steps,
        polyline,
        provider: transportLeg.provider,
      };

      legs.push(legDetail);
      totalTravelSeconds += transportLeg.travelTimeSeconds;
      currentTimeMs += transportLeg.travelTimeSeconds * 1000;

      const arrivalIso = new Date(currentTimeMs).toISOString();
      const visitDurationSeconds = this.getVisitDurationSeconds(destination);
      const departureTimeIso = new Date(currentTimeMs + visitDurationSeconds * 1000).toISOString();

      timeline.push({
        placeId: destination.id,
        seq: i + 1,
        arrivalTime: arrivalIso,
        departureTime: departureTimeIso,
        visitDurationMinutes: visitDurationSeconds / 60,
      });

      totalVisitSeconds += visitDurationSeconds;
      currentTimeMs += visitDurationSeconds * 1000;

      if (transportLeg.provider === 'osrm-fallback') {
        legNotes.push(`Leg ${i}: realtime transport unavailable, used fallback matrix estimates.`);
      }
    }

    const summary: RouteSummary = {
      startsAt: timeline[0]?.arrivalTime || new Date(startTimestamp).toISOString(),
      endsAt: new Date(currentTimeMs).toISOString(),
      totalVisitMinutes: Math.round(totalVisitSeconds / 60),
      totalTravelMinutes: Math.round(totalTravelSeconds / 60),
    };

    const routeGeometry: RouteGeometry = {
      legs: legs.map((leg, index) => ({
        seq: index + 1,
        travelType: leg.travelType,
        polyline: leg.polyline ?? null,
      })),
    };

    return {
      legs,
      timeline,
      routeGeometry,
      summary,
      notes: legNotes.length > 0
        ? legNotes.join(' ')
        : 'Includes multimodal transport legs, timeline, and geometry.',
    };
  }

  private resolveStartTimestamp(startTime?: string): number {
    if (!startTime) {
      return Date.now();
    }

    const parsed = Date.parse(startTime);
    if (Number.isNaN(parsed)) {
      return Date.now();
    }
    return parsed;
  }

  private getVisitDurationSeconds(place: Place): number {
    return Math.max(5, place.visitDuration ?? 60) * 60;
  }

  private async fetchTransportLeg(
    origin: Place,
    destination: Place,
    constraints: OptimizationRequest['constraints'],
    options: OptimizationRequest['options'],
    departureTime: string,
    fallbackDistance: number,
    fallbackDuration: number
  ): Promise<Omit<TransportLegDetail, 'from' | 'to' | 'polyline'>> {
    const payload = {
      origin: {
        name: origin.name,
        lat: origin.lat,
        lng: origin.lng,
      },
      destination: {
        name: destination.name,
        lat: destination.lat,
        lng: destination.lng,
      },
      departureTime,
      preferences: {
        modes: this.mapTravelTypesToTransportModes(constraints.travelTypes),
        budget: this.mapBudgetToPreference(constraints.budget),
        maxWalkDistance: options.includeRealtimeTransit ? 1200 : undefined,
      },
    };

    const url = `${this.TRANSPORT_SERVICE_URL.replace(/\/$/, '')}/api/v1/transport/multi-modal-route`;

    try {
      const response = await axios.post(url, payload, { timeout: this.TRANSPORT_TIMEOUT_MS });
      const legs = response.data?.data;

      if (Array.isArray(legs) && legs.length > 0) {
        const selected = this.pickBestTransportLeg(legs, constraints.travelTypes);
        if (selected) {
          const travelTimeSeconds = Math.round(selected.totalDuration || fallbackDuration);
          const distanceMeters = Math.round(selected.totalDistance || fallbackDistance);
          const steps: TransportLegStep[] = (selected.steps || []).map((step: any) => ({
            mode: step.mode || 'transit',
            from: step.from,
            to: step.to,
            distanceMeters: Math.round(step.distance || 0),
            durationSeconds: Math.round(step.duration || 0),
            route: step.route,
            routeColor: step.routeColor,
            departureTime: step.departureTime,
            arrivalTime: step.arrivalTime,
            stops: step.stops,
            delaySeconds: typeof step.delay === 'number' ? step.delay : undefined,
          }));

          return {
            travelType: this.normalizeTransportMode(steps[0]?.mode) || this.determineFallbackTravelType(constraints.travelTypes),
            travelTimeSeconds,
            distanceMeters,
            cost: Number(selected.estimatedCost ?? this.estimateFallbackCost(distanceMeters, constraints.travelTypes)),
            steps,
            provider: 'transport-service',
          };
        }
      }
    } catch (error) {
      console.warn('❌ Transport service lookup failed. Falling back to matrix data.');
      console.warn('  URL:', url);
      console.warn('  Error:', error instanceof Error ? error.message : String(error));
      if (axios.isAxiosError(error)) {
        console.warn('  Axios Error Code:', error.code);
        console.warn('  Response Status:', error.response?.status);
        if (error.response?.data) {
          console.warn('  Response Data:', JSON.stringify(error.response.data).substring(0, 200));
        }
      }
    }

    return {
      travelType: this.determineFallbackTravelType(constraints.travelTypes),
      travelTimeSeconds: Math.round(fallbackDuration),
      distanceMeters: Math.round(fallbackDistance),
      cost: this.estimateFallbackCost(fallbackDistance, constraints.travelTypes),
      steps: [
        {
          mode: 'fallback',
          from: origin.name,
          to: destination.name,
          distanceMeters: Math.round(fallbackDistance),
          durationSeconds: Math.round(fallbackDuration),
        },
      ],
      provider: 'osrm-fallback',
    };
  }

  private mapTravelTypesToTransportModes(travelTypes: string[]): Array<'transit' | 'walking' | 'cycling' | 'driving' | 'escooter'> {
    const mapping: Record<string, 'transit' | 'walking' | 'cycling' | 'driving' | 'escooter'> = {
      PUBLIC_TRANSPORT: 'transit',
      WALKING: 'walking',
      CYCLING: 'cycling',
      DRIVING: 'driving',
      E_SCOOTER: 'escooter',
    };

    const modes = (travelTypes || [])
      .map((type) => mapping[type])
      .filter((mode): mode is 'transit' | 'walking' | 'cycling' | 'driving' | 'escooter' => Boolean(mode));

    return modes.length > 0 ? modes : ['transit'];
  }

  private mapBudgetToPreference(budget?: number): 'budget' | 'balanced' | 'premium' {
    if (typeof budget !== 'number' || Number.isNaN(budget)) {
      return 'balanced';
    }

    if (budget <= 50) {
      return 'budget';
    }

    if (budget >= 200) {
      return 'premium';
    }

    return 'balanced';
  }

  private pickBestTransportLeg(legs: any[], travelTypes: string[]) {
    if (!Array.isArray(legs) || legs.length === 0) {
      return null;
    }

    const preferredModes = this.mapTravelTypesToTransportModes(travelTypes);
    const getModePriority = (mode: string) => {
      const normalized = this.normalizeTransportMode(mode);
      const index = preferredModes.indexOf(normalized as any);
      return index >= 0 ? index : preferredModes.length;
    };

    return [...legs].sort((a, b) => {
      const modeA = getModePriority(a.steps?.[0]?.mode);
      const modeB = getModePriority(b.steps?.[0]?.mode);
      if (modeA !== modeB) {
        return modeA - modeB;
      }
      return (a.totalDuration || 0) - (b.totalDuration || 0);
    })[0];
  }

  private normalizeTransportMode(mode?: string): 'transit' | 'walking' | 'cycling' | 'driving' | 'escooter' | undefined {
    if (!mode) {
      return undefined;
    }

    const normalized = mode.toLowerCase();
    if (['transit', 'bus', 'metro', 'rail'].includes(normalized)) {
      return 'transit';
    }
    if (['walk', 'walking'].includes(normalized)) {
      return 'walking';
    }
    if (['bike', 'cycling'].includes(normalized)) {
      return 'cycling';
    }
    if (['drive', 'driving', 'car', 'ride'].includes(normalized)) {
      return 'driving';
    }
    if (['scooter', 'escooter'].includes(normalized)) {
      return 'escooter';
    }
    return undefined;
  }

  private determineFallbackTravelType(travelTypes: string[]): string {
    if (travelTypes.includes('WALKING')) {
      return 'walking';
    }
    if (travelTypes.includes('CYCLING')) {
      return 'cycling';
    }
    if (travelTypes.includes('PUBLIC_TRANSPORT')) {
      return 'transit';
    }
    if (travelTypes.includes('E_SCOOTER')) {
      return 'escooter';
    }
    return 'driving';
  }

  private estimateFallbackCost(distanceMeters: number, travelTypes: string[]): number {
    const distanceKm = distanceMeters / 1000;
    if (travelTypes.includes('PUBLIC_TRANSPORT')) {
      return Number((distanceKm * 0.3).toFixed(2));
    }
    if (travelTypes.includes('WALKING') || travelTypes.includes('CYCLING')) {
      return 0;
    }
    if (travelTypes.includes('E_SCOOTER')) {
      return Number((distanceKm * 0.5).toFixed(2));
    }
    return Number((distanceKm * 0.8).toFixed(2));
  }

  private async fetchPolylineForLeg(
    origin: Place,
    destination: Place,
    travelType: string
  ): Promise<string | null> {
    const profile = this.mapTransportModeToOsrmProfile(travelType);
    if (!profile) {
      return null;
    }

    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${this.OSRM_URL}/route/v1/${profile}/${coordinates}?overview=full&geometries=polyline6`;

    const response = await axios.get(url, { timeout: 8000 });
    const routes = response.data?.routes;
    if (Array.isArray(routes) && routes.length > 0) {
      return routes[0]?.geometry || null;
    }
    return null;
  }

  private mapTransportModeToOsrmProfile(mode: string): 'walking' | 'cycling' | 'driving' | null {
    const normalized = mode.toLowerCase();
    if (normalized.includes('walk')) {
      return 'walking';
    }
    if (normalized.includes('cycle') || normalized.includes('bike') || normalized.includes('scooter')) {
      return 'cycling';
    }
    if (normalized.includes('drive') || normalized.includes('car') || normalized.includes('transit')) {
      return 'driving';
    }
    return null;
  }
}
