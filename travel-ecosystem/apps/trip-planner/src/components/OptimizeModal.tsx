/**
 * OptimizeModal - Bottom Sheet Modal
 * Mobile-first modal for selecting travel preferences before route optimization
 * Swipe-to-dismiss, spring animations, accessible
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Car, Bus, Bike, Footprints, Calendar } from 'lucide-react';
import { PlaceAutocomplete } from '../../../../shared/ui';
import type { OptimizeModalProps } from '../types/trip-planner.types';
import type { TravelType } from '../types/trip-planner.types';

const TRAVEL_TYPE_OPTIONS = [
  { value: 'DRIVING' as TravelType, label: 'Drive', icon: Car, color: 'bg-blue-600 text-white' },
  { value: 'PUBLIC_TRANSPORT' as TravelType, label: 'Public', icon: Bus, color: 'bg-green-600 text-white' },
  { value: 'CYCLING' as TravelType, label: 'Bike', icon: Bike, color: 'bg-yellow-600 text-white' },
  { value: 'WALKING' as TravelType, label: 'Walk', icon: Footprints, color: 'bg-purple-600 text-white' },

];

export const OptimizeModal: React.FC<OptimizeModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onSubmit,
  isLoading = false,
  onOpenTransportDrawer
}) => {
  const [selectedTypes, setSelectedTypes] = useState<TravelType[]>(['PUBLIC_TRANSPORT', 'WALKING']);
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [includeRealtime, setIncludeRealtime] = useState(true);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleTravelType = (type: TravelType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) return;
    
    // Validate start location
    if (!startLocation) {
      setLocationError('Please select a starting location');
      return;
    }

    // Check if PUBLIC_TRANSPORT is selected - open TransportDrawer
    if (selectedTypes.includes('PUBLIC_TRANSPORT')) {
      console.log('Opening transport drawer with data:', {
        startLocation,
        selectedDate: startDate,
        selectedTypes
      });
      // Pass data to parent to open transport drawer
      if (onOpenTransportDrawer) {
        onOpenTransportDrawer({
          startLocation,
          selectedDate: startDate,
          selectedTypes
        });
      } else {
        console.error('onOpenTransportDrawer callback not provided!');
      }
      return;
    }

    // Default trip duration: 24 hours (1 day)
    const durationHours = 24;

    onSubmit({
      travelTypes: selectedTypes,
      startLocation: startLocation,
      tripDurationHours: durationHours,
      includeRealtimeTransit: includeRealtime,
      startTime: startDate
    });
  };

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) { // Only allow downward swipe
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) { // Threshold for dismiss
      onClose();
    }
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 transition-transform duration-300 ease-out"
        style={{
          transform: isDragging ? `translateY(${currentY}px)` : 'translateY(0)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto md:w-full md:max-w-lg md:mx-4">
          {/* Swipe handle - only visible on mobile */}
          <div className="sticky top-0 bg-white pt-2 pb-1 flex justify-center md:hidden">
            <div className="w-12 h-1 bg-slate-300 rounded-full" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="sticky top-8 md:top-0 bg-white px-4 md:px-6 pb-2 md:pb-3 md:pt-4 flex items-center justify-between border-b border-slate-200">
            <h2 id="modal-title" className="text-xl font-bold text-slate-900">
              Plan trip for {selectedCount} stop{selectedCount > 1 ? 's' : ''}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Form content */}
          <form onSubmit={handleSubmit} className="p-3 md:p-6 space-y-3 sm:space-y-5">
            {/* Travel type selection */}
            <fieldset>
              <legend className="text-sm sm:text-base font-semibold text-slate-900 mb-1.5 sm:mb-2">
                Travel preferences
              </legend>
              <div className="flex flex-row sm:grid sm:grid-cols-4 gap-0 sm:gap-3 w-full rounded-xl bg-slate-100">
                {TRAVEL_TYPE_OPTIONS.map(({ value, label, icon: Icon, color }, idx) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleTravelType(value)}
                    className={`
                      flex flex-col items-center justify-center gap-0 sm:gap-1.5 p-0 sm:p-4 border-2 transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                      ${selectedTypes.includes(value)
                        ? `${color} border-transparent shadow-md`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }
                      flex-1 min-w-0
                      ${idx === 0 ? 'rounded-l-xl sm:rounded-l-xl' : ''}
                      ${idx === TRAVEL_TYPE_OPTIONS.length - 1 ? 'rounded-r-xl sm:rounded-r-xl' : ''}
                    `}
                    aria-pressed={selectedTypes.includes(value)}
                    aria-label={`${label} travel mode`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <span className="text-xs sm:text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-sm text-red-600 mt-2" role="alert">
                  Please select at least one travel type
                </p>
              )}
            </fieldset>

            {/* Starting Location */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5 sm:mb-2">
                Starting location
              </label>
              <PlaceAutocomplete
                placeholder="Where will you start?"
                onSelect={(place) => {
                  setStartLocation({
                    lat: parseFloat(place.lat),
                    lng: parseFloat(place.lon),
                    address: place.display_name
                  });
                  setLocationError('');
                }}
                error={locationError}
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start-date" className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5 sm:mb-2">
                Start date
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-8 pr-2 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Live transit toggle */}
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="realtime-toggle" className="flex-1 cursor-pointer">
                <span className="block text-sm sm:text-base font-semibold text-slate-900">
                  Include live transit
                </span>
              </label>
              <button
                id="realtime-toggle"
                type="button"
                role="switch"
                aria-checked={includeRealtime}
                onClick={() => setIncludeRealtime(!includeRealtime)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors duration-200 ease-in-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  ${includeRealtime ? 'bg-blue-600' : 'bg-slate-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white
                    transition-transform duration-200 ease-in-out
                    ${includeRealtime ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Submit button */}
            <div className="space-y-1.5">
              <button
                type="submit"
                disabled={isLoading || selectedTypes.length === 0 || !startLocation}
                className={`
                  w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
                  ${isLoading || selectedTypes.length === 0 || !startLocation
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Optimizing route...
                  </span>
                ) : selectedTypes.includes('PUBLIC_TRANSPORT') ? (
                  'Select Transportation'
                ) : (
                  'Optimize Route'
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
