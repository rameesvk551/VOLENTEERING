/**
 * React Hook for Route Optimization
 * Uses TanStack Query for optimized data fetching, caching, and state management
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { optimizeRoute, getOptimizationJobStatus } from '../api/routeOptimizer.api';
import type { OptimizeRouteRequest, OptimizeRouteResponse } from '../types/trip-planner.types';

/**
 * Mutation hook for route optimization
 * 
 * Usage:
 * ```tsx
 * const { mutate, isPending, error } = useOptimizeRouteMutation();
 * 
 * mutate(payload, {
 *   onSuccess: (data) => {
 *     console.log('Optimized order:', data.optimizedOrder);
 *   },
 *   onError: (error) => {
 *     console.error('Optimization failed:', error);
 *   }
 * });
 * ```
 */
export function useOptimizeRouteMutation() {
  return useMutation<OptimizeRouteResponse, Error, OptimizeRouteRequest>({
    mutationFn: optimizeRoute,
    retry: false, // Don't auto-retry, we'll handle this manually
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Query hook for polling optimization job status
 * Only use this if backend returns jobId and processes async
 * 
 * Usage:
 * ```tsx
 * const { data, isLoading } = useOptimizationJobQuery(jobId, {
 *   enabled: !!jobId,
 *   refetchInterval: 2000 // Poll every 2 seconds
 * });
 * ```
 */
export function useOptimizationJobQuery(
  jobId: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<OptimizeRouteResponse, Error>({
    queryKey: ['optimize-job', jobId],
    queryFn: () => getOptimizationJobStatus(jobId!),
    enabled: !!jobId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    retry: 3,
    staleTime: 0, // Always fetch fresh data when polling
  });
}
