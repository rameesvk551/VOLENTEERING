/**
 * TransportDrawer - Top-to-Bottom Drawer (Sticks to bottom like OptimizeModal)
 * Slides DOWN from top with transition
 * Shows non-editable location/destination and dummy transport options
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, Bus, Train, Plane, Clock, ArrowRight } from 'lucide-react';

export interface TransportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  startingLocation: { lat: number; lng: number; address: string } | null;
  selectedDate: string;
  searchedPlace: string;
  onSubmit: (data: {
    startLocation: { lat: number; lng: number; address: string };
    destination: { lat: number; lng: number; address: string };
    date: string;
    transportMode: 'bus' | 'train' | 'flight';
    useDummyData: boolean;
  }) => void;
  onOpenHotelDrawer?: (data: {
    destination: string;
    checkInDate: string;
    transportMode: 'bus' | 'train' | 'flight';
    transportName: string;
  }) => void;
  onSkip?: () => void; // Skip transport selection and go to next step
}

const TRANSPORT_OPTIONS = [
  { value: 'bus' as const, label: 'Bus', icon: Bus, color: 'bg-blue-600 text-white' },
  { value: 'train' as const, label: 'Train', icon: Train, color: 'bg-green-600 text-white' },
  { value: 'flight' as const, label: 'Flight', icon: Plane, color: 'bg-purple-600 text-white' },
];

// Dummy transport data - Extended
const DUMMY_TRANSPORT_DATA = {
  bus: [
    { id: 1, name: 'Express Bus Service', time: '2h 30m', price: '$25', departure: '09:00 AM', arrival: '11:30 AM' },
    { id: 2, name: 'Comfort Sleeper', time: '3h 15m', price: '$35', departure: '10:30 AM', arrival: '01:45 PM' },
    { id: 3, name: 'City Express', time: '2h 45m', price: '$20', departure: '02:00 PM', arrival: '04:45 PM' },
    { id: 4, name: 'Premium Coach', time: '2h 20m', price: '$40', departure: '04:30 PM', arrival: '06:50 PM' },
    { id: 5, name: 'Night Rider', time: '3h 00m', price: '$28', departure: '11:00 PM', arrival: '02:00 AM' },
    { id: 6, name: 'Luxury Express', time: '2h 15m', price: '$45', departure: '06:00 AM', arrival: '08:15 AM' },
  ],
  train: [
    { id: 1, name: 'High Speed Express', time: '1h 45m', price: '$45', departure: '08:00 AM', arrival: '09:45 AM' },
    { id: 2, name: 'Regional Train', time: '2h 20m', price: '$30', departure: '11:00 AM', arrival: '01:20 PM' },
    { id: 3, name: 'Intercity Express', time: '2h 00m', price: '$38', departure: '03:30 PM', arrival: '05:30 PM' },
    { id: 4, name: 'Bullet Train', time: '1h 30m', price: '$65', departure: '07:00 AM', arrival: '08:30 AM' },
    { id: 5, name: 'Super Express', time: '1h 50m', price: '$50', departure: '01:00 PM', arrival: '02:50 PM' },
    { id: 6, name: 'Night Train', time: '2h 30m', price: '$35', departure: '10:00 PM', arrival: '12:30 AM' },
    { id: 7, name: 'Metro Express', time: '2h 10m', price: '$32', departure: '09:30 AM', arrival: '11:40 AM' },
  ],
  flight: [
    { id: 1, name: 'Direct Flight', time: '1h 15m', price: '$120', departure: '07:30 AM', arrival: '08:45 AM' },
    { id: 2, name: 'Economy Plus', time: '1h 20m', price: '$95', departure: '12:00 PM', arrival: '01:20 PM' },
    { id: 3, name: 'Budget Air', time: '1h 30m', price: '$85', departure: '05:00 PM', arrival: '06:30 PM' },
    { id: 4, name: 'Premium Airlines', time: '1h 10m', price: '$150', departure: '06:00 AM', arrival: '07:10 AM' },
    { id: 5, name: 'Sky Express', time: '1h 25m', price: '$110', departure: '09:00 AM', arrival: '10:25 AM' },
    { id: 6, name: 'Low Cost Carrier', time: '1h 35m', price: '$75', departure: '03:00 PM', arrival: '04:35 PM' },
    { id: 7, name: 'Business Class', time: '1h 15m', price: '$200', departure: '08:00 AM', arrival: '09:15 AM' },
    { id: 8, name: 'Red Eye Flight', time: '1h 20m', price: '$90', departure: '11:30 PM', arrival: '12:50 AM' },
  ],
};

export const TransportDrawer: React.FC<TransportDrawerProps> = ({
  isOpen,
  onClose,
  startingLocation,
  selectedDate,
  searchedPlace,
  onOpenHotelDrawer,
  onSkip,
  // onSubmit - not used for now, showing dummy data
}) => {
  const [selectedTransport, setSelectedTransport] = useState<'bus' | 'train' | 'flight'>('bus');
  const [showResults, setShowResults] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Emoji/icon map to avoid inline type-narrowing comparisons
  const TRANSPORT_EMOJI: Record<'bus' | 'train' | 'flight', string> = {
    bus: '🚌',
    train: '🚆',
    flight: '✈️',
  };

  // Reset showResults when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowResults(false);
    }
  }, [isOpen]);

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

  // Lock body scroll when drawer open
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

  // Touch handlers for swipe-to-dismiss (downward swipe to close)
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

  const transportResults = DUMMY_TRANSPORT_DATA[selectedTransport];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - sticks to bottom, slides DOWN from top */}
      <div
        ref={drawerRef}
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 transition-transform duration-300 ease-out"
        style={{
          transform: isDragging ? `translateY(${currentY}px)` : 'translateY(0)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] md:w-full md:max-w-lg md:mx-4 flex flex-col overflow-hidden">
          {/* Swipe handle - only visible on mobile */}
          <div className="bg-white pt-2 pb-1 flex justify-center md:hidden flex-shrink-0">
            <div className="w-12 h-1 bg-slate-300 rounded-full" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="bg-white px-4 md:px-6 pb-2 md:pb-3 md:pt-4 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
            <h2 id="drawer-title" className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              Find Transport
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Transport Mode Selection - Sticky at top when scrolling */}
          <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-3 flex-shrink-0">
            <fieldset>
              <legend className="text-sm sm:text-base font-semibold text-slate-900 mb-1.5">
                Select transport mode
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {TRANSPORT_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedTransport(value);
                      setShowResults(true); // Auto-show results when changing transport mode
                    }}
                    className={`
                      flex flex-col items-center justify-center gap-1.5 p-3 border-2 rounded-xl transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                      ${selectedTransport === value
                        ? `${color} border-transparent shadow-md scale-105`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                    aria-pressed={selectedTransport === value}
                    aria-label={`${label} transport`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-3 md:p-4 space-y-3 sm:space-y-3.5">
            {/* Starting Location - Display Only - Hide when results shown */}
            {!showResults && (
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Starting location
                </label>
                <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  {startingLocation?.address || 'Not specified'}
                </div>
              </div>
            )}

            {/* Destination - Display Only - Hide when results shown */}
            {!showResults && (
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Destination
                </label>
                <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  {searchedPlace || 'Not specified'}
                </div>
              </div>
            )}

            {/* Date - Display Only - Hide when results shown */}
            {!showResults && (
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Travel date
                </label>
                <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                  {selectedDate}
                </div>
              </div>
            )}

            {/* Find Routes Button - Only show if results not yet shown */}
            {!showResults && (
              <button
                type="button"
                onClick={() => setShowResults(true)}
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Find Routes
              </button>
            )}

            {/* Dummy Transport Results - Show when button clicked */}
            {showResults && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  {React.createElement(TRANSPORT_OPTIONS.find(t => t.value === selectedTransport)!.icon, { className: 'w-5 h-5' })}
                  Available {TRANSPORT_OPTIONS.find(t => t.value === selectedTransport)?.label} Options
                </h3>
                
                {transportResults.map((option) => (
                  // Special flight-styled card
                  selectedTransport === 'flight' ? (
                    <div key={option.id} className="w-full bg-white border-2 border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      {/* Top row: carrier pill + route/date */}
                      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center gap-2 bg-red-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                            <span className="w-4 h-4 inline-flex items-center justify-center">✈️</span>
                            <span className="uppercase">{option.name.split(' ')[0]}</span>
                          </div>
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">{(startingLocation?.address || 'FROM').split(',')[0]} </span>
                            <span className="text-slate-400">›</span>
                            <span className="font-semibold text-slate-800"> {searchedPlace || 'TO'}</span>
                            <span className="inline-block ml-2">• {selectedDate}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-800"
                          aria-label="Expand"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>

                      {/* Middle: times and transfer info */}
                      <div className="px-4 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-slate-900">{option.departure}</div>
                          <div className="text-sm text-slate-500 text-center">
                            <div className="mb-1 text-slate-400">{option.time}</div>
                            <div className="inline-flex items-center gap-2 text-slate-600">
                              <Plane className="w-4 h-4" />
                              <span className="text-sm">Non-stop</span>
                            </div>
                          </div>
                          <div className="text-xl font-bold text-slate-900">{option.arrival}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200" />

                      {/* Bottom: price and reserve */}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-slate-700">
                          <div className="text-base font-semibold text-slate-900">{option.price}</div>
                          <div className="text-xs text-slate-500">Total</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenHotelDrawer) {
                              onOpenHotelDrawer({
                                destination: searchedPlace,
                                checkInDate: selectedDate,
                                transportMode: selectedTransport,
                                transportName: option.name,
                              });
                            } else {
                              alert(`Reserved: ${option.name} — ${option.price}`);
                              onClose();
                            }
                          }}
                          className="bg-slate-900 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-800"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        console.log('Transport option clicked:', option.name);
                        console.log('onOpenHotelDrawer exists?', !!onOpenHotelDrawer);

                        if (onOpenHotelDrawer) {
                          console.log('Opening HotelDrawer with data:', {
                            destination: searchedPlace,
                            checkInDate: selectedDate,
                            transportMode: selectedTransport,
                            transportName: option.name,
                          });
                          onOpenHotelDrawer({
                            destination: searchedPlace,
                            checkInDate: selectedDate,
                            transportMode: selectedTransport,
                            transportName: option.name,
                          });
                        } else {
                          console.log('onOpenHotelDrawer not provided, showing alert');
                          alert(`Selected: ${option.name} - ${option.price}`);
                          onClose();
                        }
                      }}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left flex items-start gap-4"
                    >
                      {/* Left: Icon/thumbnail */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-lg">{TRANSPORT_EMOJI[selectedTransport]}</span>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900">{option.name}</h4>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{option.price}</div>
                            <div className="text-xs text-slate-500">per ticket</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{option.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.departure}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-medium">{option.arrival}</span>
                          </div>
                        </div>

                        <div className="text-sm text-slate-500">{option.name} — {option.time} • Departs {option.departure}</div>
                      </div>
                    </button>
                  )
                ))}
              </div>
            )}

            {/* Skip & Continue button - Only show if onSkip is provided */}
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Skip & Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {/* Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
