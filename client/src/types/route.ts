export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT';

export interface OptimizedPlaceOrder {
  placeId: string;
  seq: number;
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

export interface RouteGeometryLeg {
  seq: number;
  travelType: string;
  polyline: string | null;
}

export interface RouteGeometry {
  legs: RouteGeometryLeg[];
}

export interface RouteSummary {
  startsAt: string;
  endsAt: string;
  totalVisitMinutes: number;
  totalTravelMinutes: number;
}

export interface RouteOptimizationResponse {
  success?: boolean;
  jobId: string;
  optimizedOrder: OptimizedPlaceOrder[];
  estimatedDurationMinutes: number;
  totalDistanceMeters: number;
  legs: TransportLegDetail[];
  timeline: TimelineEntry[];
  routeGeometry: RouteGeometry;
  summary: RouteSummary;
  notes?: string;
  processingTime?: string;
}

export interface OptimizeRoutePayload {
  userId?: string;
  places: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    visitDuration?: number;
  }>;
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

export interface OptimizeRouteArgs {
  travelMode: TravelMode;
  places: Array<{ place: string; latitude: number; longitude: number }>;
  startTime?: string;
  includeRealtimeTransit?: boolean;
}
