import { create } from 'zustand';
import type { OptimizeRouteRequest, OptimizeRouteResponse } from '../types/trip-planner.types';

export interface OptimizedAttractionSummary {
  id: string;
  name: string;
  description?: string;
  city?: string;
  country?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
}

export interface RouteOptimizationSnapshot {
  request: OptimizeRouteRequest;
  response: OptimizeRouteResponse;
  selections: OptimizedAttractionSummary[];
  createdAt: number;
}

interface RouteOptimizationState {
  snapshot?: RouteOptimizationSnapshot;
  setSnapshot: (snapshot: RouteOptimizationSnapshot) => void;
  clearSnapshot: () => void;
}

export const useRouteOptimizationStore = create<RouteOptimizationState>((set) => ({
  snapshot: undefined,
  setSnapshot: (snapshot) => set({ snapshot }),
  clearSnapshot: () => set({ snapshot: undefined }),
}));
