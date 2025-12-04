/**
 * Type definitions for Trip Planner feature
 * Mobile-first attraction selection → route optimization → transport → PDF flow
 */

export interface Attraction {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  category?: string;
  priority?: number; // 1-10, higher = more important
  visitDurationMinutes?: number; // Estimated time to spend
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4; // $ to $$$$
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type TravelType = 'WALKING' | 'CYCLING' | 'PUBLIC_TRANSPORT' | 'DRIVING' | 'E_SCOOTER';
export type TravelProfile = 'budget' | 'comfort' | 'luxury' | 'speed';

export interface OptimizationConstraints {
  startLocation?: Location;
  startTime?: string; // ISO 8601
  timeBudgetMinutes?: number;
  travelTypes: TravelType[];
  budget?: number;
  travelProfile?: TravelProfile;
}

export interface OptimizationOptions {
  includeRealtimeTransit: boolean;
  algorithm?: 'RAPTOR' | 'TSP_2OPT' | 'ACO' | 'GREEDY' | 'GENETIC' | 'auto';
  maxWalkingDistanceMeters?: number;
  minTransfers?: number;
}

export interface OptimizeRouteRequest {
  userId?: string;
  places: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    imageUrl?: string;
    priority?: number;
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

export interface RouteGeometry {
  legs: Array<{ seq: number; travelType: string; polyline: string | null }>;
}

export interface RouteSummary {
  startsAt: string;
  endsAt: string;
  totalVisitMinutes: number;
  totalTravelMinutes: number;
}

export interface OptimizeRouteResponse {
  jobId: string;
  optimizedOrder: Array<{
    placeId: string;
    seq: number;
  }>;
  estimatedDurationMinutes: number;
  totalDistanceMeters: number;
  legs: TransportLegDetail[];
  timeline: TimelineEntry[];
  routeGeometry: RouteGeometry;
  summary: RouteSummary;
  notes?: string;
}

export interface TransportMode {
  mode: TravelType;
  durationMinutes: number;
  distanceMeters: number;
  cost: number;
  transfers?: number;
  steps?: TransportStep[];
  realtime?: {
    expectedDelaySeconds: number;
    vehicleId?: string;
  };
  fareEstimate?: {
    currency: string;
    amount: number;
  };
  badge?: 'Fastest' | 'Cheapest' | 'Least Walking' | 'Eco-Friendly';
  confidence?: number; // 0-1
}

export interface TransportStep {
  type: 'walk' | 'transit' | 'drive' | 'bike';
  start: Location;
  end: Location;
  startTime?: string;
  endTime?: string;
  route?: {
    agency?: string;
    routeId?: string;
    routeName?: string;
    headsign?: string;
  };
  instructions?: string;
}

export interface MultiModalRouteRequest {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  departureTime: string;
  modes: string[];
  preferences?: {
    minTransfers?: number;
    maxWalkMeters?: number;
  };
  user?: {
    id: string;
    profile?: string;
  };
}

export interface MultiModalRouteResponse {
  legId: string;
  options: TransportMode[];
}

export interface Leg {
  legId: string;
  from: string; // placeId
  to: string; // placeId
  fromName: string;
  toName: string;
  options: TransportMode[];
  selectedOptionId?: string;
  departure?: string;
  arrival?: string;
}

export interface TripPlan {
  tripId: string;
  userId?: string;
  tripName: string;
  selectedPlaces: string[]; // placeIds
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  legs: Leg[];
  totalDurationMinutes: number;
  totalCost: number;
  status: 'draft' | 'optimizing' | 'ready' | 'finalized';
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePDFRequest {
  userId?: string;
  tripName: string;
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  legs: Array<{
    from: string;
    to: string;
    selectedMode: string;
    optionId: string;
    departure: string;
    arrival: string;
    cost: number;
  }>;
  images?: string[];
  notes?: string;
  format?: 'A4' | 'Letter';
  locale?: string;
}

export interface GeneratePDFResponse {
  pdfUrl: string;
  pages: number;
  thumbnail?: string;
  jobId?: string;
}

// Frontend state management types
export interface TripPlannerState {
  selectedPlaces: Attraction[];
  optimizationPayload?: OptimizeRouteRequest;
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  legs: Leg[];
  userSelections: Array<{ legId: string; selectedOptionId: string }>;
  isOptimizing: boolean;
  isFetchingTransport: boolean;
  isGeneratingPDF: boolean;
  error?: {
    type: 'optimization' | 'transport' | 'pdf';
    message: string;
    retryable: boolean;
  };
}

// Component prop types
export interface AttractionCardProps {
  attraction: Attraction;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export interface SelectionFABProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

export interface OptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSubmit: (payload: {
    travelTypes: TravelType[];
    startLocation?: { lat: number; lng: number; address: string };
    tripDurationHours?: number;
    includeRealtimeTransit: boolean;
    startTime?: string;
    budget?: number;
  }) => void;
  isLoading?: boolean;
  onOpenTransportDrawer?: (data: {
    startLocation: { lat: number; lng: number; address: string };
    selectedDate: string;
    selectedTypes: TravelType[];
    payload?: {
      travelTypes: TravelType[];
      budget?: number;
      includeRealtimeTransit: boolean;
    };
  }) => void;
}

export interface OptimizedRouteMapProps {
  attractions: Attraction[];
  optimizedOrder: Array<{ placeId: string; seq: number }>;
  polyline?: { lat: number; lng: number }[];
  onMarkerClick?: (placeId: string) => void;
}

export interface LegOptionsListProps {
  leg: Leg;
  onSelectOption: (legId: string, optionId: string) => void;
  isLoading?: boolean;
}

export interface TransportOptionCardProps {
  option: TransportMode;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}

export interface SelectedPlanSummaryProps {
  totalDurationMinutes: number;
  totalCost: number;
  currency?: string;
  onGeneratePDF: () => void;
  isGenerating?: boolean;
}

export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  thumbnail?: string;
  pages: number;
}

export interface HotelData {
  id: number;
  name: string;
  price: string;
  rating: number;
  amenities: string[];
  distance: string;
  image: string;
  features?: string[];
}

export type HotelCategory = 'budget' | 'midrange' | 'luxury';
