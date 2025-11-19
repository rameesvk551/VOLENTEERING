/**
 * Route Optimization Results Page
 * Shows optimized route with map, timeline, transport details, and export options
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteOptimizationStore } from '../store/routeOptimizationStore';
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Download,
  Share2,
  Navigation,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { buildTripPlannerPath } from '../utils/navigation';

// Leaflet for map rendering
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

export default function RouteOptimizationResults() {
  const navigate = useNavigate();
  const snapshot = useRouteOptimizationStore((state) => state.snapshot);
  const [isExporting, setIsExporting] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!snapshot) {
      // No optimization result, redirect back
      navigate(buildTripPlannerPath('discover'));
      return;
    }

    // Initialize map
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;

      // Render route on map
      renderRoute(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [snapshot, navigate]);

  if (!snapshot) {
    return null; // Will redirect
  }

  const { response, selections, request } = snapshot;
  const optimizedOrder = response.optimizedOrder ?? [];
  const timeline = response.timeline ?? [];
  const legs = response.legs ?? [];
  const routeGeometryLegs = response.routeGeometry?.legs ?? [];

  // Check if we have a starting location and find it in selections
  const startingLocationFromSelections = selections.find(s => s.id === 'start-location');
  const hasStartingLocation = !!startingLocationFromSelections || !!request.constraints?.startLocation;

  const hasSummaryDuration =
    response.summary &&
    (typeof response.summary.totalVisitMinutes === 'number' ||
      typeof response.summary.totalTravelMinutes === 'number');
  const totalDuration = hasSummaryDuration
    ? (response.summary?.totalVisitMinutes ?? 0) + (response.summary?.totalTravelMinutes ?? 0)
    : response.estimatedDurationMinutes;
  const totalDistance = typeof response.totalDistanceMeters === 'number'
    ? (response.totalDistanceMeters / 1000).toFixed(2)
    : '0.00';
  const totalCostValue = legs.reduce((sum, leg) => sum + (leg?.cost || 0), 0);
  const totalCost = totalCostValue.toFixed(2);

  const renderRoute = (map: L.Map) => {
    if (optimizedOrder.length === 0 && !hasStartingLocation) return;

    const bounds: L.LatLngBoundsExpression = [];

    // Add starting location marker if it exists
    if (startingLocationFromSelections) {
      const { lat, lng } = startingLocationFromSelections.coordinates;
      bounds.push([lat, lng]);

      const startMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #10b981;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            font-size: 16px;
          ">📍</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      }).addTo(map);

      startMarker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #10b981;">
            🏁 Starting Point
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${startingLocationFromSelections.name}</p>
          ${startingLocationFromSelections.description ? `<p style="margin: 0; font-size: 12px; color: #999;">${startingLocationFromSelections.description}</p>` : ''}
        </div>
      `);
    }

    // Add markers for each stop
    let attractionCounter = 0; // Counter for actual attractions (not starting point)
    
    optimizedOrder.forEach((stop, index) => {
      // Skip the starting location if we already rendered it
      if (stop.placeId === 'start-location' && hasStartingLocation) {
        return;
      }

      attractionCounter++; // Increment only for actual attractions
      
      const selection = selections.find((s) => s.id === stop.placeId);
      if (!selection) return;

      const { lat, lng } = selection.coordinates;
      bounds.push([lat, lng]);

      // Display number: 1, 2, 3... for attractions (starting point has no number)
      const displayIndex = attractionCounter;
      
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${index === optimizedOrder.length - 1 ? '#ef4444' : '#3b82f6'};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${displayIndex}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
            ${displayIndex}. ${selection.name}
          </h3>
          ${selection.description ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${selection.description}</p>` : ''}
          <p style="margin: 0; font-size: 12px; color: #999;">
            ${selection.city || ''} ${selection.country || ''}
          </p>
        </div>
      `);
    });

    // Draw polylines if available
    if (routeGeometryLegs.length > 0) {
      routeGeometryLegs.forEach((leg) => {
        if (leg.polyline) {
          try {
            const coords = polyline.decode(leg.polyline);
            const latlngs: L.LatLngExpression[] = coords.map(([lat, lng]: [number, number]) => [lat, lng]);
            
            const color = leg.travelType === 'transit' ? '#8b5cf6' : 
                         leg.travelType === 'walking' ? '#10b981' : 
                         leg.travelType === 'cycling' ? '#f59e0b' : '#3b82f6';

            L.polyline(latlngs, {
              color,
              weight: 4,
              opacity: 0.7,
            }).addTo(map);
          } catch (e) {
            console.warn('Failed to decode polyline:', e);
          }
        }
      });
    } else {
      // Draw straight lines if no polylines
      for (let i = 0; i < optimizedOrder.length - 1; i++) {
        const from = selections.find((s) => s.id === optimizedOrder[i].placeId);
        const to = selections.find((s) => s.id === optimizedOrder[i + 1].placeId);
        
        if (from && to) {
          L.polyline(
            [
              [from.coordinates.lat, from.coordinates.lng],
              [to.coordinates.lat, to.coordinates.lng],
            ],
            {
              color: '#3b82f6',
              weight: 3,
              opacity: 0.6,
              dashArray: '10, 5',
            }
          ).addTo(map);
        }
      }
    }

    // Fit map to bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // TODO: Call PDF export API
      alert('PDF export feature coming soon!');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    // TODO: Generate shareable link
    alert('Share feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(buildTripPlannerPath('discover'))}
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Discovery
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">Your Optimized Route</h1>
            
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Stops</p>
                <p className="text-2xl font-bold text-gray-900">{optimizedOrder.length || selections.length || 0}</p>
              </div>
              <MapPin className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{totalDuration}m</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="text-2xl font-bold text-gray-900">{totalDistance} km</p>
              </div>
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Est. Cost</p>
                <p className="text-2xl font-bold text-gray-900">${totalCost}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Itinerary Timeline
          </h2>

          <div className="space-y-6">
            {/* Starting Location - Show first if it exists */}
            {startingLocationFromSelections && (
              <div className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    📍
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      🏁 {startingLocationFromSelections.name}
                    </h3>
                    {startingLocationFromSelections.description && (
                      <p className="text-sm text-gray-600 mb-2">{startingLocationFromSelections.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Starting Point
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {timeline
              .filter(entry => !(entry.placeId === 'start-location' && hasStartingLocation))
              .map((entry, attractionIndex) => {
                const originalIndex = timeline.findIndex(e => e.placeId === entry.placeId);
                const selection = selections.find((s) => s.id === entry.placeId);
                const leg = legs[originalIndex - 1];
                
                // Display number: 1, 2, 3... for attractions (starting point handled separately above)
                const displayNumber = attractionIndex + 1;

              return (
                <div key={entry.placeId} className="relative">
                  {/* Travel Segment (if not first) */}
                  {leg && (
                    <div className="ml-8 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-medium capitalize">{leg.travelType}</span>
                        <span className="mx-2">•</span>
                        <span>{(leg.travelTimeSeconds / 60).toFixed(0)} min</span>
                        <span className="mx-2">•</span>
                        <span>{(leg.distanceMeters / 1000).toFixed(2)} km</span>
                        {leg.cost > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>${leg.cost.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      {leg.steps && leg.steps.length > 1 && (
                        <div className="text-xs text-gray-500">
                          {leg.steps.length} steps • {leg.provider === 'transport-service' ? '✅ Real-time' : '⚠️ Estimated'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stop */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        originalIndex === timeline.length - 1 ? 'bg-red-500' : 'bg-indigo-500'
                      }`}>
                        {displayNumber}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{selection?.name}</h3>
                          {selection?.description && (
                            <p className="text-sm text-gray-600 mt-1">{selection.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(entry.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span>Visit: {entry.visitDurationMinutes} min</span>
                          </div>
                        </div>

                        {selection?.imageUrl && (
                          <img
                            src={selection.imageUrl}
                            alt={selection.name}
                            className="w-20 h-20 object-cover rounded-lg ml-4"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Info */}
        {response.summary && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Starts At</p>
                <p className="font-medium">{new Date(response.summary.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ends At</p>
                <p className="font-medium">{new Date(response.summary.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Visit Time</p>
                <p className="font-medium">{response.summary.totalVisitMinutes} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Travel Time</p>
                <p className="font-medium">{response.summary.totalTravelMinutes} min</p>
              </div>
            </div>

            {response.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">{response.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
