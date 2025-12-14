/**
 * Route Optimizer API Client
 * Handles communication with the backend route optimization service
 * 
 * Flow: Frontend → API Gateway → Route Optimizer Service
 */

import axios from 'axios';
import type { OptimizeRouteRequest, OptimizeRouteResponse } from '../types/trip-planner.types';

// Use dedicated gateway override when available, fallback to API gateway default port
const API_BASE_URL =
  import.meta.env.VITE_ROUTE_OPTIMIZER_API_URL ||
  import.meta.env.VITE_API_GATEWAY_URL ||
  'http://localhost:4000';

interface OptimizeRouteApiEnvelope {
  success: boolean;
  data: OptimizeRouteResponse;
  message?: string;
  error?: string;
  processingTime?: string;
}

const isOptimizeRouteEnvelope = (
  payload: any
): payload is OptimizeRouteApiEnvelope => {
  return (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    payload.data &&
    typeof payload.data === 'object' &&
    'optimizedOrder' in payload.data
  );
};

const formatValidationDetails = (
  details?: Array<{ path?: string | string[]; message?: string }>
): string | null => {
  if (!Array.isArray(details) || details.length === 0) {
    return null;
  }

  const parts = details
    .map((detail) => {
      if (!detail) {
        return null;
      }
      const path = Array.isArray(detail.path)
        ? detail.path.join('.')
        : detail.path;
      if (path && detail.message) {
        return `${path}: ${detail.message}`;
      }
      return detail.message ?? path;
    })
    .filter(Boolean)
    .join('; ');

  return parts ? `Validation failed: ${parts}` : null;
};

/**
 * POST /api/v2/optimize-route
 * 
 * Sends selected attractions to backend for route optimization with MULTIMODAL TRANSPORT
 * Backend will:
 * 1. Build distance matrix using Transportation Service (OSRM/RAPTOR/Google)
 * 2. Run TSP optimization (2-opt, simulated annealing, etc.)
 * 3. Apply RAPTOR algorithm for real-time public transport
 * 4. Call Transportation Service for each leg (walking/cycling/driving/transit/e-scooter)
 * 5. Apply constraints (budget, time, opening hours)
 * 6. Return optimized order WITH REAL TRANSPORT DETAILS (polylines, steps, delays)
 * 7. Persist to MongoDB for history/analytics
 */
export async function optimizeRoute(
  request: OptimizeRouteRequest
): Promise<OptimizeRouteResponse> {
  try {
    const response = await axios.post<OptimizeRouteResponse | OptimizeRouteApiEnvelope>(
      `${API_BASE_URL}/api/v2/optimize-route`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if user is authenticated
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          })
        },
        // Match API Gateway/proxy timeout (60s) to avoid client cancelling
        // long-running optimization requests; microservice may take longer
        // for complex routes - adjust if needed.
        timeout: 60000 // 60 second timeout for optimization
      }
    );

    const payload = response.data;

    if (isOptimizeRouteEnvelope(payload)) {
      if (payload.success === false) {
        throw new Error(payload.message || payload.error || 'Route optimization failed');
      }
      return payload.data;
    }

    return payload;
  } catch (error: any) {
    console.error('Route optimization API error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const validationMessage = formatValidationDetails(error.response.data?.details);
        if (validationMessage) {
          throw new Error(validationMessage);
        }

        // Backend returned an error response
        throw new Error(
          error.response.data?.message || 
          error.response.data?.error || 
          `Route optimization failed (status ${error.response.status})`
        );
      } else if (error.request) {
        // Request made but no response received
        throw new Error('No response from server. Please check your connection.');
      }
    }
    
    throw new Error('Failed to optimize route. Please try again.');
  }
}

/**
 * GET /api/v2/optimize-route/:jobId
 * 
 * Get optimization job by ID from MongoDB persistence layer
 */
export async function getOptimizationJobStatus(
  jobId: string
): Promise<OptimizeRouteResponse> {
  try {
    const response = await axios.get<OptimizeRouteResponse | OptimizeRouteApiEnvelope>(
      `${API_BASE_URL}/api/v2/optimize-route/${jobId}`,
      {
        headers: {
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          })
        }
      }
    );

    const payload = response.data;

    if (isOptimizeRouteEnvelope(payload)) {
      if (payload.success === false) {
        throw new Error(payload.message || payload.error || 'Failed to get optimization status');
      }
      return payload.data;
    }

    return payload;
  } catch (error: any) {
    console.error('Job status API error:', error);
    throw new Error('Failed to get optimization status');
  }
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
export async function optimizeRouteWithRetry(
  request: OptimizeRouteRequest,
  maxRetries: number = 3
): Promise<OptimizeRouteResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await optimizeRoute(request);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on validation errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Optimization failed after retries');
}
