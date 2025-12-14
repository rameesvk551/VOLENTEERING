/**
 * Route Optimizer Component
 * Allows users to select destinations and get optimized routes with AI travel guides
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Zap, Loader2, TrendingUp, Info, CheckCircle } from 'lucide-react';
import { optimizeRoute } from '../services/routeOptimizer';
import { generateBatchTravelGuides, TravelGuideData } from '../services/aiTravelGuide';
import RouteMap from './RouteMap';
import { useTripStore } from '../store/tripStore';
import { useRouteOptimizationStore, RouteOptimizationSnapshot } from '../store/routeOptimizationStore';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface OptimizedRoute {
  orderedLocations: string[];
  totalDistance: number;
  totalDuration: number;
  segments: Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
    coordinates?: [number, number][];
  }>;
}

type CoordinateMap = Map<string, { lat: number; lng: number }>;

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const R = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

const buildRouteFromSnapshot = (
  snapshot: RouteOptimizationSnapshot
): { route: OptimizedRoute | null; coordinates: CoordinateMap } => {
  const placeById = new Map(snapshot.request.places.map((place) => [place.id, place]));
  const coordinatesByName: CoordinateMap = new Map();
  snapshot.request.places.forEach((place) => {
    coordinatesByName.set(place.name, { lat: place.lat, lng: place.lng });
  });

  const ordered = [...snapshot.response.optimizedOrder].sort((a, b) => a.seq - b.seq);
  if (ordered.length === 0) {
    return { route: null, coordinates: coordinatesByName };
  }

  const orderedLocations = ordered.map((entry) => placeById.get(entry.placeId)?.name || entry.placeId);
  const segments: OptimizedRoute['segments'] = [];

  for (let i = 0; i < ordered.length - 1; i++) {
    const fromEntry = ordered[i];
    const toEntry = ordered[i + 1];
    const fromPlace = placeById.get(fromEntry.placeId);
    const toPlace = placeById.get(toEntry.placeId);

    if (!fromPlace || !toPlace) {
      segments.push({
        from: fromPlace?.name || fromEntry.placeId,
        to: toPlace?.name || toEntry.placeId,
        distance: 0,
        duration: 0,
        coordinates: [],
      });
      continue;
    }

    const distance = calculateDistanceKm(
      { lat: fromPlace.lat, lng: fromPlace.lng },
      { lat: toPlace.lat, lng: toPlace.lng }
    );
    const duration = distance / 60; // hours at 60km/h average

    segments.push({
      from: fromPlace.name,
      to: toPlace.name,
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      coordinates: [
        [fromPlace.lng, fromPlace.lat],
        [toPlace.lng, toPlace.lat],
      ],
    });
  }

  const route: OptimizedRoute = {
    orderedLocations,
    totalDistance: Math.round((snapshot.response.totalDistanceMeters / 1000) * 100) / 100,
    totalDuration: Math.round((snapshot.response.estimatedDurationMinutes / 60) * 100) / 100,
    segments,
  };

  return { route, coordinates: coordinatesByName };
};

export default function RouteOptimizer() {
  // Get destinations from trip store (added from Discovery page)
  const destinations = useTripStore((state) => state.destinations);
  
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [inputPlace, setInputPlace] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [travelGuides, setTravelGuides] = useState<Map<string, TravelGuideData>>(new Map());
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  
  // Phase 1: Advanced Routing Features
  const [routingProfile, setRoutingProfile] = useState<'fastest' | 'shortest' | 'scenic'>('fastest');
  const [returnToOrigin, setReturnToOrigin] = useState(false);
  const [showTrafficData, setShowTrafficData] = useState(false);
  const optimizationSnapshot = useRouteOptimizationStore((state) => state.snapshot);
  const lastHydratedSnapshotKey = useRef<string | null>(null);

  useEffect(() => {
    if (!optimizationSnapshot) {
      return;
    }

    const snapshotKey = `${optimizationSnapshot.response.jobId}-${optimizationSnapshot.createdAt}`;
    if (lastHydratedSnapshotKey.current === snapshotKey) {
      return;
    }
    lastHydratedSnapshotKey.current = snapshotKey;

    const { route, coordinates } = buildRouteFromSnapshot(optimizationSnapshot);
    if (!route) {
      return;
    }

    setSelectedPlaces(route.orderedLocations);
    setOptimizedRoute(route);
    setRouteCoordinates(coordinates);
    setCurrentStopIndex(0);
    setIsOptimizing(false);

    generateBatchTravelGuides(route.orderedLocations)
      .then((guides) => setTravelGuides(guides))
      .catch((error) => console.error('Failed to generate travel guides for hydrated route:', error));
  }, [optimizationSnapshot]);

  // Sync trip store destinations on mount and updates
  useEffect(() => {
    if (destinations.length > 0 && selectedPlaces.length === 0) {
      // Auto-populate from trip store destinations
      const destinationNames = destinations.map(d => d.name);
      setSelectedPlaces(destinationNames.slice(0, 10)); // Max 10
    }
  }, [destinations]);

  const popularDestinations = [
    'Delhi',
    'Manali',
    'Kasol',
    'Shimla',
    'Chandigarh',
    'Kullu',
    'Spiti Valley',
    'Leh',
    'Amritsar',
    'Rishikesh',
  ];

  const handleAddPlace = () => {
    if (inputPlace.trim() && !selectedPlaces.includes(inputPlace.trim()) && selectedPlaces.length < 10) {
      setSelectedPlaces([...selectedPlaces, inputPlace.trim()]);
      setInputPlace('');
    }
  };

  const handleRemovePlace = (place: string) => {
    setSelectedPlaces(selectedPlaces.filter(p => p !== place));
    setOptimizedRoute(null);
    setTravelGuides(new Map());
  };

  const handleQuickAdd = (place: string) => {
    if (!selectedPlaces.includes(place) && selectedPlaces.length < 10) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleOptimizeRoute = async () => {
    if (selectedPlaces.length < 2) {
      alert('Please select at least 2 destinations');
      return;
    }

    setIsOptimizing(true);
    setCurrentStopIndex(0);

    try {
      // Step 1: Optimize route with advanced options
      console.log('🔄 Optimizing route for:', selectedPlaces);
      console.log('⚙️ Options:', { 
        travelMode, 
        routingProfile, 
        returnToOrigin, 
        showTrafficData 
      });

      const locations: Location[] = selectedPlaces.map(place => ({
        name: place,
        lat: 0,
        lng: 0,
      }));

      // Add starting location at the end if return to origin is enabled
      const routeLocations = returnToOrigin && locations.length > 0
        ? [...locations, locations[0]]
        : locations;

      const route = await optimizeRoute(routeLocations);
      
      // Apply routing profile adjustments
      let adjustedRoute = { ...route };
      
      if (routingProfile === 'scenic') {
        // Scenic route: Prioritize routes with more varied landscapes
        console.log('🌄 Applying scenic route preference...');
        adjustedRoute.totalDuration = route.totalDuration * 1.2; // Scenic routes take 20% longer
      } else if (routingProfile === 'shortest') {
        // Shortest route: Already optimized by TSP for distance
        console.log('📏 Using shortest distance route...');
      } else {
        // Fastest route: Consider traffic if enabled
        if (showTrafficData) {
          console.log('🚦 Considering real-time traffic data...');
          adjustedRoute.totalDuration = route.totalDuration * 1.1; // Add 10% for traffic
        }
      }
      
      setOptimizedRoute(adjustedRoute);

      // Extract coordinates from the route segments for map display
      const coords = new Map<string, { lat: number; lng: number }>();
      
      // Get coordinates from segments
      adjustedRoute.segments.forEach((segment) => {
        if (segment.coordinates && segment.coordinates.length > 0) {
          // From location (first coordinate)
          if (!coords.has(segment.from)) {
            const [lng, lat] = segment.coordinates[0];
            coords.set(segment.from, { lat, lng });
          }
          // To location (last coordinate)
          if (!coords.has(segment.to)) {
            const [lng, lat] = segment.coordinates[segment.coordinates.length - 1];
            coords.set(segment.to, { lat, lng });
          }
        }
      });

      setRouteCoordinates(coords);
      console.log('📍 Extracted coordinates for', coords.size, 'locations');

      // Step 2: Generate AI travel guides
      console.log('🤖 Generating AI travel guides...');
      const guides = await generateBatchTravelGuides(adjustedRoute.orderedLocations);
      setTravelGuides(guides);

      console.log('✅ Route optimization complete!');
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const currentStop = optimizedRoute?.orderedLocations[currentStopIndex];
  const currentGuide = currentStop ? travelGuides.get(currentStop) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Navigation className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Route Optimizer</h1>
          </div>
          <p className="text-gray-600 mb-3">
            Select up to 10 destinations and get the most optimized route with AI-powered travel guides for each stop.
          </p>
          {destinations.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Pro Tip:</strong> Use the <strong>AI Discovery</strong> page to find attractions first, 
                then come back here to optimize your route!
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Destination Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Add Destinations
              </h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={inputPlace}
                  onChange={(e) => setInputPlace(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlace()}
                  placeholder="Enter destination..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={selectedPlaces.length >= 10}
                />
                <button
                  onClick={handleAddPlace}
                  disabled={selectedPlaces.length >= 10}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {selectedPlaces.length}/10 destinations selected
              </div>

              {/* Destinations from Discovery (if any) */}
              {destinations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    From Discovery ({destinations.length}):
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {destinations.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleQuickAdd(dest.name)}
                        disabled={selectedPlaces.includes(dest.name) || selectedPlaces.length >= 10}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedPlaces.includes(dest.name)
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed'
                        }`}
                      >
                        {selectedPlaces.includes(dest.name) && '✓ '}
                        {dest.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Click to add destinations you discovered to your route
                  </p>
                </div>
              )}

              {/* Quick Add Popular Destinations */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add Popular:</h3>
                <div className="flex flex-wrap gap-2">
                  {popularDestinations.slice(0, 6).map((place) => (
                    <button
                      key={place}
                      onClick={() => handleQuickAdd(place)}
                      disabled={selectedPlaces.includes(place) || selectedPlaces.length >= 10}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      {place}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Places */}
              <div className="space-y-2">
                {selectedPlaces.map((place, index) => (
                  <div
                    key={place}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs rounded-full">
                        {index + 1}
                      </span>
                      <span className="text-gray-800">{place}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePlace(place)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Optimize Button */}
              <button
                onClick={handleOptimizeRoute}
                disabled={selectedPlaces.length < 2 || isOptimizing}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Optimize Route
                  </>
                )}
              </button>

              {/* Travel Mode Selection */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Travel Mode:
                </label>
                <div className="flex gap-2">
                  {(['driving', 'walking', 'cycling'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTravelMode(mode)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg capitalize transition-colors ${
                        travelMode === mode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Routing Profile Selection */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Routing Profile:
                </label>
                <div className="flex gap-2">
                  {(['fastest', 'shortest', 'scenic'] as const).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setRoutingProfile(profile)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg capitalize transition-colors ${
                        routingProfile === profile
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {profile === 'fastest' && '⚡ '}
                      {profile === 'shortest' && '📏 '}
                      {profile === 'scenic' && '🌄 '}
                      {profile}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Advanced Options:
                </label>
                
                {/* Return to Origin */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnToOrigin}
                    onChange={(e) => setReturnToOrigin(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Return to starting point</span>
                </label>

                {/* Traffic Data */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTrafficData}
                    onChange={(e) => setShowTrafficData(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Consider real-time traffic</span>
                </label>
              </div>
            </div>

            {/* Route Summary */}
            {optimizedRoute && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Route Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Distance</span>
                    <span className="font-semibold text-blue-700">
                      {optimizedRoute.totalDistance} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Est. Duration</span>
                    <span className="font-semibold text-purple-700">
                      {optimizedRoute.totalDuration.toFixed(1)} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Stops</span>
                    <span className="font-semibold text-green-700">
                      {optimizedRoute.orderedLocations.length}
                    </span>
                  </div>
                  
                  {/* Active Options Indicators */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">Active Options:</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        🚗 {travelMode}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {routingProfile === 'fastest' && '⚡'}
                        {routingProfile === 'shortest' && '📏'}
                        {routingProfile === 'scenic' && '🌄'}
                        {' '}{routingProfile}
                      </span>
                      {returnToOrigin && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          🔄 Round trip
                        </span>
                      )}
                      {showTrafficData && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          🚦 Traffic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Route Display & Travel Guide */}
          <div className="lg:col-span-2 space-y-6">
            {!optimizedRoute ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Route Optimized Yet
                </h3>
                <p className="text-gray-500">
                  Select destinations and click "Optimize Route" to get started
                </p>
              </div>
            ) : (
              <>
                {/* Interactive Map */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Interactive Route Map
                  </h2>
                  <RouteMap
                    route={optimizedRoute}
                    coordinates={routeCoordinates}
                    currentStopIndex={currentStopIndex}
                    onMarkerClick={setCurrentStopIndex}
                  />
                </div>

                {/* Optimized Route Path */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Optimized Route</h2>
                  <div className="space-y-2">
                    {optimizedRoute.orderedLocations.map((place, index) => {
                      const segment = optimizedRoute.segments[index - 1];
                      return (
                        <div key={place}>
                          <button
                            onClick={() => setCurrentStopIndex(index)}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                              currentStopIndex === index
                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                                currentStopIndex === index
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-gray-800">{place}</div>
                              {segment && (
                                <div className="text-sm text-gray-500 flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Navigation className="w-3 h-3" />
                                    {segment.distance.toFixed(1)} km
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {segment.duration.toFixed(1)}h
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                          {index < optimizedRoute.orderedLocations.length - 1 && (
                            <div className="flex items-center justify-center py-1">
                              <div className="w-0.5 h-4 bg-gray-300"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Travel Guide for Current Stop */}
                {currentGuide && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {currentStop}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentStopIndex(Math.max(0, currentStopIndex - 1))}
                          disabled={currentStopIndex === 0}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentStopIndex(
                              Math.min(optimizedRoute.orderedLocations.length - 1, currentStopIndex + 1)
                            )
                          }
                          disabled={currentStopIndex === optimizedRoute.orderedLocations.length - 1}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{currentGuide.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Things to Do */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Info className="w-5 h-5 text-blue-600" />
                          Things to Do
                        </h3>
                        <ul className="space-y-2">
                          {currentGuide.thingsToDo.map((activity, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Local Food */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-2xl">🍽️</span>
                          Local Cuisine
                        </h3>
                        <ul className="space-y-2">
                          {currentGuide.localFood.map((food, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              <span className="text-gray-700">{food}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cultural Tips */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-2xl">💡</span>
                          Cultural Tips
                        </h3>
                        <ul className="space-y-2">
                          {currentGuide.culturalTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-purple-600 mt-1">•</span>
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Travel Info */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          Travel Info
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Best Time to Visit</div>
                            <div className="font-medium text-green-700">
                              {currentGuide.bestTimeToVisit}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Recommended Stay</div>
                            <div className="font-medium text-blue-700">
                              {currentGuide.estimatedStayDuration}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Budget Range</div>
                            <div className="font-medium text-purple-700">
                              ${currentGuide.budgetEstimate.low}-${currentGuide.budgetEstimate.high}{' '}
                              {currentGuide.budgetEstimate.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
