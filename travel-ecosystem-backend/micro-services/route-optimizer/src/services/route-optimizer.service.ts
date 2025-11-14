/**
 * Route Optimizer Service
 * Main service orchestrating route optimization with cost and time calculations
 */

import {
  Attraction,
  RouteOptimizationResult,
  RouteSegment,
  nearestNeighborTSP,
  twoOptOptimization,
  christofidesApproximation,
  geneticAlgorithmTSP,
  priorityBasedOptimization,
  solveTSP,
  simulatedAnnealingTSP,
  tspWithTimeWindows,
  insertionHeuristic,
  multiModalOptimization,
} from '../algorithms/tsp-solver';
import { haversineDistance, calculateRouteDistance, createDistanceMatrix } from '../utils/distance';

export type TravelMethod = 'walk' | 'bike' | 'ride' | 'drive' | 'public_transport';
export type TravelType = 'budget' | 'comfort' | 'luxury' | 'speed';

interface OptimizationOptions {
  budget?: number; // in USD
  travelType: TravelType;
  travelMethod: TravelMethod;
  startTime?: string; // ISO time string
  algorithm?: 'nearest_neighbor' | '2opt' | 'christofides' | 'genetic' | 'priority' | 'simulated_annealing' | 'time_windows' | 'multi_modal' | 'advanced';
  multiModal?: boolean; // Enable multi-modal optimization
  considerTimeWindows?: boolean; // Consider attraction opening hours
}

/**
 * Cost and speed parameters for different travel methods
 */
const TRAVEL_METHOD_PARAMS = {
  walk: {
    speedKmh: 5,
    costPerKm: 0,
    minDistance: 0,
    maxDistance: 5,
  },
  bike: {
    speedKmh: 15,
    costPerKm: 0,
    minDistance: 0,
    maxDistance: 15,
  },
  ride: {
    speedKmh: 40,
    costPerKm: 1.5, // Per km cost
    minDistance: 1,
    maxDistance: 100,
  },
  drive: {
    speedKmh: 50,
    costPerKm: 0.5, // Fuel cost
    minDistance: 0,
    maxDistance: 1000,
  },
  public_transport: {
    speedKmh: 30,
    costPerKm: 0.3,
    minDistance: 0.5,
    maxDistance: 50,
  },
};

/**
 * Travel type multipliers
 */
const TRAVEL_TYPE_MULTIPLIERS = {
  budget: { cost: 0.7, comfort: 0.5 },
  comfort: { cost: 1.0, comfort: 1.0 },
  luxury: { cost: 2.0, comfort: 1.5 },
  speed: { cost: 1.5, comfort: 0.8 },
};

export class RouteOptimizerService {
  /**
   * Main optimization method
   */
  async optimizeRoute(
    attractions: Attraction[],
    options: OptimizationOptions
  ): Promise<RouteOptimizationResult> {
    if (attractions.length < 2) {
      throw new Error('At least 2 attractions are required for route optimization');
    }

    // Select optimization algorithm
    let routeIndices: number[];
    let algorithmUsed: string;
    let multiModalModes: string[] | undefined;

    // Check for multi-modal optimization
    if (options.multiModal) {
      const availableModes = ['walk', 'bike', 'public_transport', 'drive'] as Array<'walk' | 'bike' | 'public_transport' | 'drive'>;
      const multiModalResult = multiModalOptimization(attractions, availableModes);
      routeIndices = multiModalResult.route;
      multiModalModes = multiModalResult.modes;
      algorithmUsed = 'Multi-Modal Optimization';
    }
    // Check for time windows
    else if (options.considerTimeWindows || attractions.some(a => a.timeWindow)) {
      const startTime = options.startTime ? new Date(options.startTime) : new Date();
      routeIndices = tspWithTimeWindows(attractions, startTime);
      algorithmUsed = 'Time Windows TSP';
    }
    // Use advanced TSP solver (combines nearest neighbor + 2-opt)
    else if (options.algorithm === 'advanced') {
      const distanceMatrix = createDistanceMatrix(
        attractions.map(a => ({ latitude: a.latitude, longitude: a.longitude }))
      );
      routeIndices = solveTSP(distanceMatrix, 0);
      algorithmUsed = 'Advanced TSP (NN + 2-Opt)';
    }
    // Simulated Annealing
    else if (options.algorithm === 'simulated_annealing') {
      routeIndices = simulatedAnnealingTSP(attractions, 10000, 0.995, 10000);
      algorithmUsed = 'Simulated Annealing';
    }
    else {
      switch (options.algorithm) {
        case 'nearest_neighbor':
          routeIndices = nearestNeighborTSP(attractions);
          algorithmUsed = 'Nearest Neighbor';
          break;
        case '2opt':
          routeIndices = twoOptOptimization(attractions, nearestNeighborTSP(attractions));
          algorithmUsed = '2-Opt';
          break;
        case 'christofides':
          routeIndices = christofidesApproximation(attractions);
          algorithmUsed = 'Christofides Approximation';
          break;
        case 'genetic':
          routeIndices = geneticAlgorithmTSP(attractions, 50, 100);
          algorithmUsed = 'Genetic Algorithm';
          break;
        case 'priority':
          routeIndices = priorityBasedOptimization(attractions);
          algorithmUsed = 'Priority-Based';
          break;
        default:
          // Auto-select based on problem size
          if (attractions.length <= 10) {
            const distanceMatrix = createDistanceMatrix(
              attractions.map(a => ({ latitude: a.latitude, longitude: a.longitude }))
            );
            routeIndices = solveTSP(distanceMatrix, 0);
            algorithmUsed = 'Advanced TSP (Auto)';
          } else if (attractions.length <= 20) {
            routeIndices = christofidesApproximation(attractions);
            algorithmUsed = 'Christofides (Auto)';
          } else {
            routeIndices = nearestNeighborTSP(attractions);
            algorithmUsed = 'Nearest Neighbor (Auto)';
          }
      }
    }

    // Build optimized route
    const optimizedRoute = routeIndices.map((idx) => attractions[idx]);

    // Calculate segments with distance, time, and cost
    // Use multi-modal modes if available
    const segments = this.calculateSegments(
      optimizedRoute,
      options.travelMethod,
      options.travelType,
      multiModalModes
    );

    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const estimatedCost = segments.reduce((sum, seg) => sum + seg.cost, 0);

    // Check budget constraint
    if (options.budget && estimatedCost > options.budget) {
      // Try to optimize for budget
      return this.optimizeForBudget(attractions, options);
    }

    return {
      optimizedRoute,
      totalDistance,
      totalDuration,
      estimatedCost,
      algorithm: algorithmUsed,
      segments,
    };
  }

  /**
   * Calculate route segments with travel details
   */
  private calculateSegments(
    route: Attraction[],
    travelMethod: TravelMethod,
    travelType: TravelType,
    multiModalModes?: string[]
  ): RouteSegment[] {
    const segments: RouteSegment[] = [];
    const typeMultiplier = TRAVEL_TYPE_MULTIPLIERS[travelType];

    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];

      const distance = haversineDistance(
        { latitude: from.latitude, longitude: from.longitude },
        { latitude: to.latitude, longitude: to.longitude }
      );

      // Use multi-modal mode if available, otherwise use specified method
      const segmentMethod = multiModalModes && multiModalModes[i] 
        ? multiModalModes[i] as TravelMethod
        : travelMethod;
      
      const methodParams = TRAVEL_METHOD_PARAMS[segmentMethod];

      // Calculate duration (in minutes)
      const duration = (distance / methodParams.speedKmh) * 60;

      // Calculate cost
      let cost = distance * methodParams.costPerKm * typeMultiplier.cost;

      // Add waiting time for visit duration
      const visitDuration = to.visitDuration || 60; // Default 1 hour

      segments.push({
        from,
        to,
        distance,
        duration: duration + visitDuration,
        cost,
        method: segmentMethod,
      });
    }

    return segments;
  }

  /**
   * Optimize route within budget constraints
   */
  private async optimizeForBudget(
    attractions: Attraction[],
    options: OptimizationOptions
  ): Promise<RouteOptimizationResult> {
    // Try cheaper travel method
    const methodPriority: TravelMethod[] = ['walk', 'bike', 'public_transport', 'ride', 'drive'];
    
    for (const method of methodPriority) {
      const result = await this.optimizeRoute(attractions, {
        ...options,
        travelMethod: method,
      });

      if (!options.budget || result.estimatedCost <= options.budget) {
        return result;
      }
    }

    // If still over budget, reduce attractions
    const reducedAttractions = this.selectAttractionsByPriority(
      attractions,
      options.budget || 0,
      options.travelMethod
    );

    return this.optimizeRoute(reducedAttractions, options);
  }

  /**
   * Select top attractions within budget
   */
  private selectAttractionsByPriority(
    attractions: Attraction[],
    budget: number,
    travelMethod: TravelMethod
  ): Attraction[] {
    // Sort by priority
    const sorted = [...attractions].sort((a, b) => (b.priority || 5) - (a.priority || 5));

    const selected: Attraction[] = [];
    let currentCost = 0;

    for (const attraction of sorted) {
      // Estimate cost to add this attraction
      if (selected.length > 0) {
        const lastAttraction = selected[selected.length - 1];
        const distance = haversineDistance(
          { latitude: lastAttraction.latitude, longitude: lastAttraction.longitude },
          { latitude: attraction.latitude, longitude: attraction.longitude }
        );
        const cost = distance * TRAVEL_METHOD_PARAMS[travelMethod].costPerKm;

        if (currentCost + cost <= budget) {
          selected.push(attraction);
          currentCost += cost;
        }
      } else {
        selected.push(attraction);
      }

      if (selected.length >= 2 && currentCost >= budget * 0.9) {
        break;
      }
    }

    return selected.length >= 2 ? selected : attractions.slice(0, 2);
  }

  /**
   * Get route statistics
   */
  getRouteStats(result: RouteOptimizationResult) {
    return {
      numberOfStops: result.optimizedRoute.length,
      totalDistance: `${result.totalDistance.toFixed(2)} km`,
      totalDuration: `${Math.floor(result.totalDuration / 60)}h ${Math.floor(result.totalDuration % 60)}m`,
      estimatedCost: `$${result.estimatedCost.toFixed(2)}`,
      algorithm: result.algorithm,
      averageDistanceBetweenStops: `${(result.totalDistance / (result.optimizedRoute.length - 1)).toFixed(2)} km`,
    };
  }

  /**
   * Compare multiple algorithms
   */
  async compareAlgorithms(
    attractions: Attraction[],
    options: OptimizationOptions
  ): Promise<Record<string, RouteOptimizationResult>> {
    const algorithms: Array<'nearest_neighbor' | '2opt' | 'christofides' | 'simulated_annealing' | 'advanced'> = [
      'nearest_neighbor',
      '2opt',
      'christofides',
      'advanced',
    ];

    if (attractions.length <= 15) {
      algorithms.push('simulated_annealing');
    }

    const results: Record<string, RouteOptimizationResult> = {};

    for (const algo of algorithms) {
      try {
        results[algo] = await this.optimizeRoute(attractions, {
          ...options,
          algorithm: algo,
        });
      } catch (error) {
        // Skip failed algorithms
      }
    }

    return results;
  }

  /**
   * Real-time route update: Insert new attraction into existing route
   */
  async insertAttractionIntoRoute(
    currentRoute: Attraction[],
    newAttraction: Attraction,
    options: OptimizationOptions
  ): Promise<RouteOptimizationResult> {
    const updatedRoute = insertionHeuristic(currentRoute, newAttraction);
    
    // Calculate segments for updated route
    const segments = this.calculateSegments(
      updatedRoute,
      options.travelMethod,
      options.travelType
    );

    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const estimatedCost = segments.reduce((sum, seg) => sum + seg.cost, 0);

    return {
      optimizedRoute: updatedRoute,
      totalDistance,
      totalDuration,
      estimatedCost,
      algorithm: 'Insertion Heuristic (Real-time)',
      segments,
    };
  }
}
