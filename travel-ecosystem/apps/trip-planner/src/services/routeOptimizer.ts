/**
 * Route Optimization Service
 * Implements TSP (Traveling Salesman Problem) solution for multi-destination routing
 * Uses real-world distance calculations and heuristic algorithms
 */

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface RouteSegment {
  from: string;
  to: string;
  distance: number; // in kilometers
  duration: number; // in hours
  coordinates: [number, number][];
}

interface OptimizedRoute {
  orderedLocations: string[];
  totalDistance: number;
  totalDuration: number;
  segments: RouteSegment[];
}

interface DistanceMatrixEntry {
  distance: number;
  duration: number;
}

/**
 * Calculate Haversine distance between two coordinates
 * Used as fallback when API is unavailable
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate duration based on distance (rough approximation)
 * Assumes average speed of 60 km/h
 */
function estimateDuration(distance: number): number {
  return distance / 60;
}

/**
 * Fetch distance matrix from OpenRouteService API
 * Falls back to Haversine calculation if API fails
 */
async function fetchDistanceMatrix(
  locations: Location[]
): Promise<DistanceMatrixEntry[][]> {
  const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;

  if (!apiKey) {
    console.warn('OpenRouteService API key not found, using Haversine calculation');
    return calculateFallbackMatrix(locations);
  }

  try {
    const coordinates = locations.map((loc) => [loc.lng, loc.lat]);

    const response = await fetch(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({
          locations: coordinates,
          metrics: ['distance', 'duration'],
          units: 'km',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('OpenRouteService API request failed');
    }

    const data = await response.json();

    // Convert to our matrix format
    const matrix: DistanceMatrixEntry[][] = [];
    for (let i = 0; i < locations.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < locations.length; j++) {
        matrix[i][j] = {
          distance: data.distances[i][j] / 1000, // Convert to km
          duration: data.durations[i][j] / 3600, // Convert to hours
        };
      }
    }

    return matrix;
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    return calculateFallbackMatrix(locations);
  }
}

/**
 * Calculate fallback distance matrix using Haversine formula
 */
function calculateFallbackMatrix(
  locations: Location[]
): DistanceMatrixEntry[][] {
  const matrix: DistanceMatrixEntry[][] = [];

  for (let i = 0; i < locations.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        matrix[i][j] = { distance: 0, duration: 0 };
      } else {
        const distance = calculateHaversineDistance(
          locations[i].lat,
          locations[i].lng,
          locations[j].lat,
          locations[j].lng
        );
        matrix[i][j] = {
          distance: distance * 1.3, // Multiply by 1.3 for road distance estimation
          duration: estimateDuration(distance * 1.3),
        };
      }
    }
  }

  return matrix;
}

/**
 * Solve TSP using Nearest Neighbor heuristic
 * Time complexity: O(n²)
 * Good for up to 20 cities
 */
function solveNearestNeighbor(
  distanceMatrix: DistanceMatrixEntry[][],
  startIndex: number = 0
): number[] {
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const route: number[] = [startIndex];
  visited[startIndex] = true;

  let current = startIndex;

  for (let i = 1; i < n; i++) {
    let nearest = -1;
    let minDistance = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && distanceMatrix[current][j].distance < minDistance) {
        nearest = j;
        minDistance = distanceMatrix[current][j].distance;
      }
    }

    route.push(nearest);
    visited[nearest] = true;
    current = nearest;
  }

  return route;
}

/**
 * Improve route using 2-opt optimization
 * Iteratively removes crossing paths
 */
function optimize2Opt(
  route: number[],
  distanceMatrix: DistanceMatrixEntry[][]
): number[] {
  let improved = true;
  let currentRoute = [...route];

  while (improved) {
    improved = false;

    for (let i = 1; i < currentRoute.length - 2; i++) {
      for (let j = i + 1; j < currentRoute.length - 1; j++) {
        const currentDistance =
          distanceMatrix[currentRoute[i - 1]][currentRoute[i]].distance +
          distanceMatrix[currentRoute[j]][currentRoute[j + 1]].distance;

        const newDistance =
          distanceMatrix[currentRoute[i - 1]][currentRoute[j]].distance +
          distanceMatrix[currentRoute[i]][currentRoute[j + 1]].distance;

        if (newDistance < currentDistance) {
          // Reverse the segment between i and j
          const newRoute = [
            ...currentRoute.slice(0, i),
            ...currentRoute.slice(i, j + 1).reverse(),
            ...currentRoute.slice(j + 1),
          ];
          currentRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return currentRoute;
}

/**
 * Calculate total route metrics
 */
function calculateRouteMetrics(
  route: number[],
  distanceMatrix: DistanceMatrixEntry[][]
): { totalDistance: number; totalDuration: number } {
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += distanceMatrix[route[i]][route[i + 1]].distance;
    totalDuration += distanceMatrix[route[i]][route[i + 1]].duration;
  }

  return { totalDistance, totalDuration };
}

/**
 * Fetch route geometry from OpenRouteService
 */
async function fetchRouteGeometry(
  start: Location,
  end: Location
): Promise<[number, number][]> {
  const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;

  if (!apiKey) {
    // Return simple straight line
    return [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ];
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch route geometry');

    const data = await response.json();
    return data.features[0].geometry.coordinates;
  } catch (error) {
    console.error('Error fetching route geometry:', error);
    return [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ];
  }
}

/**
 * Main route optimization function
 * 
 * @param locations Array of locations to optimize
 * @param startLocationName Optional: Start from specific location
 * @returns Optimized route with all details
 */
export async function optimizeRoute(
  locations: Location[],
  startLocationName?: string
): Promise<OptimizedRoute> {
  if (locations.length < 2) {
    throw new Error('At least 2 locations required for route optimization');
  }

  if (locations.length > 20) {
    throw new Error('Maximum 20 locations supported');
  }

  console.log('🗺️ Starting route optimization for', locations.length, 'locations');

  // Step 1: Get distance matrix
  console.log('📊 Fetching distance matrix...');
  const distanceMatrix = await fetchDistanceMatrix(locations);

  // Step 2: Determine start index
  let startIndex = 0;
  if (startLocationName) {
    startIndex = locations.findIndex((loc) => loc.name === startLocationName);
    if (startIndex === -1) startIndex = 0;
  }

  // Step 3: Solve TSP with nearest neighbor
  console.log('🧮 Solving TSP with Nearest Neighbor algorithm...');
  let route = solveNearestNeighbor(distanceMatrix, startIndex);

  // Step 4: Optimize with 2-opt
  console.log('⚡ Optimizing route with 2-opt algorithm...');
  route = optimize2Opt(route, distanceMatrix);

  // Step 5: Calculate metrics
  const { totalDistance, totalDuration } = calculateRouteMetrics(
    route,
    distanceMatrix
  );

  console.log('✅ Route optimized!');
  console.log(`   Total distance: ${totalDistance.toFixed(2)} km`);
  console.log(`   Total duration: ${totalDuration.toFixed(2)} hours`);

  // Step 6: Build route segments with geometry
  console.log('🛣️ Fetching route geometries...');
  const segments: RouteSegment[] = [];

  for (let i = 0; i < route.length - 1; i++) {
    const fromIdx = route[i];
    const toIdx = route[i + 1];

    const coordinates = await fetchRouteGeometry(
      locations[fromIdx],
      locations[toIdx]
    );

    segments.push({
      from: locations[fromIdx].name,
      to: locations[toIdx].name,
      distance: distanceMatrix[fromIdx][toIdx].distance,
      duration: distanceMatrix[fromIdx][toIdx].duration,
      coordinates,
    });
  }

  return {
    orderedLocations: route.map((idx) => locations[idx].name),
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round(totalDuration * 100) / 100,
    segments,
  };
}

/**
 * Geocode place name to coordinates using OpenRouteService
 */
export async function geocodePlace(placeName: string): Promise<Location | null> {
  const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;

  if (!apiKey) {
    console.error('OpenRouteService API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
        placeName
      )}&size=1`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        name: placeName,
        lng: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
