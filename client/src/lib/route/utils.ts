import polyline from '@mapbox/polyline';
import type { LatLngTuple, LatLngBoundsExpression } from 'leaflet';
import type { RouteOptimizationResponse, TimelineEntry, TransportLegDetail } from '@/types/route';

export const LEG_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f97316', '#6366f1', '#ec4899'];

export const travelModeIcons: Record<string, string> = {
  walking: '🚶',
  WALKING: '🚶',
  driving: '🚗',
  DRIVING: '🚗',
  transit: '🚇',
  TRANSIT: '🚇',
  metro: '🚇',
  bus: '🚌',
  cycling: '🚴'
};

export const decodePolylinePoints = (encoded?: string | null): LatLngTuple[] => {
  if (!encoded) return [];
  try {
    const coordinates = polyline.decode(encoded);
    return coordinates.map(([lat, lng]) => [lat, lng]);
  } catch (error) {
    console.warn('Unable to decode polyline', error);
    return [];
  }
};

export const metersToKm = (meters: number): string => {
  if (!meters) return '0 km';
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const secondsToMinutes = (seconds: number): number => Math.round(seconds / 60);

export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins}m`;
  if (!mins) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const buildGoogleMapsDeepLink = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const createBoundsFromLegs = (
  legs: TransportLegDetail[],
  timeline: TimelineEntry[]
): LatLngBoundsExpression | null => {
  const points: LatLngTuple[] = [];

  legs.forEach((leg) => {
    const decoded = decodePolylinePoints(leg.polyline);
    decoded.forEach((coord) => points.push(coord));
    points.push([leg.from.lat, leg.from.lng]);
    points.push([leg.to.lat, leg.to.lng]);
  });

  if (!points.length && timeline.length) {
    timeline.forEach((entry) => {
      const leg = legs.find((l) => l.from.placeId === entry.placeId || l.to.placeId === entry.placeId);
      if (leg) {
        points.push([leg.from.lat, leg.from.lng]);
        points.push([leg.to.lat, leg.to.lng]);
      }
    });
  }

  if (!points.length) return null;

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
};

export const decorateLegs = (legs: TransportLegDetail[]) =>
  legs.map((leg, index) => ({
    ...leg,
    color: LEG_COLORS[index % LEG_COLORS.length],
    decodedPolyline: decodePolylinePoints(leg.polyline)
  }));

export const buildEtaTicker = (summary: RouteOptimizationResponse['summary']) => {
  if (!summary) return null;
  const startsAt = new Date(summary.startsAt).getTime();
  const endsAt = new Date(summary.endsAt).getTime();
  return { startsAt, endsAt };
};
