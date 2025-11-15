/**
 * API Hooks for Trip Planner
 * React Query hooks for all backend API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { optimizeRoute as requestRouteOptimization } from '../api/routeOptimizer.api';
import type {
  OptimizeRouteRequest,
  OptimizeRouteResponse,
  MultiModalRouteRequest,
  MultiModalRouteResponse,
  GeneratePDFRequest,
  GeneratePDFResponse,
  Attraction
} from '../types/trip-planner.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const DISCOVERY_API = `${API_BASE_URL}/api/v1`;

// Utility function for API calls with auth
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken'); // Adjust based on your auth strategy
  
  const response = await fetch(`${DISCOVERY_API}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook: Optimize route
 * POST /api/v1/optimize-route
 */
export function useOptimizeRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: OptimizeRouteRequest): Promise<OptimizeRouteResponse> =>
      requestRouteOptimization(request),
    onSuccess: (data) => {
      // Cache the optimized route
      queryClient.setQueryData(['optimized-route', data.jobId], data);
    },
    onError: (error: Error) => {
      console.error('Route optimization failed:', error);
    },
  });
}

/**
 * Hook: Get multi-modal transport options for a leg
 * POST /transport/multi-modal-route
 */
export function useMultiModalRoute() {
  return useMutation({
    mutationFn: async (request: MultiModalRouteRequest): Promise<MultiModalRouteResponse> => {
      // This calls the Transportation Service
      const TRANSPORT_API = import.meta.env.VITE_TRANSPORT_API_URL || 'http://localhost:3008';
      
      const response = await fetch(`${TRANSPORT_API}/transport/multi-modal-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Transport API error: ${response.status}`);
      }

      return response.json();
    },
  });
}

/**
 * Hook: Batch fetch transport options for multiple legs
 */
export function useBatchMultiModalRoutes() {
  const { mutateAsync: fetchRoute } = useMultiModalRoute();

  return useMutation({
    mutationFn: async (requests: MultiModalRouteRequest[]): Promise<MultiModalRouteResponse[]> => {
      // Fetch all routes in parallel with throttling
      const results = await Promise.allSettled(
        requests.map(req => fetchRoute(req))
      );

      return results.map((result, idx) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to fetch route ${idx}:`, result.reason);
          // Return empty options on error
          return {
            legId: `leg-${idx}`,
            options: []
          };
        }
      });
    },
  });
}

/**
 * Hook: Generate PDF itinerary
 * POST /api/v1/generate-pdf
 */
export function useGeneratePDF() {
  return useMutation({
    mutationFn: async (request: GeneratePDFRequest): Promise<GeneratePDFResponse> => {
      return fetchAPI('/generate-pdf', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
    onError: (error: Error) => {
      console.error('PDF generation failed:', error);
    },
  });
}

/**
 * Hook: Fetch attractions for a city
 * GET /api/v1/attractions?city=...&country=...
 */
export function useAttractions(city: string, country: string) {
  return useQuery({
    queryKey: ['attractions', city, country],
    queryFn: async (): Promise<{ attractions: Attraction[]; count: number }> => {
      return fetchAPI(`/attractions?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
    },
    enabled: !!city && !!country,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook: Poll optimization job status
 * GET /optimize/:jobId/status
 */
export function useOptimizationStatus(jobId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['optimization-status', jobId],
    queryFn: async (): Promise<{ status: string; progress?: number; result?: OptimizeRouteResponse }> => {
      if (!jobId) throw new Error('No job ID');
      
      // This endpoint should be implemented in the Route Optimizer service
      const OPTIMIZER_API = import.meta.env.VITE_OPTIMIZER_API_URL || 'http://localhost:3007';
      
      const response = await fetch(`${OPTIMIZER_API}/api/optimize/${jobId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      return response.json();
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling when complete or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
}

/**
 * Hook: Save trip plan (optional - for logged-in users)
 */
export function useSaveTripPlan() {
  return useMutation({
    mutationFn: async (tripPlan: any) => {
      return fetchAPI('/trip-plans', {
        method: 'POST',
        body: JSON.stringify(tripPlan),
      });
    },
  });
}
