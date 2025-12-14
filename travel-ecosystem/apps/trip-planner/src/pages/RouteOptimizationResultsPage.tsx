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
  ChevronDown,
  ChevronUp,
  Bus,
  Train,
  X,
} from 'lucide-react';
import { buildTripPlannerPath } from '../utils/navigation';

// Leaflet for map rendering
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

// Transit Step Detail Modal Component
interface TransitStep {
  mode: string;
  from?: string;
  to?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  route?: string;
  routeColor?: string;
  departureTime?: string;
  arrivalTime?: string;
  stops?: number;
}

interface TransitDetailModalProps {
  step: TransitStep;
  isOpen: boolean;
  onClose: () => void;
}

const TransitDetailModal: React.FC<TransitDetailModalProps> = ({ step, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getModeIcon = (mode: string) => {
    const m = mode?.toLowerCase() || '';
    if (m === 'bus') return '🚌';
    if (m === 'metro_rail' || m === 'subway' || m === 'metro') return '🚇';
    if (m === 'rail' || m === 'train') return '🚆';
    if (m === 'tram') return '🚊';
    if (m === 'ferry') return '⛴️';
    if (m === 'walking') return '🚶';
    if (m === 'driving') return '🚗';
    return '🚌';
  };

  const getModeColor = (mode: string) => {
    const m = mode?.toLowerCase() || '';
    if (m === 'bus') return 'bg-blue-500';
    if (m === 'metro_rail' || m === 'subway' || m === 'metro') return 'bg-purple-500';
    if (m === 'rail' || m === 'train') return 'bg-green-500';
    if (m === 'tram') return 'bg-orange-500';
    if (m === 'ferry') return 'bg-cyan-500';
    return 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color bar */}
        <div 
          className={`${step.routeColor ? '' : getModeColor(step.mode)} p-4 text-white`}
          style={step.routeColor ? { backgroundColor: step.routeColor } : {}}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getModeIcon(step.mode)}</span>
              <div>
                <h3 className="text-xl font-bold capitalize">
                  {step.mode?.toLowerCase().replace(/_/g, ' ')}
                </h3>
                {step.route && (
                  <p className="text-white/90 font-medium">{step.route}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Time */}
          {(step.departureTime || step.arrivalTime) && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Departure</p>
                <p className="text-lg font-bold text-gray-900">{step.departureTime || '--:--'}</p>
              </div>
              <div className="flex-1 px-4">
                <div className="h-0.5 bg-gray-300 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Arrival</p>
                <p className="text-lg font-bold text-gray-900">{step.arrivalTime || '--:--'}</p>
              </div>
            </div>
          )}

          {/* Route Info */}
          <div className="grid grid-cols-2 gap-3">
            {step.durationSeconds && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Duration</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(step.durationSeconds / 60)} min
                </p>
              </div>
            )}

            {step.distanceMeters && (
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Navigation className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Distance</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {(step.distanceMeters / 1000).toFixed(1)} km
                </p>
              </div>
            )}

            {step.stops && (
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Stops</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{step.stops} stops</p>
              </div>
            )}

            {step.route && (
              <div className="p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Bus className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Route</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">{step.route}</p>
              </div>
            )}
          </div>

          {/* From/To */}
          {(step.from || step.to) && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Route Details</h4>
              {step.from && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium">Boarding Point</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {/* Check if it's a coordinate string and show appropriate label */}
                      {step.from.includes(',') && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(step.from.replace(/\s/g, ''))
                        ? `📍 Location ${step.from.split(',')[0].slice(0, 7)}...`
                        : step.from}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Journey indicator */}
              <div className="flex items-center gap-3 pl-3">
                <div className="w-0.5 h-6 bg-gray-300 ml-[14px]" />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>↓</span>
                  <span>{step.stops ? `${step.stops} stops` : 'Direct'}</span>
                  <span>•</span>
                  <span>{Math.round((step.durationSeconds || 0) / 60)} min</span>
                </div>
              </div>
              
              {step.to && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium">Drop-off Point</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {step.to.includes(',') && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(step.to.replace(/\s/g, ''))
                        ? `📍 Location ${step.to.split(',')[0].slice(0, 7)}...`
                        : step.to}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RouteOptimizationResults() {
  const navigate = useNavigate();
  const snapshot = useRouteOptimizationStore((state) => state.snapshot);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTransitStep, setSelectedTransitStep] = useState<TransitStep | null>(null);
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
                        <span className="font-medium capitalize">
                          {/* Show actual transit mode from steps if available */}
                          {leg.steps && leg.steps.length > 0 && leg.steps[0].mode && 
                           !['fallback', 'driving'].includes(leg.steps[0].mode.toLowerCase())
                            ? leg.steps[0].mode.replace(/_/g, ' ')
                            : leg.travelType}
                        </span>
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
                      {/* Show transit steps details if available - CLICKABLE */}
                      {leg.steps && leg.steps.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {leg.steps.filter(step => step.mode && step.mode.toLowerCase() !== 'fallback').map((step, stepIdx) => {
                            const isTransit = ['bus', 'metro', 'metro_rail', 'subway', 'rail', 'train', 'tram', 'ferry'].includes(
                              (step.mode || '').toLowerCase()
                            );
                            return (
                              <button
                                key={stepIdx}
                                onClick={() => isTransit ? setSelectedTransitStep(step as TransitStep) : null}
                                className={`flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-2 rounded-lg w-full text-left transition-all ${
                                  isTransit 
                                    ? 'hover:bg-blue-50 hover:shadow-md cursor-pointer border border-transparent hover:border-blue-200' 
                                    : 'cursor-default'
                                }`}
                              >
                                <span className="text-lg">
                                  {step.mode?.toUpperCase() === 'BUS' ? '🚌' : 
                                   step.mode?.toUpperCase() === 'METRO_RAIL' || step.mode?.toUpperCase() === 'SUBWAY' || step.mode?.toUpperCase() === 'METRO' ? '🚇' :
                                   step.mode?.toUpperCase() === 'RAIL' || step.mode?.toUpperCase() === 'TRAIN' ? '🚆' :
                                   step.mode?.toUpperCase() === 'TRAM' ? '🚊' :
                                   step.mode?.toUpperCase() === 'FERRY' ? '⛴️' :
                                   step.mode?.toUpperCase() === 'WALKING' ? '🚶' :
                                   step.mode?.toUpperCase() === 'DRIVING' ? '🚗' : '🚌'}
                                </span>
                                <span className="capitalize font-medium">{step.mode?.toLowerCase().replace(/_/g, ' ')}</span>
                                {step.route && (
                                  <span 
                                    className="font-semibold px-2 py-0.5 rounded text-white text-xs"
                                    style={{ backgroundColor: step.routeColor || '#3b82f6' }}
                                  >
                                    {step.route}
                                  </span>
                                )}
                                <span className="text-gray-400 ml-auto">• {Math.round((step.durationSeconds || 0) / 60)} min</span>
                                {isTransit && (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            );
                          })}
                          <div className="text-xs text-gray-500 mt-1 px-1">
                            {leg.steps.length} steps • {leg.provider === 'transport-service' ? '✅ Real-time' : '⚠️ Estimated'}
                          </div>
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

      {/* Transit Detail Modal */}
      <TransitDetailModal
        step={selectedTransitStep || { mode: '' }}
        isOpen={!!selectedTransitStep}
        onClose={() => setSelectedTransitStep(null)}
      />
    </div>
  );
}
