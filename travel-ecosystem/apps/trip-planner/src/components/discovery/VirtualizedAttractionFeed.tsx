import React, { useCallback, useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DiscoveryEntity } from '../../hooks/useDiscovery';
import { ResultCard } from './ResultCard';
import { SelectionFAB } from '../SelectionFAB';
import { OptimizeModal } from '../OptimizeModal';
import { useOptimizeRouteMutation } from '../../hooks/useRouteOptimizer';
import { useTripStore, getSelectionIdForDestination } from '../../store/tripStore';
import type { TripDestination } from '../../store/tripStore';
import type { TravelType, OptimizeRouteRequest } from '../../types/trip-planner.types';
import { normalizePriority } from '../../utils/priority';
import { useRouteOptimizationStore } from '../../store/routeOptimizationStore';
import { buildTripPlannerPath } from '../../utils/navigation';

interface VirtualizedAttractionFeedProps {
  items: DiscoveryEntity[];
  onSelect?: (result: DiscoveryEntity) => void;
}

const SELECTION_IDS_KEY = 'tripPlanner:selectedAttractionIds';
const SELECTION_DETAILS_KEY = 'tripPlanner:selectedAttractionDetails';

const getStoredIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = window.localStorage.getItem(SELECTION_IDS_KEY);
    if (!saved) return new Set();
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch (error) {
    console.warn('Failed to parse stored attraction ids', error);
    return new Set();
  }
};

const getStoredDetails = (): Record<string, DiscoveryEntity> => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = window.localStorage.getItem(SELECTION_DETAILS_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Failed to parse stored attraction details', error);
    return {};
  }
};

const buildEntityFromDestination = (destination: TripDestination): DiscoveryEntity => {
  const selectionId = getSelectionIdForDestination(destination);
  return {
    id: selectionId,
    type: 'attraction',
    title: destination.name,
    description: destination.notes,
    location: {
      city: destination.country || '',
      country: destination.country || '',
      coordinates: destination.coordinates,
    },
    metadata: {
      category: [],
      tags: [],
      popularity: 0,
      cost: destination.estimatedCost ? `$${destination.estimatedCost}` : undefined,
      duration: `${destination.activities.length || 0} activities`,
    },
    media: {
      images: [],
    },
  };
};

export const VirtualizedAttractionFeed: React.FC<VirtualizedAttractionFeedProps> = ({ items, onSelect }) => {
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(() => getStoredIds());
  const [selectedDetails, setSelectedDetails] = useState<Record<string, DiscoveryEntity>>(() => getStoredDetails());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const destinations = useTripStore((state) => state.destinations);
  const navigate = useNavigate();
  const setOptimizationSnapshot = useRouteOptimizationStore((state) => state.setSnapshot);

  const { mutate: optimizeRoute, isPending: isOptimizing } = useOptimizeRouteMutation();
  // Auto-sync selections with saved trip destinations (based on discovery source id)
  useEffect(() => {
    if (destinations.length === 0) {
      return;
    }

    const selectionMap = destinations.reduce<Record<string, TripDestination>>((acc, destination) => {
      const selectionId = getSelectionIdForDestination(destination);
      acc[selectionId] = destination;
      return acc;
    }, {});

    setSelectedAttractions((prev) => {
      const next = new Set(prev);
      let changed = false;

      Object.keys(selectionMap).forEach((selectionId) => {
        if (!next.has(selectionId)) {
          next.add(selectionId);
          changed = true;
        }
      });

      // Remove selections that no longer have a destination backing them
      Array.from(next).forEach((selectionId) => {
        if (!selectionMap[selectionId]) {
          next.delete(selectionId);
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setSelectedDetails((prev) => {
      const next = { ...prev };
      let changed = false;

      Object.entries(selectionMap).forEach(([selectionId, destination]) => {
        if (next[selectionId]) {
          return;
        }

        const matchFromResults = items.find((item) => item.id === selectionId);
        if (matchFromResults) {
          next[selectionId] = matchFromResults;
        } else {
          next[selectionId] = buildEntityFromDestination(destination);
        }
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [destinations, items]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SELECTION_IDS_KEY, JSON.stringify(Array.from(selectedAttractions)));
  }, [selectedAttractions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SELECTION_DETAILS_KEY, JSON.stringify(selectedDetails));
  }, [selectedDetails]);

  const handleToggleSelection = useCallback((entity: DiscoveryEntity) => {
    setSelectedAttractions((prev) => {
      const newSet = new Set(prev);
      const isSelected = newSet.has(entity.id);

      if (isSelected) {
        newSet.delete(entity.id);
        setSelectedDetails((prevDetails) => {
          const { [entity.id]: _removed, ...rest } = prevDetails;
          return rest;
        });
        console.log('Deselected:', entity.id, 'Total selected:', newSet.size);
      } else {
        newSet.add(entity.id);
        setSelectedDetails((prevDetails) => ({
          ...prevDetails,
          [entity.id]: entity,
        }));
        console.log('Selected:', entity.id, 'Total selected:', newSet.size);
      }

      return newSet;
    });
  }, []);

  const handlePlanTrip = useCallback(() => {
    if (selectedAttractions.size === 0) {
      return;
    }
    console.log('Planning trip with selected attractions:', Array.from(selectedAttractions));
    setIsModalOpen(true);
  }, [selectedAttractions]);

  const handleOptimizeSubmit = useCallback((payload: {
    travelTypes: TravelType[];
    budget?: number;
    includeRealtimeTransit: boolean;
  }) => {
    // Get selected attraction details
  let selectedItems = items.filter(item => selectedAttractions.has(item.id));

    if (selectedItems.length < selectedAttractions.size) {
      const missingIds = Array.from(selectedAttractions).filter(
        (id) => !selectedItems.some((item) => item.id === id)
      );

      missingIds.forEach((id) => {
        const stored = selectedDetails[id];
        if (stored) {
          selectedItems = [...selectedItems, stored];
        }
      });
    }

    const validItems = selectedItems.filter((item) =>
      typeof item.location?.coordinates?.lat === 'number' &&
      typeof item.location?.coordinates?.lng === 'number'
    );

    if (validItems.length < 2) {
      alert('We need at least two attractions with valid coordinates to optimize a route.');
      return;
    }

    // Build optimization request payload
    const optimizeRequest: OptimizeRouteRequest = {
      userId: undefined, // Add user ID if authenticated
      places: validItems.map(item => ({
        id: item.id,
        name: item.title, // DiscoveryEntity uses 'title'
        lat: item.location.coordinates.lat,
        lng: item.location.coordinates.lng,
        imageUrl: item.media?.images?.[0],
        priority: normalizePriority(
          typeof item.metadata?.popularity === 'number'
            ? item.metadata.popularity * 10
            : undefined
        ), // Scale popularity to 1-10
        visitDuration: 60 // Default 60 minutes
      })),
      constraints: {
        startLocation: undefined, // Will use user's current location if available
        startTime: new Date().toISOString(),
        timeBudgetMinutes: 480, // 8 hours default
        travelTypes: payload.travelTypes,
        budget: payload.budget
      },
      options: {
        includeRealtimeTransit: payload.includeRealtimeTransit,
        algorithm: 'auto'
      }
    };

    console.log('📤 Sending optimization request:', optimizeRequest);

    // Call API
  const selectionSummaries = validItems.map((item) => ({
      id: item.id,
      name: item.title,
      description: item.description,
      city: item.location?.city,
      country: item.location?.country,
      coordinates: {
        lat: item.location?.coordinates?.lat ?? 0,
        lng: item.location?.coordinates?.lng ?? 0,
      },
      imageUrl: item.media?.images?.[0],
    }));

    optimizeRoute(optimizeRequest, {
      onSuccess: (data) => {
        console.log('✅ Route optimized successfully:', data);
        setOptimizationSnapshot({
          request: optimizeRequest,
          response: data,
          selections: selectionSummaries,
          createdAt: Date.now(),
        });
  setIsModalOpen(false);
  navigate(buildTripPlannerPath('route-optimizer'));
      },
      onError: (error) => {
        console.error('❌ Optimization failed:', error);
        alert(`Optimization failed: ${error.message}`);
      }
    });
  }, [selectedAttractions, items, optimizeRoute, selectedDetails, setOptimizationSnapshot, navigate]);

  if (!items || items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-gray-200 bg-white/60 p-12 text-center dark:border-gray-700 dark:bg-gray-900/60">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40">
          <Compass className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">No attractions found</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search to discover more places.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{items.length} attraction{items.length !== 1 ? 's' : ''}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Showing the best matches for your search.</p>
          </div>
          {selectedAttractions.size > 0 && (
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {selectedAttractions.size} selected
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((entity, index) => (
          <ResultCard
            key={entity.id}
            result={entity}
            index={index}
            onSelect={() => onSelect?.(entity)}
            isSelected={selectedAttractions.has(entity.id)}
            onToggleSelect={() => handleToggleSelection(entity)}
          />
        ))}
      </div>

      {/* Floating Action Button - triggers modal */}
      <SelectionFAB
        count={selectedAttractions.size}
        onClick={handlePlanTrip}
        disabled={isOptimizing}
      />

      {/* Optimization Modal - collects travel preferences */}
      <OptimizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCount={selectedAttractions.size}
        onSubmit={handleOptimizeSubmit}
        isLoading={isOptimizing}
      />
    </div>
  );
};
