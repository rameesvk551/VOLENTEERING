/**
 * 🗺️ Travel Route Optimization & AI Guide API
 * Backend implementation for route optimization with Tavily AI integration
 */

import express, { Router, Request, Response } from 'express';
import axios from 'axios';

const router: Router = express.Router();

// Configuration
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TravelGuideRequest {
  place: string;
}

interface RouteOptimizationRequest {
  places: string[];
}

/**
 * 🔹 Geocoding Service - Convert place name to coordinates

/**
 * 🔹 Distance Matrix - Calculate distances between coordinates
 */
async function getDistanceMatrix(coordinates: Coordinates[]): Promise<number[][]> {
  const n = coordinates.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  // Using Haversine formula for distance calculation
  const haversineDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = haversineDistance(coordinates[i], coordinates[j]);
      }
    }
  }

  return matrix;
}

/**
 * 🔹 TSP Solver - Nearest Neighbor + 2-opt optimization
 */
function solveTSP(distanceMatrix: number[][], startIndex: number = 0): number[] {
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
  return twoOptOptimization(route, distanceMatrix);
}

function twoOptOptimization(route: number[], distanceMatrix: number[][]): number[] {
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
 * 🤖 Tavily AI Integration - Fetch travel insights
 */
async function fetchTravelInsightsWithTavily(placeName: string): Promise<any> {
  if (!TAVILY_API_KEY) {
    console.warn('Tavily API key not configured, using fallback data');
    return generateFallbackTravelInfo(placeName);
  }

  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: `Complete travel guide for ${placeName}: top things to do, local food, best time to visit, budget estimates`,
        search_depth: 'advanced',
        topic: 'general',
        max_results: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TAVILY_API_KEY}`
        }
      }
    );

    return parseTavilyResponse(response.data, placeName);
  } catch (error) {
    console.error(`Tavily API error for ${placeName}:`, error);
    return generateFallbackTravelInfo(placeName);
  }
}

function parseTavilyResponse(tavilyData: any, placeName: string): any {
  const results = tavilyData.results || [];
  
  // Extract information from search results
  const thingsToDo: string[] = [];
  let localFood = 'Local specialties';
  let description = `${placeName} is a beautiful destination worth exploring.`;

  // Parse through results to extract relevant information
  results.forEach((result: any) => {
    const content = result.content || '';
    
    // Simple extraction logic (can be enhanced with NLP)
    if (content.toLowerCase().includes('things to do') || 
        content.toLowerCase().includes('attractions')) {
      // Extract activities (simplified)
      const sentences = content.split('.').slice(0, 3);
      thingsToDo.push(...sentences.filter((s: string) => s.length > 10 && s.length < 100));
    }
    
    if (content.toLowerCase().includes('food') || 
        content.toLowerCase().includes('cuisine')) {
      localFood = content.split('.')[0] || localFood;
    }
  });

  return {
    things_to_do: thingsToDo.slice(0, 3).length > 0 
      ? thingsToDo.slice(0, 3) 
      : ['Explore local attractions', 'Try authentic cuisine', 'Visit cultural sites'],
    local_food: localFood.substring(0, 100),
    description: results[0]?.content.substring(0, 200) || description,
    best_time_to_visit: 'Year-round',
    estimated_days: 2,
    budget_estimate: {
      budget: 50,
      midrange: 100,
      luxury: 250
    }
  };
}

function generateFallbackTravelInfo(placeName: string): any {
  // Static fallback data for common Indian destinations
  const fallbackData: Record<string, any> = {
    'Delhi': {
      things_to_do: ['Visit Red Fort', 'Explore India Gate', 'Shop at Chandni Chowk'],
      local_food: 'Butter chicken, Chole bhature, Street food',
      description: 'Delhi, India\'s capital, blends ancient history with modern urban life, offering rich culture, monuments, and cuisine.',
      best_time_to_visit: 'October to March',
      estimated_days: 3,
      budget_estimate: { budget: 30, midrange: 60, luxury: 150 }
    },
    'Manali': {
      things_to_do: ['Solang Valley skiing', 'Old Manali cafes', 'Hadimba Temple'],
      local_food: 'Trout fish, Sidu, Tibetan momos',
      description: 'Manali is a high-altitude Himalayan resort town famous for adventure sports, scenic valleys, and snow-capped peaks.',
      best_time_to_visit: 'March to June, December to February',
      estimated_days: 3,
      budget_estimate: { budget: 40, midrange: 80, luxury: 200 }
    },
    'Leh': {
      things_to_do: ['Pangong Lake visit', 'Nubra Valley expedition', 'Monastery tours'],
      local_food: 'Thukpa, Momos, Butter tea',
      description: 'Leh, the capital of Ladakh, offers breathtaking landscapes, ancient monasteries, and thrilling high-altitude adventures.',
      best_time_to_visit: 'May to September',
      estimated_days: 5,
      budget_estimate: { budget: 60, midrange: 120, luxury: 300 }
    }
  };

  return fallbackData[placeName] || {
    things_to_do: ['Explore local attractions', 'Try authentic local cuisine', 'Visit cultural landmarks'],
    local_food: 'Local specialties',
    description: `${placeName} is a beautiful destination with rich culture and history.`,
    best_time_to_visit: 'Year-round',
    estimated_days: 2,
    budget_estimate: { budget: 50, midrange: 100, luxury: 250 }
  };
}

/**
 * 🎯 API Endpoint: Generate AI Travel Guide for a place
 */
router.post('/travel-guide', async (req: Request, res: Response) => {
  try {
    const { place }: TravelGuideRequest = req.body;

    if (!place) {
      return res.status(400).json({
        success: false,
        error: 'Place name is required'
      });
    }

    // Step 1: Geocode the place
    const coordinates = await geocodePlace(place);

    // Step 2: Fetch AI-powered travel insights
    const travelInfo = await fetchTravelInsightsWithTavily(place);

    // Step 3: Combine and return
    const response = {
      place,
      coordinates,
      ...travelInfo
    };

    res.json(response);
  } catch (error) {
    console.error('Travel guide error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate travel guide'
    });
  }
});

/**
 * 🎯 API Endpoint: Optimize route for multiple places
 */
router.post('/optimize-route', async (req: Request, res: Response) => {
  try {
    const { places }: RouteOptimizationRequest = req.body;

    if (!places || !Array.isArray(places) || places.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 places are required'
      });
    }

    if (places.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 places allowed'
      });
    }

    // Step 1: Geocode all places
    const coordinatesPromises = places.map(place => geocodePlace(place));
    const coordinates = await Promise.all(coordinatesPromises);

    // Step 2: Calculate distance matrix
    const distanceMatrix = await getDistanceMatrix(coordinates);

    // Step 3: Solve TSP
    const routeIndices = solveTSP(distanceMatrix);

    // Step 4: Calculate route segments
    const segments = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < routeIndices.length - 1; i++) {
      const fromIdx = routeIndices[i];
      const toIdx = routeIndices[i + 1];
      const distance = distanceMatrix[fromIdx][toIdx];
      const duration = distance / 60; // Assuming 60 km/h average

      segments.push({
        from: places[fromIdx],
        to: places[toIdx],
        distance_km: Math.round(distance),
        duration_hours: parseFloat(duration.toFixed(2)),
        mode: distance > 500 ? 'flight' : 'drive'
      });

      totalDistance += distance;
      totalDuration += duration;
    }

    // Step 5: Generate optimized route
    const optimizedRoute = routeIndices.map(idx => places[idx]);
    const routeCoordinates = routeIndices.map(idx => coordinates[idx]);

    // Step 6: Fetch travel guides for each place
    const travelGuidesPromises = optimizedRoute.map(place => 
      fetchTravelInsightsWithTavily(place)
    );
    const travelGuides = await Promise.all(travelGuidesPromises);

    const stopsInfo = optimizedRoute.map((place, idx) => ({
      place,
      coordinates: routeCoordinates[idx],
      ...travelGuides[idx]
    }));

    // Step 7: Return complete response
    const response = {
      route_optimization: {
        optimized_route: optimizedRoute,
        total_distance_km: Math.round(totalDistance),
        estimated_duration_hours: parseFloat(totalDuration.toFixed(2)),
        segments,
        route_coordinates: routeCoordinates
      },
      stops_info: stopsInfo,
      metadata: {
        total_places: places.length,
        optimization_algorithm: 'Nearest Neighbor + 2-opt',
        api_version: '1.0.0',
        generated_at: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize route'
    });
  }
});

/**
 * 🎯 API Endpoint: Get route polyline for map rendering
 */
router.post('/route-polyline', async (req: Request, res: Response) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates array is required'
      });
    }

    // Generate polyline string
    const polyline = coordinates
      .map((coord: Coordinates) => `${coord.lat},${coord.lng}`)
      .join(';');

    res.json({
      success: true,
      polyline,
      format: 'lat,lng;lat,lng;...'
    });
  } catch (error) {
    console.error('Polyline generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate polyline'
    });
  }
});

export default router;
