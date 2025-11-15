/**
 * TripPlannerPage - Main page component
 * Mobile-first attraction selection → route optimization → transport selection → PDF generation
 */

import React, { useState } from 'react';
import { AttractionCard, AttractionCardSkeleton } from '../components/AttractionCard';
import { SelectionFAB } from '../components/SelectionFAB';
import { OptimizeModal } from '../components/OptimizeModal';
import { LegOptionsList } from '../components/LegOptionsList';
import { SelectedPlanSummary } from '../components/SelectedPlanSummary';
import { useAttractions, useOptimizeRoute, useBatchMultiModalRoutes, useGeneratePDF } from '../hooks/useTripPlannerAPI';
import { normalizePriority } from '../utils/priority';
import type { Attraction, Leg, TravelType } from '../types/trip-planner.types';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface TripPlannerPageProps {
  city: string;
  country: string;
}

export const TripPlannerPage: React.FC<TripPlannerPageProps> = ({ city, country }) => {
  // State
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optimizedOrder, setOptimizedOrder] = useState<Array<{ placeId: string; seq: number }>>([]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [showOptimizedView, setShowOptimizedView] = useState(false);

  // API hooks
  const { data: attractionsData, isLoading: isLoadingAttractions } = useAttractions(city, country);
  const { mutateAsync: optimizeRoute, isPending: isOptimizing } = useOptimizeRoute();
  const { mutateAsync: fetchTransportOptions, isPending: isFetchingTransport } = useBatchMultiModalRoutes();
  const { mutateAsync: generatePDF, isPending: isGeneratingPDF } = useGeneratePDF();

  const attractions = attractionsData?.attractions || [];

  // Handle attraction selection
  const handleToggleAttraction = (id: string) => {
    setSelectedPlaceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle optimize route submission
  const handleOptimize = async (payload: {
    travelTypes: TravelType[];
    budget?: number;
    includeRealtimeTransit: boolean;
    startTime?: string;
  }) => {
    try {
      const selectedAttractions = attractions.filter(a => selectedPlaceIds.has(a.id));
      
      const optimizeRequest = {
        userId: undefined, // Add user ID if authenticated
        places: selectedAttractions.map(a => ({
          id: a.id,
          name: a.name,
          lat: a.latitude,
          lng: a.longitude,
          imageUrl: a.imageUrl,
          priority: normalizePriority(a.priority),
          visitDuration: a.visitDurationMinutes
        })),
        constraints: {
          startTime: payload.startTime || new Date().toISOString(),
          travelTypes: payload.travelTypes,
          budget: payload.budget,
          timeBudgetMinutes: 480 // 8 hours default
        },
        options: {
          includeRealtimeTransit: payload.includeRealtimeTransit,
          algorithm: 'auto'
        }
      };

      const result = await optimizeRoute(optimizeRequest);
      setOptimizedOrder(result.optimizedOrder);
      setIsModalOpen(false);

      // Fetch transport options for each leg
      await fetchTransportOptionsForLegs(result.optimizedOrder, selectedAttractions, payload);

      setShowOptimizedView(true);
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Failed to optimize route. Please try again.');
    }
  };

  // Fetch transport options for all legs
  const fetchTransportOptionsForLegs = async (
    order: Array<{ placeId: string; seq: number }>,
    attractionsList: Attraction[],
    preferences: { travelTypes: TravelType[]; includeRealtimeTransit: boolean }
  ) => {
    const sortedOrder = [...order].sort((a, b) => a.seq - b.seq);
    const transportRequests = [];
    const newLegs: Leg[] = [];

    for (let i = 0; i < sortedOrder.length - 1; i++) {
      const fromPlace = attractionsList.find(a => a.id === sortedOrder[i].placeId);
      const toPlace = attractionsList.find(a => a.id === sortedOrder[i + 1].placeId);

      if (fromPlace && toPlace) {
        const legId = `leg-${i}`;
        newLegs.push({
          legId,
          from: fromPlace.id,
          to: toPlace.id,
          fromName: fromPlace.name,
          toName: toPlace.name,
          options: []
        });

        transportRequests.push({
          from: { lat: fromPlace.latitude, lng: fromPlace.longitude },
          to: { lat: toPlace.latitude, lng: toPlace.longitude },
          departureTime: new Date().toISOString(),
          modes: preferences.travelTypes,
          preferences: {
            maxWalkMeters: 800
          }
        });
      }
    }

    setLegs(newLegs);

    try {
      const transportResults = await fetchTransportOptions(transportRequests);

      // Merge transport options into legs
      const updatedLegs = newLegs.map((leg, idx) => ({
        ...leg,
        options: transportResults[idx]?.options || []
      }));

      setLegs(updatedLegs);
    } catch (error) {
      console.error('Failed to fetch transport options:', error);
    }
  };

  // Handle transport option selection
  const handleSelectTransport = (legId: string, optionMode: string) => {
    setLegs(prev => prev.map(leg => 
      leg.legId === legId ? { ...leg, selectedOptionId: optionMode } : leg
    ));
  };

  // Calculate totals
  const totalDuration = legs.reduce((sum, leg) => {
    const selected = leg.options.find(opt => opt.mode === leg.selectedOptionId);
    return sum + (selected?.durationMinutes || 0);
  }, 0);

  const totalCost = legs.reduce((sum, leg) => {
    const selected = leg.options.find(opt => opt.mode === leg.selectedOptionId);
    return sum + (selected?.cost || 0);
  }, 0);

  const allLegsSelected = legs.length > 0 && legs.every(leg => leg.selectedOptionId);

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!allLegsSelected) {
      alert('Please select transport for all legs before generating PDF');
      return;
    }

    try {
      const pdfRequest = {
        tripName: `${city} Trip`,
        optimizedOrder,
        legs: legs.map(leg => {
          const selected = leg.options.find(opt => opt.mode === leg.selectedOptionId);
          return {
            from: leg.from,
            to: leg.to,
            selectedMode: selected?.mode || '',
            optionId: selected?.mode || '',
            departure: selected?.steps?.[0]?.startTime || new Date().toISOString(),
            arrival: selected?.steps?.[selected.steps.length - 1]?.endTime || new Date().toISOString(),
            cost: selected?.cost || 0
          };
        }),
        images: attractions.filter(a => selectedPlaceIds.has(a.id)).map(a => a.imageUrl || ''),
        format: 'A4' as const,
        locale: 'en_US'
      };

      const result = await generatePDF(pdfRequest);
      
      // Open PDF in new tab
      window.open(result.pdfUrl, '_blank');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!showOptimizedView) {
    // Attraction selection view
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{city}, {country}</h1>
              {selectedPlaceIds.size > 0 && (
                <p className="text-sm text-slate-600 mt-0.5">
                  {selectedPlaceIds.size} attraction{selectedPlaceIds.size > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          {isLoadingAttractions ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map(i => <AttractionCardSkeleton key={i} />)}
            </div>
          ) : attractions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 pb-24">
              {attractions.map(attraction => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  isSelected={selectedPlaceIds.has(attraction.id)}
                  onToggle={handleToggleAttraction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-700 mb-1">No attractions found</h2>
              <p className="text-slate-500">Try a different destination</p>
            </div>
          )}
        </main>

        {/* FAB */}
        <SelectionFAB
          count={selectedPlaceIds.size}
          onClick={() => setIsModalOpen(true)}
        />

        {/* Optimize modal */}
        <OptimizeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedCount={selectedPlaceIds.size}
          onSubmit={handleOptimize}
          isLoading={isOptimizing}
        />
      </div>
    );
  }

  // Optimized route view
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowOptimizedView(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-slate-900">Optimized Route</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Status banner */}
        {isFetchingTransport && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-900">Fetching transport options...</p>
          </div>
        )}

        {allLegsSelected && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-900 font-medium">All legs configured! Ready to generate PDF.</p>
          </div>
        )}

        {/* Legs */}
        <div className="space-y-6">
          {legs.map((leg, idx) => (
            <div key={leg.legId} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Leg {idx + 1}</h2>
              </div>
              <LegOptionsList
                leg={leg}
                onSelectOption={handleSelectTransport}
                isLoading={isFetchingTransport}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Summary footer */}
      {legs.length > 0 && (
        <SelectedPlanSummary
          totalDurationMinutes={totalDuration}
          totalCost={totalCost}
          onGeneratePDF={handleGeneratePDF}
          isGenerating={isGeneratingPDF}
        />
      )}
    </div>
  );
};
