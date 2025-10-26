/**
 * Route Map Component
 * Displays optimized route on an interactive map with markers and polylines
 */

import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  route: {
    orderedLocations: string[];
    segments: Array<{
      from: string;
      to: string;
      distance: number;
      duration: number;
      coordinates?: [number, number][];
    }>;
  };
  coordinates: Map<string, { lat: number; lng: number }>;
  currentStopIndex?: number;
  onMarkerClick?: (index: number) => void;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function RouteMap({ route, coordinates, currentStopIndex = 0, onMarkerClick }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090], // Default: Delhi
      zoom: 5,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !route || route.orderedLocations.length === 0) return;

    const map = mapRef.current;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Collect all coordinates for the route
    const routeCoords: [number, number][] = [];
    const bounds = L.latLngBounds([]);

    // Add markers for each location
    route.orderedLocations.forEach((location, index) => {
      const coord = coordinates.get(location);
      if (!coord) return;

      const latLng: [number, number] = [coord.lat, coord.lng];
      routeCoords.push(latLng);
      bounds.extend(latLng);

      // Create custom icon based on whether it's the current stop
      const isCurrentStop = index === currentStopIndex;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isCurrentStop ? '#4F46E5' : '#6B7280'};
            color: white;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(latLng, { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 16px; color: #1F2937;">${location}</strong>
            <br>
            <span style="color: #6B7280;">Stop ${index + 1} of ${route.orderedLocations.length}</span>
            ${index > 0 && route.segments[index - 1] ? `
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #E5E7EB;">
              <div style="font-size: 12px; color: #4B5563;">
                <div style="margin: 4px 0;">
                  📍 ${route.segments[index - 1].distance.toFixed(1)} km from previous
                </div>
                <div style="margin: 4px 0;">
                  ⏱️ ${route.segments[index - 1].duration.toFixed(1)} hours
                </div>
              </div>
            ` : ''}
          </div>
        `);

      // Add click handler
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(index);
        });
      }

      markersRef.current.push(marker);
    });

    // Draw polyline connecting all points
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#4F46E5',
        weight: 4,
        opacity: 0.7,
        smoothFactor: 1,
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // Fit map to show all markers with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, coordinates, currentStopIndex, onMarkerClick]);

  // Update marker styles when current stop changes
  useEffect(() => {
    if (!route || !mapRef.current) return;

    markersRef.current.forEach((marker, index) => {
      const isCurrentStop = index === currentStopIndex;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isCurrentStop ? '42px' : '36px'};
            height: ${isCurrentStop ? '42px' : '36px'};
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${isCurrentStop ? '#4F46E5' : '#6B7280'};
            color: white;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 ${isCurrentStop ? '4px 12px' : '2px 8px'} rgba(0,0,0,0.3);
            font-weight: bold;
            font-size: ${isCurrentStop ? '16px' : '14px'};
            cursor: pointer;
            transition: all 0.3s ease;
            transform: scale(${isCurrentStop ? '1.1' : '1'});
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [isCurrentStop ? 42 : 36, isCurrentStop ? 42 : 36],
        iconAnchor: [isCurrentStop ? 21 : 18, isCurrentStop ? 21 : 18],
      });
      marker.setIcon(icon);

      // Open popup for current stop
      if (isCurrentStop) {
        marker.openPopup();
      }
    });
  }, [currentStopIndex, route]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white"></div>
            <span>Current Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white"></div>
            <span>Other Stops</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-indigo-600"></div>
            <span>Route Path</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!route && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Map will appear after optimization</p>
          </div>
        </div>
      )}
    </div>
  );
}
