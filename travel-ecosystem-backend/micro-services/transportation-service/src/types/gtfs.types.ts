/**
 * GTFS data type definitions
 */

// GTFS Static types
export interface Agency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
}

export interface Stop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_desc?: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
  stop_url?: string;
  location_type?: number;
  parent_station?: string;
  stop_timezone?: string;
  wheelchair_boarding?: number;
}

export interface Route {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_desc?: string;
  route_type: number;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
  route_sort_order?: number;
}

export interface Trip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  trip_short_name?: string;
  direction_id?: number;
  block_id?: string;
  shape_id?: string;
  wheelchair_accessible?: number;
  bikes_allowed?: number;
}

export interface StopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
  stop_headsign?: string;
  pickup_type?: number;
  drop_off_type?: number;
  shape_dist_traveled?: number;
  timepoint?: number;
}

export interface Calendar {
  service_id: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  start_date: string;
  end_date: string;
}

export interface CalendarDate {
  service_id: string;
  date: string;
  exception_type: number;
}

export interface Shape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
  shape_dist_traveled?: number;
}

// GTFS-RT types
export interface VehiclePosition {
  vehicle_id: string;
  trip_id?: string;
  route_id?: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  timestamp: number;
  current_stop_sequence?: number;
  current_status?: string;
}

export interface TripUpdate {
  trip_id: string;
  route_id?: string;
  start_date?: string;
  schedule_relationship?: string;
  stop_time_updates: StopTimeUpdate[];
}

export interface StopTimeUpdate {
  stop_sequence?: number;
  stop_id?: string;
  arrival_delay?: number;
  departure_delay?: number;
  arrival_time?: number;
  departure_time?: number;
}

// Multimodal routing types
export interface TransportMode {
  mode: 'transit' | 'walking' | 'cycling' | 'driving' | 'escooter';
  badgeText?: string;
  isRecommended?: boolean;
}

export interface TransportStep {
  mode: string;
  from: string;
  to: string;
  distance: number;
  duration: number;
  route?: string;
  routeColor?: string;
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
  delay?: number;
}

export interface Leg {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  steps: TransportStep[];
  totalDistance: number;
  totalDuration: number;
  estimatedCost: number;
}
