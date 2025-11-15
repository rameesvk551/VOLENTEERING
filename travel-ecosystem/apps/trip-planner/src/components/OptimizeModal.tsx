/**
 * OptimizeModal - Bottom Sheet Modal
 * Mobile-first modal for selecting travel preferences before route optimization
 * Swipe-to-dismiss, spring animations, accessible
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Car, Bus, Bike, Footprints, Zap } from 'lucide-react';
import type { OptimizeModalProps } from '../types/trip-planner.types';
import type { TravelType } from '../types/trip-planner.types';

const TRAVEL_TYPE_OPTIONS = [
  { value: 'DRIVING' as TravelType, label: 'Drive', icon: Car, color: 'bg-blue-100 text-blue-700' },
  { value: 'PUBLIC_TRANSPORT' as TravelType, label: 'Public', icon: Bus, color: 'bg-green-100 text-green-700' },
  { value: 'CYCLING' as TravelType, label: 'Bike', icon: Bike, color: 'bg-yellow-100 text-yellow-700' },
  { value: 'WALKING' as TravelType, label: 'Walk', icon: Footprints, color: 'bg-purple-100 text-purple-700' },
  { value: 'E_SCOOTER' as TravelType, label: 'Scooter', icon: Zap, color: 'bg-orange-100 text-orange-700' }
];

export const OptimizeModal: React.FC<OptimizeModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onSubmit,
  isLoading = false
}) => {
  const [selectedTypes, setSelectedTypes] = useState<TravelType[]>(['PUBLIC_TRANSPORT', 'WALKING']);
  const [budget, setBudget] = useState<number>(50);
  const [includeRealtime, setIncludeRealtime] = useState(true);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
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

    onSubmit({
      travelTypes: selectedTypes,
      budget,
      includeRealtimeTransit: includeRealtime
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
        className="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out"
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
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Swipe handle */}
          <div className="sticky top-0 bg-white pt-2 pb-1 flex justify-center">
            <div className="w-12 h-1 bg-slate-300 rounded-full" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="sticky top-8 bg-white px-4 pb-3 flex items-center justify-between border-b border-slate-200">
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
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Travel type selection */}
            <fieldset>
              <legend className="text-base font-semibold text-slate-900 mb-3">
                Travel preferences
              </legend>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TRAVEL_TYPE_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleTravelType(value)}
                    className={`
                      flex flex-col items-center justify-center gap-2 p-3 rounded-lg
                      min-h-[48px] transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
                      ${selectedTypes.includes(value)
                        ? `${color} ring-2 ring-offset-1 ring-current font-semibold scale-105`
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }
                    `}
                    aria-pressed={selectedTypes.includes(value)}
                    aria-label={`${label} travel mode`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
              {selectedTypes.length === 0 && (
                <p className="text-sm text-red-600 mt-2" role="alert">
                  Please select at least one travel type
                </p>
              )}
            </fieldset>

            {/* Budget slider */}
            <div>
              <label htmlFor="budget-slider" className="block text-base font-semibold text-slate-900 mb-3">
                Budget
              </label>
              <div className="space-y-2">
                <input
                  id="budget-slider"
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  aria-valuemin={0}
                  aria-valuemax={200}
                  aria-valuenow={budget}
                  aria-label="Budget slider"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>$0</span>
                  <span className="font-semibold text-blue-600">${budget}</span>
                  <span>$200+</span>
                </div>
              </div>
            </div>

            {/* Live transit toggle */}
            <div className="flex items-start justify-between gap-3">
              <label htmlFor="realtime-toggle" className="flex-1 cursor-pointer">
                <span className="block text-base font-semibold text-slate-900 mb-1">
                  Include live transit
                </span>
                <span className="text-sm text-slate-600">
                  Get real-time arrival info and delays
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
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading || selectedTypes.length === 0}
                className={`
                  w-full py-4 rounded-xl font-semibold text-base
                  transition-all duration-200
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300
                  ${isLoading || selectedTypes.length === 0
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
                ) : (
                  'Optimize Route'
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
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
