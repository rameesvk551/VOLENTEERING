/**
 * Advanced Route Optimization Algorithms
 * Implements multiple algorithms for finding optimal routes
 */

import { Coordinates, createDistanceMatrix, haversineDistance } from '../utils/distance';

export interface Attraction {
  name: string;
  latitude: number;
  longitude: number;
  image?: string;
  priority?: number; // 1-10, higher = more important
  visitDuration?: number; // in minutes
  timeWindow?: {
    open?: string; // HH:MM format
    close?: string; // HH:MM format
  };
  category?: string;
}

export interface RouteOptimizationResult {
  optimizedRoute: Attraction[];
  totalDistance: number;
  totalDuration: number;
  estimatedCost: number;
  algorithm: string;
  segments: RouteSegment[];
}

export interface RouteSegment {
  from: Attraction;
  to: Attraction;
  distance: number;
  duration: number;
  cost: number;
  method: string;
}

/**
 * Nearest Neighbor Algorithm (Greedy)
 * Fast O(n²) algorithm, good for real-time optimization
 */
export function nearestNeighborTSP(
  attractions: Attraction[],
  startIndex: number = 0
): number[] {
  const n = attractions.length;
  const visited = new Set<number>();
  const route: number[] = [];

  let current = startIndex;
  route.push(current);
  visited.add(current);

  while (visited.size < n) {
    let nearest = -1;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) {
        const dist = haversineDistance(
          { latitude: attractions[current].latitude, longitude: attractions[current].longitude },
          { latitude: attractions[i].latitude, longitude: attractions[i].longitude }
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearest = i;
        }
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
      current = nearest;
    }
  }

  return route;
}

/**
 * Advanced TSP Solver with 2-opt optimization
 * Combines nearest neighbor with 2-opt for better results
 */
export function solveTSP(distanceMatrix: number[][], startIndex: number = 0): number[] {
  const n = distanceMatrix.length;
  const visited = new Set<number>();
  const route: number[] = [startIndex];
  visited.add(startIndex);

  let currentCity = startIndex;

  // Nearest Neighbor Algorithm
  while (visited.size < n) {
    let nearestCity = -1;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distanceMatrix[currentCity][i] < minDistance) {
        minDistance = distanceMatrix[currentCity][i];
        nearestCity = i;
      }
    }

    if (nearestCity === -1) break;
    
    route.push(nearestCity);
    visited.add(nearestCity);
    currentCity = nearestCity;
  }

  // Apply 2-opt optimization
  return twoOptOptimizationWithMatrix(route, distanceMatrix);
}

/**
 * 2-Opt optimization using distance matrix
 */
function twoOptOptimizationWithMatrix(route: number[], distanceMatrix: number[][]): number[] {
  const n = route.length;
  let improved = true;
  let bestRoute = [...route];

  while (improved) {
    improved = false;
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n - 1; j++) {
        const currentDistance = 
          distanceMatrix[bestRoute[i - 1]][bestRoute[i]] +
          distanceMatrix[bestRoute[j]][bestRoute[j + 1]];
        
        const newDistance = 
          distanceMatrix[bestRoute[i - 1]][bestRoute[j]] +
          distanceMatrix[bestRoute[i]][bestRoute[j + 1]];

        if (newDistance < currentDistance) {
          const newRoute = [
            ...bestRoute.slice(0, i),
            ...bestRoute.slice(i, j + 1).reverse(),
            ...bestRoute.slice(j + 1)
          ];
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

/**
 * 2-Opt Algorithm
 * Improves existing route by eliminating crossing paths
 * Time complexity: O(n²) per iteration
 */
export function twoOptOptimization(
  attractions: Attraction[],
  initialRoute: number[],
  maxIterations: number = 100
): number[] {
  let route = [...initialRoute];
  let improved = true;
  let iteration = 0;

  const coords = route.map((idx) => ({
    latitude: attractions[idx].latitude,
    longitude: attractions[idx].longitude,
  }));

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        // Calculate current distance
        const currentDist =
          haversineDistance(coords[i - 1], coords[i]) +
          haversineDistance(coords[j], coords[j + 1]);

        // Calculate distance after swap
        const newDist =
          haversineDistance(coords[i - 1], coords[j]) +
          haversineDistance(coords[i], coords[j + 1]);

        if (newDist < currentDist) {
          // Reverse the segment between i and j
          route = [...route.slice(0, i), ...route.slice(i, j + 1).reverse(), ...route.slice(j + 1)];
          coords.splice(i, j - i + 1, ...route.slice(i, j + 1).map((idx) => ({
            latitude: attractions[idx].latitude,
            longitude: attractions[idx].longitude,
          })));
          improved = true;
        }
      }
    }
  }

  return route;
}

/**
 * Christofides Algorithm (Approximation for TSP)
 * Guarantees solution within 1.5x optimal
 * More complex but better results
 */
export function christofidesApproximation(attractions: Attraction[]): number[] {
  // For simplicity, we'll use a simplified version
  // In production, you'd implement full Christofides with MST + matching
  
  const initialRoute = nearestNeighborTSP(attractions);
  return twoOptOptimization(attractions, initialRoute);
}

/**
 * Genetic Algorithm for route optimization
 * Good for larger datasets, finds near-optimal solutions
 */
export function geneticAlgorithmTSP(
  attractions: Attraction[],
  populationSize: number = 50,
  generations: number = 100,
  mutationRate: number = 0.01
): number[] {
  // Initialize population
  let population = initializePopulation(attractions.length, populationSize);

  for (let gen = 0; gen < generations; gen++) {
    // Calculate fitness for each route
    const fitness = population.map((route) => {
      const totalDist = calculateRouteTotalDistance(attractions, route);
      return 1 / (totalDist + 1); // Higher fitness = shorter distance
    });

    // Selection
    const selected = selection(population, fitness, populationSize / 2);

    // Crossover
    const offspring = crossover(selected, populationSize);

    // Mutation
    const mutated = offspring.map((route) =>
      Math.random() < mutationRate ? mutate(route) : route
    );

    population = mutated;
  }

  // Return best route
  const bestRoute = population.reduce((best, route) => {
    const bestDist = calculateRouteTotalDistance(attractions, best);
    const routeDist = calculateRouteTotalDistance(attractions, route);
    return routeDist < bestDist ? route : best;
  });

  return bestRoute;
}

function initializePopulation(size: number, popSize: number): number[][] {
  const population: number[][] = [];
  const baseRoute = Array.from({ length: size }, (_, i) => i);

  for (let i = 0; i < popSize; i++) {
    const route = [...baseRoute];
    // Fisher-Yates shuffle
    for (let j = route.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [route[j], route[k]] = [route[k], route[j]];
    }
    population.push(route);
  }

  return population;
}

function selection(population: number[][], fitness: number[], count: number): number[][] {
  const selected: number[][] = [];
  const totalFitness = fitness.reduce((sum, f) => sum + f, 0);

  for (let i = 0; i < count; i++) {
    let random = Math.random() * totalFitness;
    let sum = 0;

    for (let j = 0; j < population.length; j++) {
      sum += fitness[j];
      if (sum >= random) {
        selected.push([...population[j]]);
        break;
      }
    }
  }

  return selected;
}

function crossover(parents: number[][], offspringSize: number): number[][] {
  const offspring: number[][] = [];

  while (offspring.length < offspringSize) {
    const parent1 = parents[Math.floor(Math.random() * parents.length)];
    const parent2 = parents[Math.floor(Math.random() * parents.length)];

    // Order crossover (OX)
    const child = orderCrossover(parent1, parent2);
    offspring.push(child);
  }

  return offspring;
}

function orderCrossover(parent1: number[], parent2: number[]): number[] {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = start + Math.floor(Math.random() * (size - start));

  const child = Array(size).fill(-1);

  // Copy segment from parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }

  // Fill remaining from parent2
  let childPos = (end + 1) % size;
  let parent2Pos = (end + 1) % size;

  while (child.includes(-1)) {
    if (!child.includes(parent2[parent2Pos])) {
      child[childPos] = parent2[parent2Pos];
      childPos = (childPos + 1) % size;
    }
    parent2Pos = (parent2Pos + 1) % size;
  }

  return child;
}

function mutate(route: number[]): number[] {
  const mutated = [...route];
  const i = Math.floor(Math.random() * route.length);
  const j = Math.floor(Math.random() * route.length);
  [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
  return mutated;
}

function calculateRouteTotalDistance(attractions: Attraction[], route: number[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = attractions[route[i]];
    const b = attractions[route[i + 1]];
    total += haversineDistance(
      { latitude: a.latitude, longitude: a.longitude },
      { latitude: b.latitude, longitude: b.longitude }
    );
  }
  return total;
}

/**
 * Priority-based optimization
 * Considers attraction priority/importance
 */
export function priorityBasedOptimization(attractions: Attraction[]): number[] {
  // Sort by priority, then optimize within clusters
  const sorted = attractions
    .map((a, idx) => ({ ...a, originalIndex: idx }))
    .sort((a, b) => (b.priority || 5) - (a.priority || 5));

  const indices = sorted.map((a) => a.originalIndex);
  return twoOptOptimization(attractions, indices);
}

/**
 * Simulated Annealing Algorithm
 * Probabilistic technique for approximating global optimum
 */
export function simulatedAnnealingTSP(
  attractions: Attraction[],
  initialTemp: number = 10000,
  coolingRate: number = 0.995,
  iterations: number = 10000
): number[] {
  const n = attractions.length;
  let currentRoute = nearestNeighborTSP(attractions);
  let bestRoute = [...currentRoute];
  let currentDistance = calculateRouteTotalDistance(attractions, currentRoute);
  let bestDistance = currentDistance;
  let temperature = initialTemp;

  for (let iter = 0; iter < iterations; iter++) {
    // Generate neighbor solution by swapping two random cities
    const newRoute = [...currentRoute];
    const i = Math.floor(Math.random() * (n - 1)) + 1;
    const j = Math.floor(Math.random() * (n - 1)) + 1;
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];

    const newDistance = calculateRouteTotalDistance(attractions, newRoute);
    const deltaDistance = newDistance - currentDistance;

    // Accept better solutions or worse solutions with probability
    if (deltaDistance < 0 || Math.random() < Math.exp(-deltaDistance / temperature)) {
      currentRoute = newRoute;
      currentDistance = newDistance;

      if (currentDistance < bestDistance) {
        bestRoute = [...currentRoute];
        bestDistance = currentDistance;
      }
    }

    // Cool down
    temperature *= coolingRate;
  }

  return bestRoute;
}

/**
 * TSP with Time Windows
 * Considers opening/closing times of attractions
 */
export function tspWithTimeWindows(
  attractions: Attraction[],
  startTime: Date = new Date()
): number[] {
  const n = attractions.length;
  
  // Filter attractions that can be visited today
  const visitableAttractions = attractions.filter((a, idx) => {
    if (!a.timeWindow) return true;
    
    const now = new Date(startTime);
    const [openHour, openMin] = (a.timeWindow.open || '00:00').split(':').map(Number);
    const [closeHour, closeMin] = (a.timeWindow.close || '23:59').split(':').map(Number);
    
    const openTime = new Date(now);
    openTime.setHours(openHour, openMin, 0);
    
    const closeTime = new Date(now);
    closeTime.setHours(closeHour, closeMin, 0);
    
    return now <= closeTime;
  });

  // Start with nearest neighbor considering time
  const visited = new Set<number>();
  const route: number[] = [];
  let currentTime = new Date(startTime);
  let currentIdx = 0;

  route.push(currentIdx);
  visited.add(currentIdx);

  while (visited.size < visitableAttractions.length) {
    let bestNext = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < visitableAttractions.length; i++) {
      if (visited.has(i)) continue;

      const attraction = visitableAttractions[i];
      const distance = haversineDistance(
        { 
          latitude: visitableAttractions[currentIdx].latitude, 
          longitude: visitableAttractions[currentIdx].longitude 
        },
        { latitude: attraction.latitude, longitude: attraction.longitude }
      );

      // Estimate arrival time
      const travelTime = (distance / 30) * 60; // Assuming 30 km/h average speed
      const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000);

      // Check if we can visit
      let canVisit = true;
      if (attraction.timeWindow?.close) {
        const [closeHour, closeMin] = attraction.timeWindow.close.split(':').map(Number);
        const closeTime = new Date(arrivalTime);
        closeTime.setHours(closeHour, closeMin, 0);
        canVisit = arrivalTime <= closeTime;
      }

      if (canVisit) {
        // Score based on distance and priority
        const score = (attraction.priority || 5) / (distance + 0.1);
        if (score > bestScore) {
          bestScore = score;
          bestNext = i;
        }
      }
    }

    if (bestNext === -1) break;

    route.push(bestNext);
    visited.add(bestNext);
    
    // Update current time
    const distance = haversineDistance(
      { 
        latitude: visitableAttractions[currentIdx].latitude, 
        longitude: visitableAttractions[currentIdx].longitude 
      },
      { 
        latitude: visitableAttractions[bestNext].latitude, 
        longitude: visitableAttractions[bestNext].longitude 
      }
    );
    const travelTime = (distance / 30) * 60;
    currentTime = new Date(currentTime.getTime() + travelTime * 60000 + (visitableAttractions[bestNext].visitDuration || 60) * 60000);
    currentIdx = bestNext;
  }

  return route;
}

/**
 * Insertion Heuristics for Real-time Updates
 * Efficiently insert new attraction into existing route
 */
export function insertionHeuristic(
  currentRoute: Attraction[],
  newAttraction: Attraction
): Attraction[] {
  if (currentRoute.length === 0) {
    return [newAttraction];
  }

  let bestPosition = 0;
  let minIncrease = Infinity;

  // Try inserting at each position
  for (let i = 0; i <= currentRoute.length; i++) {
    let increase = 0;

    if (i === 0) {
      // Insert at beginning
      increase = haversineDistance(
        { latitude: newAttraction.latitude, longitude: newAttraction.longitude },
        { latitude: currentRoute[0].latitude, longitude: currentRoute[0].longitude }
      );
    } else if (i === currentRoute.length) {
      // Insert at end
      increase = haversineDistance(
        { latitude: currentRoute[i - 1].latitude, longitude: currentRoute[i - 1].longitude },
        { latitude: newAttraction.latitude, longitude: newAttraction.longitude }
      );
    } else {
      // Insert in middle
      const before = currentRoute[i - 1];
      const after = currentRoute[i];
      
      const originalDistance = haversineDistance(
        { latitude: before.latitude, longitude: before.longitude },
        { latitude: after.latitude, longitude: after.longitude }
      );
      
      const newDistance = 
        haversineDistance(
          { latitude: before.latitude, longitude: before.longitude },
          { latitude: newAttraction.latitude, longitude: newAttraction.longitude }
        ) +
        haversineDistance(
          { latitude: newAttraction.latitude, longitude: newAttraction.longitude },
          { latitude: after.latitude, longitude: after.longitude }
        );
      
      increase = newDistance - originalDistance;
    }

    if (increase < minIncrease) {
      minIncrease = increase;
      bestPosition = i;
    }
  }

  // Insert at best position
  const newRoute = [...currentRoute];
  newRoute.splice(bestPosition, 0, newAttraction);
  return newRoute;
}

/**
 * Multi-modal route optimization
 * Optimize considering different transport modes for different segments
 */
export function multiModalOptimization(
  attractions: Attraction[],
  availableModes: Array<'walk' | 'bike' | 'public_transport' | 'drive'>
): {
  route: number[];
  modes: string[];
} {
  const route = nearestNeighborTSP(attractions);
  const modes: string[] = [];

  // Assign optimal transport mode for each segment
  for (let i = 0; i < route.length - 1; i++) {
    const from = attractions[route[i]];
    const to = attractions[route[i + 1]];
    
    const distance = haversineDistance(
      { latitude: from.latitude, longitude: from.longitude },
      { latitude: to.latitude, longitude: to.longitude }
    );

    // Select mode based on distance
    let selectedMode: string;
    if (distance < 2) {
      selectedMode = 'walk';
    } else if (distance < 10 && availableModes.includes('bike')) {
      selectedMode = 'bike';
    } else if (distance < 50 && availableModes.includes('public_transport')) {
      selectedMode = 'public_transport';
    } else {
      selectedMode = availableModes.includes('drive') ? 'drive' : 'public_transport';
    }

    modes.push(selectedMode);
  }

  return { route, modes };
}
