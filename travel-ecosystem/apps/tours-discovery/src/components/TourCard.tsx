import React from 'react';
import { Clock, Star, MapPin, Tag, ExternalLink } from 'lucide-react';
import { Tour } from '../types/tour.types';

interface TourCardProps {
  tour: Tour;
  onViewDetails: (tour: Tour) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onViewDetails }) => {
  const primaryImage = tour.images.find((img) => img.isPrimary) || tour.images[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={tour.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onClick={() => onViewDetails(tour)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Provider Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {tour.provider.name}
          </span>
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            {tour.category.primary}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={() => onViewDetails(tour)}>
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {tour.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{tour.location.city}, {tour.location.country}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{tour.rating.average.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({tour.rating.count.toLocaleString()} reviews)
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock className="w-4 h-4" />
          <span>{tour.duration.displayText}</span>
        </div>

        {/* Short Description */}
        {tour.shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {tour.shortDescription}
          </p>
        )}

        {/* Tags */}
        {tour.category.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tour.category.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {tour.category.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{tour.category.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <div className="text-sm text-gray-500">From</div>
            <div className="text-2xl font-bold text-blue-600">
              {tour.price.displayPrice}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(tour);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Details
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Cancellation Policy */}
        {tour.cancellation.allowed && (
          <div className="mt-2 text-xs text-green-600">
            ✓ {tour.cancellation.policy || 'Free cancellation available'}
          </div>
        )}
      </div>
    </div>
  );
};
