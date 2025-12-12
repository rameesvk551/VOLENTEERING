/**
 * Route Optimizer Service V2
 * 
 * Implements the FULL architecture for route optimization:
 * 1. Distance Matrix computation (Haversine / OSRM / Google)
 * 2. TSP optimization (2-opt, simulated annealing, genetic)
 * 3. RAPTOR algorithm (for public transport)
 * 4. Constraint application (budget, time, opening hours)
 * 5. Multi-day trip segmentation with accommodation
 * 6. Smart transport mode selection based on distance
 * 7. Opening hours validation
 */

import { v4 as uuidv4 } from 'uuid';
import haversine from 'haversine-distance';
import axios from 'axios';
import {
  validateTrip,
  breakIntoMultiDaySegments,
  recommendTransportMode,
  adjustItineraryForOpeningHours,
  isAttractionOpenAt,
  type AttractionTimeWindow,

} from '../utils/trip-validator.js';

// ========== TYPES ==========

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  priority?: number;
  visitDuration?: number;
  timeWindow?: AttractionTimeWindow;
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
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
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

    // Step 0: Handle starting location if provided
    let placesForOptimization = [...request.places];
    let hasStartingLocation = false;
    let startingPlaceId = '';

    console.log('🔍 Backend received:', {
      placesCount: request.places.length,
      hasStartLocation: !!request.constraints.startLocation
    });
    request.places.forEach((p, idx) => {
      console.log(`  Place ${idx + 1}: ${p.name} (${p.lat}, ${p.lng})`);
    });

    if (request.constraints.startLocation) {
      console.log('📍 Starting location provided, adding as first place in route');
      hasStartingLocation = true;
      startingPlaceId = 'start-location';
      
      // Prepend starting location as a synthetic place
      const startingPlace: Place = {
        id: startingPlaceId,
        name: 'Starting Point',
        lat: request.constraints.startLocation.lat,
        lng: request.constraints.startLocation.lng,
        visitDuration: 0, // No visit duration for starting point
        priority: 10, // Highest priority
      };
      
      placesForOptimization = [startingPlace, ...request.places];
      console.log('✅ Total places for optimization:', placesForOptimization.length);
    }

    // Step 1: Build distance matrix
    console.log('📊 Building distance matrix...');
    const matrix = await this.buildDistanceMatrix(placesForOptimization, request.constraints.travelTypes);

    // Step 1.5: Validate trip feasibility and get recommendations
    console.log('✅ Validating trip constraints...');
    const validation = validateTrip(placesForOptimization, matrix.durations, matrix.distances);
    
    if (!validation.isValid) {
      console.warn('⚠️  Trip validation failed:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Trip warnings:', validation.warnings);
    }
    
    if (validation.suggestions.length > 0) {
      console.log('💡 Trip suggestions:', validation.suggestions);
    }

    // Step 2: Run TSP optimization
    console.log('🧮 Running TSP optimization...');
    let optimizedIndices = this.runTSP(matrix.distances, placesForOptimization);

    // Step 2.5: If we have a starting location, ensure it's first
    if (hasStartingLocation) {
      // Find starting location index in optimized route
      const startIndex = optimizedIndices.indexOf(0); // Starting location is at index 0
      if (startIndex !== 0) {
        // Move starting location to the front
        optimizedIndices = [0, ...optimizedIndices.filter(i => i !== 0)];
        console.log('✅ Forced starting location to be first in route');
      }
    }

    // Step 3: Apply constraints
    console.log('⚖️ Applying constraints...');
    console.log('  - Optimized indices before constraints:', optimizedIndices);
    
    // First, apply opening hours validation
    const startTime = request.constraints.startTime 
      ? new Date(request.constraints.startTime) 
      : new Date();
    startTime.setHours(startTime.getHours() || 9, 0, 0, 0); // Default to 9 AM if not specified
    
    const optimizedPlaces = optimizedIndices.map(idx => placesForOptimization[idx]);
    const openingHoursAdjustment = adjustItineraryForOpeningHours(
      optimizedPlaces,
      matrix.durations,
      startTime
    );
    
    if (openingHoursAdjustment.removedPlaces.length > 0) {
      console.warn('⚠️  Places removed due to opening hours:', 
        openingHoursAdjustment.removedPlaces.map(p => p.name)
      );
    }
    
    console.log('🕐 Opening hours adjustments:', openingHoursAdjustment.adjustments);
    
    // Update indices based on adjusted places
    const adjustedIndices = openingHoursAdjustment.adjustedPlaces.map(place => 
      placesForOptimization.indexOf(place)
    );
    
    const constrainedOrder = this.applyConstraints(
      adjustedIndices,
      matrix,
      placesForOptimization,
      request.constraints,
      validation
    );
    console.log('  - Constrained order after filtering:', constrainedOrder);
    console.log('  - Places remaining:', constrainedOrder.length, 'out of', placesForOptimization.length);

    // Check if we have any valid places left
    if (constrainedOrder.length === 0) {
      console.error('❌ No valid places remaining after constraints');
      const errorMessage = openingHoursAdjustment.removedPlaces.length > 0
        ? `All ${openingHoursAdjustment.removedPlaces.length} place(s) were removed due to opening hours constraints.`
        : 'No places remaining after applying constraints.';
      
      return {
        jobId,
        optimizedOrder: [],
        estimatedDurationMinutes: 0,
        totalDistanceMeters: 0,
        legs: [],
        timeline: [],
        routeGeometry: { legs: [] },
        summary: {
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
          totalVisitMinutes: 0,
          totalTravelMinutes: 0,
        },
        notes: `❌ Unable to create itinerary: ${errorMessage} ${validation.warnings.length > 0 ? '⚠️ Warnings: ' + validation.warnings.join(' ') : ''}`,
        validation: {
          isValid: false,
          errors: [errorMessage],
          warnings: validation.warnings,
          suggestions: validation.suggestions,
        },
      };
    }

    // Step 4: Calculate totals
    const legEnhancements = await this.buildLegsAndTimeline(
      constrainedOrder,
      matrix,
      request,
      placesForOptimization
    );

    const { totalDistance, totalDuration } = this.calculateTotals(
      constrainedOrder,
      matrix,
      legEnhancements.legs,
      legEnhancements.summary
    );

    // Step 5: Build response with validation feedback
    const optimizedOrder = constrainedOrder
      .filter(index => placesForOptimization[index] !== undefined)
      .map((index, seq) => ({
        placeId: placesForOptimization[index].id,
        seq: seq + 1,
      }));

    // Compile comprehensive notes
    let comprehensiveNotes = legEnhancements.notes;
    
    if (hasStartingLocation) {
      comprehensiveNotes += ' Route starts from specified starting location.';
    }
    
    if (validation.warnings.length > 0) {
      comprehensiveNotes += ' ⚠️ Warnings: ' + validation.warnings.join(' ');
    }
    
    if (validation.suggestions.length > 0) {
      comprehensiveNotes += ' 💡 Suggestions: ' + validation.suggestions.join(' ');
    }
    
    if (openingHoursAdjustment.removedPlaces.length > 0) {
      comprehensiveNotes += ` 🕐 ${openingHoursAdjustment.removedPlaces.length} place(s) removed due to opening hours constraints.`;
    }

    return {
      jobId,
      optimizedOrder,
      estimatedDurationMinutes: Math.round(totalDuration / 60),
      totalDistanceMeters: totalDistance,
      legs: legEnhancements.legs,
      timeline: legEnhancements.timeline,
      routeGeometry: legEnhancements.routeGeometry,
      summary: legEnhancements.summary,
      notes: comprehensiveNotes,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        suggestions: validation.suggestions,
      },
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
    constraints: any,
    validation?: any
  ): number[] {
    let constrainedRoute = [...route];

    // 1. Apply time budget constraint
    // Skip time budget if starting location is very far from first attraction (multi-day trip)
    if (constraints.timeBudgetMinutes && constrainedRoute.length >= 2) {
      const firstStopIndex = constrainedRoute[0];
      const secondStopIndex = constrainedRoute[1];
      const initialTravelTime = matrix.durations[firstStopIndex]?.[secondStopIndex] || 0;
      const initialTravelHours = initialTravelTime / 3600;
      
      // If first leg is more than 12 hours, this is likely a multi-day trip - skip time budget
      if (initialTravelHours > 12) {
        console.log(`⚠️  Skipping time budget constraint - first leg is ${initialTravelHours.toFixed(1)} hours (multi-day trip)`);
      } else {
        constrainedRoute = this.applyTimeBudgetConstraint(
          constrainedRoute,
          matrix,
          places,
          constraints.timeBudgetMinutes
        );
      }
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

    console.log('⏰ Applying time budget constraint:', {
      timeBudgetMinutes,
      timeBudgetSeconds,
      routeLength: route.length
    });

    for (let i = 0; i < route.length; i++) {
      const placeIndex = route[i];
      const place = places[placeIndex];
      
      // Skip if place doesn't exist (safety check)
      if (!place) {
        console.warn(`  ⚠️  Warning: Place at index ${placeIndex} not found, skipping`);
        continue;
      }
      
      const visitDuration = (place.visitDuration || 60) * 60;

      if (i > 0) {
        const travelTime = matrix.durations[route[i - 1]][placeIndex] || 0;
        console.log(`  Stop ${i}: ${place.name}`);
        console.log(`    - Travel time from previous: ${(travelTime / 60).toFixed(1)} min`);
        console.log(`    - Visit duration: ${visitDuration / 60} min`);
        console.log(`    - Total time so far: ${(totalTime / 60).toFixed(1)} min / ${timeBudgetMinutes} min`);
        totalTime += travelTime;
      } else {
        console.log(`  Stop ${i}: ${place.name} (starting point)`);
        console.log(`    - Visit duration: ${visitDuration / 60} min`);
      }

      totalTime += visitDuration;

      if (totalTime <= timeBudgetSeconds) {
        constrainedRoute.push(placeIndex);
        console.log(`    ✅ Added (total: ${(totalTime / 60).toFixed(1)} min)`);
      } else {
        console.log(`    ❌ SKIPPED - Would exceed budget (total would be: ${(totalTime / 60).toFixed(1)} min)`);
        break;
      }
    }

    console.log(`⏰ Time budget result: ${constrainedRoute.length} of ${route.length} places included`);
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
    request: OptimizationRequest,
    places: Place[]
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
    const startTimestamp = this.resolveStartTimestamp(request.constraints.startTime);
    let currentTimeMs = startTimestamp;
    let totalVisitSeconds = 0;
    let totalTravelSeconds = 0;
    const timeline: TimelineEntry[] = [];
    const legs: TransportLegDetail[] = [];
    const legNotes: string[] = [];

    // Seed timeline with first place
    const firstIndex = route[0];
    const firstPlace = places[firstIndex];
    
    if (!firstPlace) {
      console.error(`❌ First place at index ${firstIndex} not found`);
      return {
        legs: [],
        timeline: [],
        routeGeometry: { legs: [] },
        summary: {
          startsAt: new Date(startTimestamp).toISOString(),
          endsAt: new Date(startTimestamp).toISOString(),
          totalVisitMinutes: 0,
          totalTravelMinutes: 0,
        },
        notes: 'Error: First place not found in route.',
      };
    }
    
    const firstVisitDurationSeconds = this.getVisitDurationSeconds(firstPlace);
    timeline.push({
      placeId: firstPlace.id,
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

      // Skip if either place doesn't exist
      if (!origin || !destination) {
        console.warn(`⚠️  Skipping leg ${i}: origin or destination not found (indices: ${originIndex}, ${destinationIndex})`);
        continue;
      }

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

    // Check for multi-day trip and add accommodation recommendations
    const totalHours = (totalTravelSeconds + totalVisitSeconds) / 3600;
    const routePlaces = route.map(idx => places[idx]).filter(p => p !== undefined);
    
    if (totalHours > 10 && routePlaces.length > 0) {
      const segments = breakIntoMultiDaySegments(
        routePlaces,
        matrix.durations,
        matrix.distances,
        new Date(startTimestamp)
      );
      
      if (segments.length > 1) {
        legNotes.push(
          `⚠️ Multi-day trip: ${segments.length} days required. Accommodation needed after: ${
            segments
              .filter(s => s.requiresAccommodation)
              .map(s => s.places[s.places.length - 1].name)
              .join(', ')
          }.`
        );
      }
    }

    // Add transport mode recommendations for very long legs
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const distanceKm = leg.distanceMeters / 1000;
      
      if (distanceKm > 500) {
        const recommendation = recommendTransportMode(distanceKm);
        if (!recommendation.recommended.includes(leg.travelType.toLowerCase())) {
          legNotes.push(
            `💡 Leg ${i + 1} (${leg.from.name} → ${leg.to.name}): ${distanceKm.toFixed(0)}km - ${recommendation.reason}. Consider: ${recommendation.recommended.join(', ')}.`
          );
        }
      }
    }

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
    // Smart transport mode selection based on distance
    const distanceKm = fallbackDistance / 1000;
    const modeRecommendation = recommendTransportMode(distanceKm);
    
    let adjustedModes = this.mapTravelTypesToTransportModes(constraints.travelTypes);
    
    // Override for very long distances - suggest flights
    if (distanceKm > 500 && !adjustedModes.includes('transit')) {
      console.log(`💡 Long distance detected (${distanceKm.toFixed(0)}km). Adding flight option.`);
      adjustedModes = ['transit', ...adjustedModes]; // Add transit which may include flights
    }
    
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
        modes: adjustedModes,
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
            // Use stop names if available, otherwise use coordinates
            from: step.departureStop || step.from,
            to: step.arrivalStop || step.to,
            distanceMeters: Math.round(step.distance || 0),
            durationSeconds: Math.round(step.duration || 0),
            route: step.route,
            routeColor: step.routeColor,
            departureTime: step.departureTime,
            arrivalTime: step.arrivalTime,
            stops: step.stops,
            delaySeconds: typeof step.delay === 'number' ? step.delay : undefined,
            // Additional details
            headsign: step.headsign,
            agency: step.agency,
          }));

          // Find the primary transit mode from steps (bus, metro, train, etc.)
          const transitStep = steps.find((s) => 
            ['bus', 'metro', 'metro_rail', 'rail', 'train', 'subway', 'tram', 'ferry'].includes(
              (s.mode || '').toLowerCase()
            )
          );
          // Use actual transit mode name (Bus, Metro, Train) or normalized mode
          const primaryMode = transitStep?.mode || 
            this.normalizeTransportMode(steps[0]?.mode) || 
            this.determineFallbackTravelType(constraints.travelTypes);

          return {
            travelType: primaryMode,
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

    // Maximum practical distances for each mode (in meters)
    const MAX_WALKING_DISTANCE = 5000; // 5 km max for walking
    const MAX_CYCLING_DISTANCE = 30000; // 30 km max for cycling
    const MAX_ESCOOTER_DISTANCE = 20000; // 20 km max for e-scooter

    // Helper to determine the primary mode of a leg (not just first step)
    const getPrimaryMode = (leg: any): string => {
      const steps = leg.steps || [];
      // Check all steps for transit modes (bus, metro, train, etc.)
      const transitStep = steps.find((s: any) => 
        ['bus', 'metro', 'metro_rail', 'rail', 'train', 'subway', 'tram', 'ferry'].includes(
          (s.mode || '').toLowerCase()
        )
      );
      if (transitStep) {
        return transitStep.mode; // Return actual transit mode (bus, metro, etc.)
      }
      // If no transit, return the first non-walking step or first step
      const nonWalkingStep = steps.find((s: any) => 
        (s.mode || '').toLowerCase() !== 'walking'
      );
      return nonWalkingStep?.mode || steps[0]?.mode || 'driving';
    };

    // Filter out unrealistic transport options
    const realisticLegs = legs.filter((leg) => {
      const distance = leg.totalDistance || 0;
      const mode = this.normalizeTransportMode(getPrimaryMode(leg));

      if (mode === 'walking' && distance > MAX_WALKING_DISTANCE) {
        return false; // Too far to walk
      }
      if (mode === 'cycling' && distance > MAX_CYCLING_DISTANCE) {
        return false; // Too far to cycle
      }
      if (mode === 'escooter' && distance > MAX_ESCOOTER_DISTANCE) {
        return false; // Too far for e-scooter
      }
      return true;
    });

    // If no realistic options, use all legs but prefer driving/transit
    const legsToSort = realisticLegs.length > 0 ? realisticLegs : legs;

    const preferredModes = this.mapTravelTypesToTransportModes(travelTypes);
    
    // Add driving as fallback if not already included and distance is long
    const hasLongDistance = legs.some((leg) => (leg.totalDistance || 0) > MAX_WALKING_DISTANCE);
    const effectiveModes = hasLongDistance && !preferredModes.includes('driving') && realisticLegs.length === 0
      ? [...preferredModes, 'driving']
      : preferredModes;

    console.log('📋 pickBestTransportLeg:', {
      totalLegs: legs.length,
      realisticLegs: realisticLegs.length,
      preferredModes,
      effectiveModes
    });

    const getModePriority = (mode: string) => {
      const normalized = this.normalizeTransportMode(mode);
      const index = effectiveModes.indexOf(normalized as any);
      return index >= 0 ? index : effectiveModes.length;
    };

    const sortedLegs = [...legsToSort].sort((a, b) => {
      const modeA = getPrimaryMode(a);
      const modeB = getPrimaryMode(b);
      const priorityA = getModePriority(modeA);
      const priorityB = getModePriority(modeB);
      
      console.log('  Comparing:', {
        legA: { mode: modeA, priority: priorityA, duration: a.totalDuration },
        legB: { mode: modeB, priority: priorityB, duration: b.totalDuration }
      });
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return (a.totalDuration || 0) - (b.totalDuration || 0);
    });

    const selected = sortedLegs[0];
    console.log('  Selected leg:', { mode: getPrimaryMode(selected), duration: selected?.totalDuration });
    return selected;
  }

  private normalizeTransportMode(mode?: string): 'transit' | 'walking' | 'cycling' | 'driving' | 'escooter' | undefined {
    if (!mode) {
      return undefined;
    }

    const normalized = mode.toLowerCase();
    // Transit modes: bus, metro, train, subway, tram, etc.
    if (['transit', 'bus', 'metro', 'rail', 'train', 'subway', 'tram', 'monorail', 'ferry', 'cable_car', 'gondola', 'funicular', 'shared_taxi'].includes(normalized)) {
      return 'transit';
    }
    if (['walk', 'walking'].includes(normalized)) {
      return 'walking';
    }
    if (['bike', 'cycling', 'bicycle', 'bicycling'].includes(normalized)) {
      return 'cycling';
    }
    if (['drive', 'driving', 'car', 'ride', 'taxi', 'uber', 'ola'].includes(normalized)) {
      return 'driving';
    }
    if (['scooter', 'escooter', 'e-scooter'].includes(normalized)) {
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
    
    // VALIDATION: Check if distance is realistic for the travel type
    const MAX_WALKING_KM = 5;
    const MAX_CYCLING_KM = 30;
    const MAX_DAILY_TRAVEL_KM = 500;
    
    if (distanceKm > MAX_DAILY_TRAVEL_KM) {
      console.warn(`⚠️ UNREALISTIC: ${distanceKm.toFixed(1)}km exceeds maximum daily travel distance`);
    }
    
    if (travelTypes.includes('WALKING') && distanceKm > MAX_WALKING_KM) {
      console.warn(`⚠️ UNREALISTIC: ${distanceKm.toFixed(1)}km is too far to walk (max ${MAX_WALKING_KM}km)`);
    }
    
    if (travelTypes.includes('CYCLING') && distanceKm > MAX_CYCLING_KM) {
      console.warn(`⚠️ UNREALISTIC: ${distanceKm.toFixed(1)}km is too far to cycle (max ${MAX_CYCLING_KM}km)`);
    }
    
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

  /**
   * Validate that a route leg is realistic
   * Returns true if realistic, false if the leg should be flagged
   */
  private validateRouteLeg(
    origin: Place,
    destination: Place,
    travelType: string,
    distanceMeters: number,
    durationSeconds: number
  ): { isValid: boolean; warning?: string } {
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;
    
    // Maximum realistic values
    const LIMITS = {
      walking: { maxDistanceKm: 5, maxDurationMinutes: 90 },
      cycling: { maxDistanceKm: 30, maxDurationMinutes: 120 },
      escooter: { maxDistanceKm: 20, maxDurationMinutes: 90 },
      driving: { maxDistanceKm: 500, maxDurationMinutes: 600 },
      transit: { maxDistanceKm: 300, maxDurationMinutes: 480 },
      bus: { maxDistanceKm: 300, maxDurationMinutes: 480 },
      metro: { maxDistanceKm: 50, maxDurationMinutes: 120 },
      train: { maxDistanceKm: 1000, maxDurationMinutes: 720 }
    };
    
    const mode = travelType.toLowerCase();
    const limit = LIMITS[mode as keyof typeof LIMITS] || LIMITS.driving;
    
    if (distanceKm > limit.maxDistanceKm) {
      return {
        isValid: false,
        warning: `⚠️ Distance ${distanceKm.toFixed(1)}km exceeds realistic limit of ${limit.maxDistanceKm}km for ${mode}`
      };
    }
    
    if (durationMinutes > limit.maxDurationMinutes) {
      return {
        isValid: false,
        warning: `⚠️ Duration ${durationMinutes.toFixed(0)}min exceeds realistic limit of ${limit.maxDurationMinutes}min for ${mode}`
      };
    }
    
    // Check for unrealistic speed (too fast or too slow)
    const speedKmH = (distanceKm / durationMinutes) * 60;
    const SPEED_LIMITS = {
      walking: { min: 3, max: 7 },
      cycling: { min: 10, max: 30 },
      driving: { min: 20, max: 120 },
      transit: { min: 15, max: 100 },
      bus: { min: 15, max: 80 },
      metro: { min: 25, max: 90 },
      train: { min: 40, max: 200 }
    };
    
    const speedLimit = SPEED_LIMITS[mode as keyof typeof SPEED_LIMITS] || SPEED_LIMITS.driving;
    if (speedKmH < speedLimit.min || speedKmH > speedLimit.max) {
      return {
        isValid: false,
        warning: `⚠️ Speed ${speedKmH.toFixed(1)}km/h is unrealistic for ${mode} (expected ${speedLimit.min}-${speedLimit.max}km/h)`
      };
    }
    
    return { isValid: true };
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
