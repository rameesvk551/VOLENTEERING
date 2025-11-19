import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Icon, LatLngExpression } from 'leaflet';
import { useTripStore } from '../store/tripStore';
import 'leaflet/dist/leaflet.css';

// Custom map pin icon
const createCustomIcon = (color: string, number: number) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="56" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#shadow)">
          <path d="M20 0C9 0 0 9 0 20C0 35 20 56 20 56C20 56 40 35 40 20C40 9 31 0 20 0Z" fill="${color}"/>
          <circle cx="20" cy="20" r="15" fill="white"/>
          <text x="20" y="26" font-size="14" font-weight="bold" text-anchor="middle" fill="${color}">${number}</text>
        </g>
        <defs>
          <filter id="shadow" x="-5" y="-5" width="50" height="66">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    `)}`,
    iconSize: [40, 56],
    iconAnchor: [20, 56],
    popupAnchor: [0, -56],
  });
};

// Component to handle map view updates
const MapViewController: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const TripMap: React.FC = () => {
  const { destinations, selectedDestinationId, setSelectedDestination } = useTripStore();
  const mapRef = useRef<L.Map | null>(null);

  // Sort destinations by order and filter out invalid coordinates
  const sortedDestinations = [...destinations]
    .filter(dest => dest.coordinates &&
                    typeof dest.coordinates.lat === 'number' &&
                    typeof dest.coordinates.lng === 'number' &&
                    !isNaN(dest.coordinates.lat) &&
                    !isNaN(dest.coordinates.lng))
    .sort((a, b) => a.order - b.order);

  // Calculate center and zoom
  const center: LatLngExpression = sortedDestinations.length > 0
    ? [sortedDestinations[0].coordinates.lat, sortedDestinations[0].coordinates.lng]
    : [20, 0]; // Default to world view

  const zoom = sortedDestinations.length > 0 ? 6 : 2;

  // Create polyline coordinates for route
  const routeCoordinates: LatLngExpression[] = sortedDestinations.map((dest) => [
    dest.coordinates.lat,
    dest.coordinates.lng,
  ]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={center} zoom={zoom} />

        {/* Route polyline with gradient effect */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#06b6d4',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Destination markers */}
        {sortedDestinations.map((dest, index) => (
          <Marker
            key={dest.id}
            position={[dest.coordinates.lat, dest.coordinates.lng]}
            icon={createCustomIcon(
              dest.id === selectedDestinationId ? '#0891b2' : '#06b6d4',
              index + 1
            )}
            eventHandlers={{
              click: () => setSelectedDestination(dest.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{dest.name}</h3>
                <p className="text-sm text-gray-600">{dest.country}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(dest.startDate).toLocaleDateString()} -{' '}
                  {new Date(dest.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-cyan-600 mt-2">
                  ${dest.estimatedCost}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-xl p-3 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {sortedDestinations.length} destination{sortedDestinations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Trip progress indicator */}
      {sortedDestinations.length > 0 && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-xl"
          >
            <span className="text-2xl font-bold">{sortedDestinations.length}</span>
            <span className="text-[10px] font-medium">STOPS</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TripMap;
