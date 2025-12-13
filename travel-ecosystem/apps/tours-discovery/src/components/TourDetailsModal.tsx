import React, { useState } from 'react';
import { 
  X, Star, Clock, MapPin, Users, Check, AlertCircle, 
  ExternalLink, Globe, Calendar, DollarSign 
} from 'lucide-react';
import { Tour } from '../types/tour.types';
import { tourApi } from '../services/tourApi.service';

interface TourDetailsModalProps {
  tour: Tour;
  onClose: () => void;
}

export const TourDetailsModal: React.FC<TourDetailsModalProps> = ({ tour, onClose }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBookNow = async () => {
    setIsRedirecting(true);
    
    try {
      const response = await tourApi.generateRedirect(
        tour.provider.id,
        tour.provider.productId
      );
      
      if (response.success && response.data.redirectUrl) {
        // Track analytics event (intent captured)
        console.log('Redirect intent:', response.data.intentId);
        
        // Open in new tab
        window.open(response.data.redirectUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to generate redirect:', error);
      alert('Failed to redirect to booking page. Please try again.');
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        <div className="relative h-64">
          {tour.images[0] ? (
            <img
              src={tour.images[0].url}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Provider Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-white px-4 py-2 rounded-lg font-semibold shadow-lg">
              {tour.provider.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{tour.title}</h2>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{tour.rating.average.toFixed(1)}</span>
                <span className="text-gray-500">
                  ({tour.rating.count.toLocaleString()} reviews)
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{tour.location.city}, {tour.location.country}</span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="font-semibold">{tour.duration.displayText}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Languages</div>
                <div className="font-semibold">{tour.languages.slice(0, 2).join(', ')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Availability</div>
                <div className="font-semibold">
                  {tour.availability.isAvailable ? 'Available' : 'Sold Out'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xs text-gray-500">Price</div>
                <div className="font-semibold text-blue-600">{tour.price.displayPrice}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{tour.description}</p>
          </div>

          {/* Highlights */}
          {tour.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tour.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Inclusions */}
            {tour.inclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 text-green-700">
                  ✓ What's Included
                </h3>
                <ul className="space-y-2">
                  {tour.inclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {tour.exclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 text-red-700">
                  ✗ What's Not Included
                </h3>
                <ul className="space-y-2">
                  {tour.exclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Cancellation Policy</h3>
                <p className="text-sm text-blue-800">
                  {tour.cancellation.policy || 
                    (tour.cancellation.allowed 
                      ? `Free cancellation up to ${tour.cancellation.cutoffHours} hours before the tour`
                      : 'Non-refundable'
                    )
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Book Now Button */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">From</div>
                <div className="text-3xl font-bold text-blue-600">
                  {tour.price.displayPrice}
                </div>
                {tour.price.originalAmount && (
                  <div className="text-sm text-gray-500 line-through">
                    ${tour.price.originalAmount}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleBookNow}
                disabled={!tour.availability.isAvailable || isRedirecting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors disabled:cursor-not-allowed"
              >
                {isRedirecting ? (
                  'Redirecting...'
                ) : (
                  <>
                    Book Now on {tour.provider.name}
                    <ExternalLink className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            
            {tour.availability.spotsLeft && tour.availability.spotsLeft < 10 && (
              <div className="mt-2 text-sm text-orange-600 font-medium">
                ⚠️ Only {tour.availability.spotsLeft} spots left!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
