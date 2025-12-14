import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import server from '@/server/app';
import type { OptimizeRouteArgs, OptimizeRoutePayload, RouteOptimizationResponse } from '@/types/route';
import { sampleRouteResponse } from '@/components/travelPlanning/mocks/sampleRouteResponse';

const buildPayload = ({ travelMode, places, startTime, includeRealtimeTransit }: OptimizeRouteArgs): OptimizeRoutePayload => {
  const uniquePlaces = places.filter((place, index, arr) =>
    arr.findIndex((p) => p.place === place.place && p.latitude === place.latitude && p.longitude === place.longitude) === index
  );

  const normalizedPlaces = uniquePlaces.map((place, index) => ({
    id: `${place.place}-${index}`,
    name: place.place,
    lat: place.latitude,
    lng: place.longitude,
    visitDuration: 60
  }));

  const travelType = travelMode === 'TRANSIT' ? 'TRANSIT' : travelMode;

  return {
    userId: 'anonymous-ui',
    places: normalizedPlaces,
    constraints: {
      startLocation: normalizedPlaces[0]
        ? { lat: normalizedPlaces[0].lat, lng: normalizedPlaces[0].lng }
        : undefined,
      startTime: startTime || new Date().toISOString(),
      travelTypes: [travelType],
      timeBudgetMinutes: normalizedPlaces.length * 90
    },
    options: {
      includeRealtimeTransit: includeRealtimeTransit ?? (travelMode === 'TRANSIT'),
      algorithm: travelMode === 'DRIVING' ? 'osrm' : 'raptor+2opt'
    }
  };
};

const normalizeResponse = (data: RouteOptimizationResponse): RouteOptimizationResponse => ({
  ...data,
  legs: data.legs ?? [],
  timeline: data.timeline ?? [],
  routeGeometry: data.routeGeometry ?? { legs: [] },
  summary: data.summary ?? {
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    totalTravelMinutes: data.estimatedDurationMinutes,
    totalVisitMinutes: 0
  }
});

export const optimizeRoute = createAsyncThunk(
  'routeOptimizer/optimizeRoute',
  async (args: OptimizeRouteArgs, { rejectWithValue }) => {
    if (!args.places?.length) {
      return rejectWithValue('Select at least one attraction to optimize.');
    }

    const payload = buildPayload(args);

    try {
      const { data } = await axios.post<RouteOptimizationResponse>(
        `${server}/trip-planning/route-optimize`,
        payload,
        {
          timeout: 15000
        }
      );

      return { data: normalizeResponse(data), travelMode: args.travelMode, mocked: false };
    } catch (error: any) {
      const shouldMock = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ROUTE_MOCK === 'true';

      if (shouldMock) {
        console.warn('[routeOptimizer] Falling back to mock response', error?.message || error);
        return { data: normalizeResponse(sampleRouteResponse), travelMode: args.travelMode, mocked: true };
      }

      const message = error?.response?.data?.message || error?.message || 'Failed to optimize route';
      return rejectWithValue(message);
    }
  }
);
