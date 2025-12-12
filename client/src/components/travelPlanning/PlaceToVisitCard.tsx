import React from 'react';
import { MapPin, Star } from 'lucide-react';

type AttractionProps = {
  attraction: {
    id: string;
    name: string;
    categories: string[];
    geocodes: {
      latitude: number;
      longitude: number;
    };
    location: {
      address?: string;
      country?: string;
      cross_street?: string;
      formatted_address?: string;
      locality?: string;
      postcode?: string;
      region?: string;
    };
  };
  isSelected?: boolean;
};

const PlaceToVisit = ({ attraction, isSelected = false }: AttractionProps) => {
  // Generate a consistent but varied image URL based on attraction name
  const imageId = Math.abs(attraction.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000;
  const imageUrl = `https://picsum.photos/seed/${imageId}/400/300`;

  // Get rating (simulated for demo)
  const rating = (4 + Math.random()).toFixed(1);

  return (
    <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative flex flex-col">
      {/* Image Container with Overlay */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
        <img
          src={imageUrl}
          alt={attraction.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/banner.png.jpg';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Selected
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-900">{rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Title */}
        <h2 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {attraction.name}
        </h2>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 flex-1">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2 leading-snug">
            {attraction.location?.formatted_address || 
             attraction.location?.locality || 
             "Location information not available"}
          </p>
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            {attraction.categories?.[0] || "Attraction"}
          </span>
          {isSelected && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              ✓ In trip
            </span>
          )}
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className={`absolute inset-0 border-4 rounded-2xl pointer-events-none transition-all ${
        isSelected 
          ? 'border-blue-500 opacity-100' 
          : 'border-transparent group-hover:border-blue-300 opacity-0 group-hover:opacity-100'
      }`}></div>
    </div>
  );
};

export default PlaceToVisit;

