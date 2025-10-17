import React, { useEffect, useState } from 'react';
import haversine from 'haversine-distance';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';

type Location = {
  place: string;
  latitude: number;
  longitude: number;
};

const TripMap = () => {
  const { selectedPlace } = useSelector(
    (state: RootState) => state.attractions
  );

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [sortedPlaces, setSortedPlaces] = useState<Location[]>([]);

  // Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => console.error('Error getting location:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Sort places once we have user location
  useEffect(() => {
    if (userLocation && selectedPlace.length > 0) {
      const sorted = sortPlacesByDistance(userLocation, selectedPlace);
      setSortedPlaces(sorted);
    }
  }, [userLocation, selectedPlace]);

  // Helper to sort locations by distance
  const sortPlacesByDistance = (
    userLocation: { latitude: number; longitude: number },
    places: Location[]
  ): Location[] => {
    const sorted: Location[] = [];
    const unvisited = [...places];

    let current = {
      place: 'You',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const distance = haversine(
          { lat: current.latitude, lon: current.longitude },
          { lat: unvisited[i].latitude, lon: unvisited[i].longitude }
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = unvisited.splice(nearestIndex, 1)[0];
      sorted.push(nearest);
      current = nearest;
    }

    return sorted;
  };

  const polylinePositions: LatLngTuple[] = [userLocation, ...sortedPlaces].map(
    (p) => [p?.latitude, p?.longitude] as LatLngTuple
  );
  return (
<div className="max-w-6xl mx-auto pt-2 pb-6 px-4">
  <h2 className="text-2xl font-bold mb-4 text-center">🗺️ Your Trip Plan</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* 🗺️ Map Section - 2/3 */}
    <div className="md:col-span-2">
      <div className="h-[500px] rounded-xl shadow-lg overflow-hidden">
      {userLocation && (
  <MapContainer
    center={[userLocation.latitude, userLocation.longitude]}
    zoom={8}
    scrollWheelZoom={true}
    className="h-full w-full"
  >
    <TileLayer
      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {[userLocation, ...sortedPlaces].map((place, idx) => (
      <Marker
        key={idx}
        position={[place.latitude, place.longitude]}
      >
        <Popup>
          {idx === 0 ? "Your Location" : sortedPlaces[idx - 1].place}
        </Popup>
      </Marker>
    ))}

    <Polyline
      positions={polylinePositions}
      pathOptions={{ color: 'blue', weight: 4 }}
    />
  </MapContainer>
)}

      </div>
    </div>

    {/* 📍 Trip List - 1/3 */}
    <div className="md:col-span-1">
      <ol className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {sortedPlaces.map((place, index) => {
  const prev = index === 0 ? userLocation : sortedPlaces[index - 1];
  const distance = haversine(
    { lat: prev?.latitude, lon: prev.longitude },
    { lat: place?.latitude, lon: place.longitude }
  );

  return (
    <li key={place.place} className="bg-white p-4 shadow rounded-xl hover:bg-gray-50 transition">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full font-bold">
          {index + 1}
        </div>
        <div>
          <h3 className="text-md font-semibold">{place.place}</h3>
          <p className="text-sm text-gray-500">
            {(distance / 1000).toFixed(2)} km from {prev?.place || 'Current Location'}
          </p>
        </div>
      </div>
    </li>
  );
})}

      </ol>
    </div>
  </div>
</div>

  );
};

export default TripMap;
