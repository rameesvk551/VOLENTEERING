/**
 * HotelDrawer - Top-to-Bottom Drawer (Sticks to bottom like TransportDrawer)
 * Slides DOWN from top with transition
 * Shows hotel options after transport selection
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, MapPin, Calendar, Bus, Train, Plane, Star, DollarSign, TrendingUp, Crown, Wifi, Waves, Dumbbell, Coffee, Car, ArrowRight } from 'lucide-react';

export interface HotelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  checkInDate: string;
  transportMode: 'bus' | 'train' | 'flight';
  onSubmit?: (hotelData: any) => void;
  onSkip?: () => void; // Skip hotel selection and go to next step
}

const HOTEL_CATEGORIES = [
  { value: 'budget' as const, label: 'Budget', icon: DollarSign, color: 'bg-green-600 text-white', priceRange: '$50-$100/night' },
  { value: 'midrange' as const, label: 'Mid-Range', icon: TrendingUp, color: 'bg-blue-600 text-white', priceRange: '$100-$200/night' },
  { value: 'luxury' as const, label: 'Luxury', icon: Crown, color: 'bg-purple-600 text-white', priceRange: '$200+/night' },
];

const TRANSPORT_ICONS = {
  bus: Bus,
  train: Train,
  flight: Plane,
};

// Dummy hotel data - Extended
const DUMMY_HOTEL_DATA = {
  budget: [
    { 
      id: 1, 
      name: 'Comfort Inn Downtown', 
      price: '$65', 
      rating: 3.5, 
      amenities: ['wifi', 'parking', 'breakfast'],
      distance: '0.5 km from center',
      image: 'hotel-1.jpg'
    },
    { 
      id: 2, 
      name: 'City Budget Hotel', 
      price: '$55', 
      rating: 3.0, 
      amenities: ['wifi', 'parking'],
      distance: '1.2 km from center',
      image: 'hotel-2.jpg'
    },
    { 
      id: 3, 
      name: 'Traveler\'s Rest', 
      price: '$70', 
      rating: 4.0, 
      amenities: ['wifi', 'breakfast', 'gym'],
      distance: '0.8 km from center',
      image: 'hotel-3.jpg'
    },
    { 
      id: 4, 
      name: 'Economy Lodge', 
      price: '$50', 
      rating: 3.0, 
      amenities: ['wifi', 'parking'],
      distance: '2.0 km from center',
      image: 'hotel-4.jpg'
    },
    { 
      id: 5, 
      name: 'Value Inn Express', 
      price: '$80', 
      rating: 3.5, 
      amenities: ['wifi', 'breakfast', 'parking'],
      distance: '1.5 km from center',
      image: 'hotel-5.jpg'
    },
    { 
      id: 6, 
      name: 'Smart Stay Hotel', 
      price: '$75', 
      rating: 4.0, 
      amenities: ['wifi', 'gym', 'breakfast'],
      distance: '1.0 km from center',
      image: 'hotel-6.jpg'
    },
  ],
  midrange: [
    { 
      id: 1, 
      name: 'Grand Plaza Hotel', 
      price: '$145', 
      rating: 4.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.3 km from center',
      image: 'hotel-7.jpg'
    },
    { 
      id: 2, 
      name: 'Riverside Suites', 
      price: '$130', 
      rating: 4.5, 
      amenities: ['wifi', 'pool', 'breakfast', 'gym'],
      distance: '0.6 km from center',
      image: 'hotel-8.jpg'
    },
    { 
      id: 3, 
      name: 'Central Park Inn', 
      price: '$155', 
      rating: 4.0, 
      amenities: ['wifi', 'gym', 'breakfast', 'parking'],
      distance: '0.4 km from center',
      image: 'hotel-9.jpg'
    },
    { 
      id: 4, 
      name: 'Metropolitan Hotel', 
      price: '$165', 
      rating: 4.5, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast'],
      distance: '0.5 km from center',
      image: 'hotel-10.jpg'
    },
    { 
      id: 5, 
      name: 'Skyline Business Hotel', 
      price: '$140', 
      rating: 4.0, 
      amenities: ['wifi', 'gym', 'breakfast', 'parking'],
      distance: '0.9 km from center',
      image: 'hotel-11.jpg'
    },
    { 
      id: 6, 
      name: 'Garden View Resort', 
      price: '$175', 
      rating: 4.5, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.7 km from center',
      image: 'hotel-12.jpg'
    },
    { 
      id: 7, 
      name: 'Urban Oasis Hotel', 
      price: '$150', 
      rating: 4.0, 
      amenities: ['wifi', 'pool', 'breakfast', 'gym'],
      distance: '0.8 km from center',
      image: 'hotel-13.jpg'
    },
  ],
  luxury: [
    { 
      id: 1, 
      name: 'Royal Palace Hotel', 
      price: '$350', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.2 km from center',
      image: 'hotel-14.jpg',
      features: ['Spa', 'Concierge', 'Fine Dining']
    },
    { 
      id: 2, 
      name: 'Diamond Suites & Spa', 
      price: '$425', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.1 km from center',
      image: 'hotel-15.jpg',
      features: ['Spa', 'Concierge', 'Rooftop Bar']
    },
    { 
      id: 3, 
      name: 'Platinum Tower', 
      price: '$280', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast'],
      distance: '0.4 km from center',
      image: 'hotel-16.jpg',
      features: ['Concierge', 'Fine Dining']
    },
    { 
      id: 4, 
      name: 'Elite Grand Resort', 
      price: '$500', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.3 km from center',
      image: 'hotel-17.jpg',
      features: ['Spa', 'Concierge', 'Fine Dining', 'Butler Service']
    },
    { 
      id: 5, 
      name: 'Prestige Hotel & Casino', 
      price: '$320', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.5 km from center',
      image: 'hotel-18.jpg',
      features: ['Casino', 'Spa', 'Fine Dining']
    },
    { 
      id: 6, 
      name: 'Imperial Crown Suites', 
      price: '$380', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.2 km from center',
      image: 'hotel-19.jpg',
      features: ['Spa', 'Concierge', 'Private Chef']
    },
    { 
      id: 7, 
      name: 'Monarch Luxury Hotel', 
      price: '$295', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast'],
      distance: '0.6 km from center',
      image: 'hotel-20.jpg',
      features: ['Spa', 'Fine Dining', 'Rooftop Pool']
    },
    { 
      id: 8, 
      name: 'Opulent Towers & Residences', 
      price: '$450', 
      rating: 5.0, 
      amenities: ['wifi', 'pool', 'gym', 'breakfast', 'parking'],
      distance: '0.1 km from center',
      image: 'hotel-21.jpg',
      features: ['Spa', 'Concierge', 'Fine Dining', 'Helipad']
    },
  ],
};

const AMENITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  wifi: Wifi,
  pool: Waves,
  gym: Dumbbell,
  breakfast: Coffee,
  parking: Car,
};

export const HotelDrawer: React.FC<HotelDrawerProps> = ({
  isOpen,
  onClose,
  destination,
  checkInDate,
  transportMode,
  onSubmit,
  onSkip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'budget' | 'midrange' | 'luxury'>('budget');
  const [showResults, setShowResults] = useState(true); // Auto-show results
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Auto-show Budget hotels when drawer opens
  useEffect(() => {
    if (isOpen) {
      setShowResults(true);
      setSelectedCategory('budget');
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

  const handleHotelSelect = (hotel: any) => {
    alert(`Selected: ${hotel.name} - ${hotel.price}/night`);
    if (onSubmit) {
      onSubmit(hotel);
    }
    onClose();
  };

  if (!isOpen) return null;

  const hotelResults = DUMMY_HOTEL_DATA[selectedCategory];
  const TransportIcon = TRANSPORT_ICONS[transportMode];

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
              <Building2 className="w-5 h-5 text-blue-600" />
              Find Hotels
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

          {/* Display Fields - Non-editable */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 md:px-4 py-3 flex-shrink-0 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4" />
                Destination:
              </span>
              <span className="font-semibold text-slate-900">{destination}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-4 h-4" />
                Check-in:
              </span>
              <span className="font-semibold text-slate-900">{checkInDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <TransportIcon className="w-4 h-4" />
                Transport:
              </span>
              <span className="font-semibold text-slate-900 capitalize">{transportMode}</span>
            </div>
          </div>

          {/* Hotel Category Selection - Sticky at top when scrolling */}
          <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-3 flex-shrink-0">
            <fieldset>
              <legend className="text-sm sm:text-base font-semibold text-slate-900 mb-1.5">
                Select hotel category
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {HOTEL_CATEGORIES.map(({ value, label, icon: Icon, color, priceRange }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(value);
                      setShowResults(true); // Auto-show results when changing category
                    }}
                    className={`
                      flex flex-col items-center justify-center gap-1.5 p-3 border-2 rounded-xl transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                      ${selectedCategory === value
                        ? `${color} border-transparent shadow-md scale-105`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                    aria-pressed={selectedCategory === value}
                    aria-label={`${label} hotels ${priceRange}`}
                    title={priceRange}
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
              {/* Hotel Results - Auto-shown */}
              {showResults && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    {React.createElement(HOTEL_CATEGORIES.find(c => c.value === selectedCategory)!.icon, { className: 'w-5 h-5' })}
                    {HOTEL_CATEGORIES.find(c => c.value === selectedCategory)?.label} Hotels
                    <span className="text-xs text-slate-500 font-normal">
                      ({HOTEL_CATEGORIES.find(c => c.value === selectedCategory)?.priceRange})
                    </span>
                  </h3>
                  
                  {hotelResults.map((hotel) => (
                    <button
                      key={hotel.id}
                      type="button"
                      onClick={() => handleHotelSelect(hotel)}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left flex items-start gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {/* if images exist in public/images use them, otherwise show placeholder */}
                        <img
                          src={`/images/${hotel.image}`}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback styling if image not found
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="p-2">{/* intentionally empty: image or blank */}</div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 mb-0">{hotel.name}</h4>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{hotel.price}</div>
                            <div className="text-xs text-slate-500">/night</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                          {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                          {hotel.rating % 1 !== 0 && <Star className="w-3.5 h-3.5 fill-current opacity-50" />}
                          <span className="text-xs text-slate-600 ml-1">({hotel.rating})</span>
                        </div>

                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {hotel.amenities.map((amenity) => {
                            const AmenityIcon = AMENITY_ICONS[amenity];
                            return AmenityIcon ? (
                              <div key={amenity} className="flex items-center gap-1 text-slate-600" title={amenity}>
                                <AmenityIcon className="w-4 h-4" />
                              </div>
                            ) : null;
                          })}
                        </div>

                        {selectedCategory === 'luxury' && (hotel as any).features && (
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {(hotel as any).features.map((feature: string) => (
                              <span key={feature} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.distance}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Skip & Continue button - Only show if onSkip is provided */}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>Skip & Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {/* Cancel button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm sm:text-base"
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
